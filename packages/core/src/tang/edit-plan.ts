import { z } from "zod";
import type { EditorEngine } from "../engine.js";
import { clipDurationFrames, clipEndFrame, type Project } from "../types.js";

const frameRangeSchema = z.object({
  startFrame: z.number().int().min(0),
  endFrame: z.number().int().positive(),
}).strict().refine((value) => value.endFrame > value.startFrame, {
  message: "endFrame must be greater than startFrame",
});

const chapterScopeSchema = z.object({ chapterId: z.string().min(1) }).strict();

export const plannedOperationSchema = z.object({
  id: z.string().min(1),
  rpcMethod: z.string().min(1),
  params: z.record(z.unknown()),
  rationale: z.string().min(1),
  affectedRangeEstimate: frameRangeSchema.optional(),
  evidenceRefs: z.array(z.string().min(1)).default([]),
}).strict();

export const editPlanSchema = z.object({
  planId: z.string().min(1),
  projectId: z.string().min(1),
  basedOnRevision: z.number().int().min(0),
  briefId: z.string().min(1).optional(),
  scope: z.union([frameRangeSchema, chapterScopeSchema]),
  operations: z.array(plannedOperationSchema).min(1).max(100),
  expectedEffects: z.array(z.string().min(1)).default([]),
  qaChecks: z.array(z.string().min(1)).default([]),
  riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
}).strict();

export type EditPlan = z.infer<typeof editPlanSchema>;
export type PlannedOperation = z.infer<typeof plannedOperationSchema>;

export type PlannedOperationParser = (
  rpcMethod: string,
  params: Record<string, unknown>,
) => Record<string, unknown>;

/**
 * EditPlan v1 intentionally accepts only deterministic editor mutations whose
 * arguments can be validated without invoking their handler. File/network/
 * render/transcribe/job/project-lifecycle operations remain outside coherent
 * EditPlan batches until a later task defines their recovery semantics.
 */
export const EDIT_PLAN_MUTATION_METHODS = new Set([
  "add_track", "remove_track", "reorder_track", "set_track_properties",
  "add_clip", "add_clips", "append_clip", "add_adjustment_clip", "insert_clip",
  "move_clip", "move_clips", "trim_clip", "split_clip", "cut_range",
  "ripple_delete_ranges", "remove_clip", "link_clips", "unlink_clip",
  "set_clip_speed", "set_clip_volume", "set_clip_fade", "color_grade", "crop_clip",
  "apply_lut", "apply_color", "apply_effect", "remove_effect", "clear_clip_effects",
  "set_clip_transform", "set_keyframes", "clear_keyframes", "set_transition",
  "remove_transition", "set_audio_offset", "add_text", "set_text_style",
  "set_text_window", "set_graphic_window", "set_caption_cue", "animate_text",
  "remove_text", "clear_text", "set_caption_style", "clear_captions",
  "remove_graphic", "clear_graphics", "set_music", "remove_music",
  "set_project_settings", "set_markers", "delete_transcript_ranges",
]);

interface ResolvedScope {
  kind: "range" | "chapter";
  startFrame: number;
  endFrame: number;
  chapterId?: string;
}

interface OperationPrediction {
  clipIds: string[];
  assetIds: string[];
  trackIndexes: number[];
  ranges: Array<{ startFrame: number; endFrame: number }>;
}

export interface EditPlanDryRunResult {
  ok: true;
  dryRun: true;
  planId: string;
  projectId: string;
  basedOnRevision: number;
  currentRevision: number;
  riskLevel: EditPlan["riskLevel"];
  scope: ResolvedScope;
  expectedEffects: string[];
  qaChecks: string[];
  operationCount: number;
  operations: Array<{
    id: string;
    rpcMethod: string;
    rationale: string;
    evidenceRefs: string[];
    prediction: OperationPrediction;
  }>;
  prediction: OperationPrediction;
}

/** Validate and predict an EditPlan without invoking any mutation handler. */
export function dryRunEditPlan(
  engine: EditorEngine,
  rawPlan: unknown,
  parseOperation: PlannedOperationParser,
): EditPlanDryRunResult {
  const plan = editPlanSchema.parse(rawPlan);
  const project = engine.getProject();

  if (plan.projectId !== project.id) {
    throw new Error(
      `EditPlan projectId mismatch: plan targets "${plan.projectId}" but current project is "${project.id}". Rebuild the plan from current project state.`,
    );
  }
  if (plan.basedOnRevision !== project.revision) {
    throw new Error(
      `STALE_EDIT_PLAN: basedOnRevision=${plan.basedOnRevision}, currentRevision=${project.revision}. Re-resolve and rebuild the plan before mutation.`,
    );
  }

  const scope = resolveScope(engine, plan);
  const operations = plan.operations.map((operation) => {
    if (!EDIT_PLAN_MUTATION_METHODS.has(operation.rpcMethod)) {
      throw new Error(
        `RPC method "${operation.rpcMethod}" is not supported inside EditPlan v1. Use deterministic timeline/edit mutations only; run file/render/transcribe/job/project-lifecycle operations separately.`,
      );
    }
    const parsedParams = parseOperation(operation.rpcMethod, operation.params);
    validateOperationAgainstProject(project, operation.rpcMethod, parsedParams);
    const prediction = predictOperation(project, scope, operation, parsedParams);
    return {
      id: operation.id,
      rpcMethod: operation.rpcMethod,
      rationale: operation.rationale,
      evidenceRefs: [...operation.evidenceRefs],
      prediction,
    };
  });

  return {
    ok: true,
    dryRun: true,
    planId: plan.planId,
    projectId: plan.projectId,
    basedOnRevision: plan.basedOnRevision,
    currentRevision: project.revision,
    riskLevel: plan.riskLevel,
    scope,
    expectedEffects: [...plan.expectedEffects],
    qaChecks: [...plan.qaChecks],
    operationCount: operations.length,
    operations,
    prediction: mergePredictions(operations.map((operation) => operation.prediction)),
  };
}

function resolveScope(engine: EditorEngine, plan: EditPlan): ResolvedScope {
  if ("chapterId" in plan.scope) {
    const chapterId = plan.scope.chapterId;
    const metadata = engine.getTangMetadataForNavigation();
    const status = engine.getTangMetadataStatus();
    if (!metadata || metadata.basedOnRevision !== plan.basedOnRevision || status.state !== "valid") {
      throw new Error(
        `EditPlan chapter scope "${chapterId}" is unavailable or stale. Rebuild the derived chapter index at the current revision before planning a mutation.`,
      );
    }
    const readModel = metadata.readModel as { chapters?: unknown } | undefined;
    const chapters = Array.isArray(readModel?.chapters) ? readModel.chapters : [];
    const chapter = chapters.find((value) => {
      if (!value || typeof value !== "object") return false;
      return (value as { id?: unknown }).id === chapterId;
    }) as { id: string; startFrame?: unknown; endFrame?: unknown } | undefined;
    if (!chapter || !Number.isInteger(chapter.startFrame) || !Number.isInteger(chapter.endFrame)) {
      throw new Error(`Unknown or invalid chapterId "${chapterId}" in current Tang read model.`);
    }
    const startFrame = chapter.startFrame as number;
    const endFrame = chapter.endFrame as number;
    assertFrameRange(startFrame, endFrame, `chapter "${chapterId}"`);
    return { kind: "chapter", chapterId, startFrame, endFrame };
  }

  assertFrameRange(plan.scope.startFrame, plan.scope.endFrame, "plan scope");
  return { kind: "range", startFrame: plan.scope.startFrame, endFrame: plan.scope.endFrame };
}

function validateOperationAgainstProject(
  project: Project,
  rpcMethod: string,
  params: Record<string, unknown>,
): void {
  const clipMap = new Map(project.tracks.flatMap((track) => track.clips.map((clip) => [clip.id, clip] as const)));
  const assetMap = new Map(project.assets.map((asset) => [asset.id, asset] as const));
  const trackIndexes = new Set(project.tracks.map((track) => track.index));

  walkParams(params, (key, value, container) => {
    if ((key === "clipId" || key.endsWith("ClipId")) && typeof value === "string") {
      if (!clipMap.has(value)) throw new Error(`Unknown ${key} "${value}" in EditPlan operation "${rpcMethod}".`);
    }
    if (key === "clipIds" && Array.isArray(value)) {
      for (const id of value) {
        if (typeof id !== "string" || !clipMap.has(id)) {
          throw new Error(`Unknown clipId "${String(id)}" in EditPlan operation "${rpcMethod}".`);
        }
      }
    }
    if ((key === "assetId" || key.endsWith("AssetId")) && typeof value === "string") {
      if (!assetMap.has(value)) throw new Error(`Unknown ${key} "${value}" in EditPlan operation "${rpcMethod}".`);
    }
    if (key === "trackIndex" && typeof value === "number" && !trackIndexes.has(value)) {
      throw new Error(`Unknown trackIndex ${value} in EditPlan operation "${rpcMethod}".`);
    }

    if (key === "startFrame" && typeof value === "number") {
      const endFrame = container.endFrame;
      if (typeof endFrame === "number") assertFrameRange(value, endFrame, `operation "${rpcMethod}"`);
    }
    if (key === "sourceInFrame" && typeof value === "number") {
      const sourceOutFrame = container.sourceOutFrame;
      if (typeof sourceOutFrame === "number" && sourceOutFrame <= value) {
        throw new Error(`Invalid source range in EditPlan operation "${rpcMethod}": sourceOutFrame must be greater than sourceInFrame.`);
      }
    }
  });

  if (rpcMethod === "reorder_track") {
    const newIndex = params.newIndex;
    if (typeof newIndex === "number" && (newIndex < 0 || newIndex >= project.tracks.length)) {
      throw new Error(`Invalid newIndex ${newIndex} in reorder_track; project has ${project.tracks.length} tracks.`);
    }
  }

  if (rpcMethod === "split_clip" || rpcMethod === "cut_range") {
    const clipId = params.clipId;
    if (typeof clipId === "string") {
      const clip = clipMap.get(clipId);
      if (!clip) return;
      const duration = clipDurationFrames(clip);
      if (rpcMethod === "split_clip") {
        const atFrame = params.atFrame;
        if (typeof atFrame === "number" && (atFrame <= 0 || atFrame >= duration)) {
          throw new Error(`split_clip atFrame ${atFrame} is outside clip "${clipId}" duration ${duration}.`);
        }
      } else {
        const startFrame = params.startFrame;
        const endFrame = params.endFrame;
        if (
          typeof startFrame === "number" && typeof endFrame === "number" &&
          (startFrame < 0 || endFrame <= startFrame || endFrame > duration)
        ) {
          throw new Error(`cut_range [${startFrame}, ${endFrame}) is outside clip "${clipId}" duration ${duration}.`);
        }
      }
    }
  }
}

function predictOperation(
  project: Project,
  scope: ResolvedScope,
  operation: PlannedOperation,
  params: Record<string, unknown>,
): OperationPrediction {
  const clipMap = new Map(project.tracks.flatMap((track) => track.clips.map((clip) => [clip.id, clip] as const)));
  const clipIds = new Set<string>();
  const assetIds = new Set<string>();
  const trackIndexes = new Set<number>();
  const ranges: Array<{ startFrame: number; endFrame: number }> = [];

  walkParams(params, (key, value, container) => {
    if ((key === "clipId" || key.endsWith("ClipId")) && typeof value === "string") clipIds.add(value);
    if (key === "clipIds" && Array.isArray(value)) {
      for (const id of value) if (typeof id === "string") clipIds.add(id);
    }
    if ((key === "assetId" || key.endsWith("AssetId")) && typeof value === "string") assetIds.add(value);
    if (key === "trackIndex" && typeof value === "number") trackIndexes.add(value);
    if (key === "startFrame" && typeof value === "number" && typeof container.endFrame === "number") {
      ranges.push({ startFrame: value, endFrame: container.endFrame as number });
    }
  });

  for (const clipId of clipIds) {
    const clip = clipMap.get(clipId);
    if (clip) ranges.push({ startFrame: clip.startFrame, endFrame: clipEndFrame(clip) });
  }
  if (operation.affectedRangeEstimate) ranges.push({ ...operation.affectedRangeEstimate });
  if (ranges.length === 0) ranges.push({ startFrame: scope.startFrame, endFrame: scope.endFrame });

  return {
    clipIds: [...clipIds].sort(),
    assetIds: [...assetIds].sort(),
    trackIndexes: [...trackIndexes].sort((a, b) => a - b),
    ranges: normalizeRanges(ranges),
  };
}

function mergePredictions(predictions: OperationPrediction[]): OperationPrediction {
  const clipIds = new Set<string>();
  const assetIds = new Set<string>();
  const trackIndexes = new Set<number>();
  const ranges: Array<{ startFrame: number; endFrame: number }> = [];
  for (const prediction of predictions) {
    prediction.clipIds.forEach((id) => clipIds.add(id));
    prediction.assetIds.forEach((id) => assetIds.add(id));
    prediction.trackIndexes.forEach((index) => trackIndexes.add(index));
    ranges.push(...prediction.ranges);
  }
  return {
    clipIds: [...clipIds].sort(),
    assetIds: [...assetIds].sort(),
    trackIndexes: [...trackIndexes].sort((a, b) => a - b),
    ranges: normalizeRanges(ranges),
  };
}

function normalizeRanges(ranges: Array<{ startFrame: number; endFrame: number }>) {
  const valid = ranges
    .filter((range) => Number.isInteger(range.startFrame) && Number.isInteger(range.endFrame) && range.endFrame > range.startFrame)
    .map((range) => ({ startFrame: range.startFrame, endFrame: range.endFrame }))
    .sort((a, b) => a.startFrame - b.startFrame || a.endFrame - b.endFrame);
  const merged: Array<{ startFrame: number; endFrame: number }> = [];
  for (const range of valid) {
    const last = merged.at(-1);
    if (last && range.startFrame <= last.endFrame) last.endFrame = Math.max(last.endFrame, range.endFrame);
    else merged.push({ ...range });
  }
  return merged;
}

function walkParams(
  value: unknown,
  visit: (key: string, value: unknown, container: Record<string, unknown>) => void,
): void {
  if (Array.isArray(value)) {
    for (const item of value) walkParams(item, visit);
    return;
  }
  if (!value || typeof value !== "object") return;
  const container = value as Record<string, unknown>;
  for (const [key, child] of Object.entries(container)) {
    visit(key, child, container);
    walkParams(child, visit);
  }
}

function assertFrameRange(startFrame: number, endFrame: number, label: string): void {
  if (!Number.isInteger(startFrame) || !Number.isInteger(endFrame) || startFrame < 0 || endFrame <= startFrame) {
    throw new Error(`Invalid ${label} frame range [${startFrame}, ${endFrame}); expected non-negative integers with endFrame > startFrame.`);
  }
}
