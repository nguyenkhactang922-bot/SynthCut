import { randomUUID } from "node:crypto";
import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { EditorEngine } from "../engine.js";
import { runFfprobe } from "../ffmpeg/executor.js";
import { EDIT_BATCH_ID_PATTERN, type EditBatchResult } from "./batch.js";

export type QaVerificationMode = "post_batch" | "final_delivery";
export type QaVerdict = "pass" | "fail" | "stale";

export interface RunQaVerificationInput {
  projectId: string;
  basedOnRevision: number;
  mode?: QaVerificationMode;
  batchId?: string;
  frameSeconds?: number[];
  deliveryPath?: string;
  requireAudio?: boolean;
}

export interface MediaProbeFacts {
  path: string;
  duration: number | null;
  formatName: string | null;
  sizeBytes: number | null;
  video: null | {
    codec: string | null;
    width: number | null;
    height: number | null;
    frameRate: string | null;
  };
  audio: null | {
    codec: string | null;
    sampleRate: number | null;
    channels: number | null;
  };
}

export interface QaEvidenceRecord {
  schemaVersion: 1;
  qaId: string;
  evidenceRef: string;
  projectId: string;
  basedOnRevision: number;
  observedRevision: number;
  mode: QaVerificationMode;
  batchId?: string;
  batchResultRef?: string;
  createdAt: string;
  completedAt: string;
  verdict: QaVerdict;
  accepted: boolean;
  structural: {
    pass: boolean;
    trackCount: number;
    clipCount: number;
    durationFrames: number;
    issues: string[];
  };
  renderedFrames: Array<{
    atSeconds: number;
    artifactRef: string;
    sourcePath: string;
  }>;
  preview?: {
    path: string;
    probe: MediaProbeFacts;
  };
  delivery?: {
    path: string;
    probe: MediaProbeFacts;
    checks: {
      durationMatches: boolean;
      canvasMatches: boolean;
      audioPresentWhenRequired: boolean;
    };
  };
  failures: string[];
  nextAction:
    | { kind: "continue" }
    | { kind: "replan"; reason: string }
    | { kind: "restore_batch"; batchId: string; reason: string };
}

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  sample_rate?: string;
  channels?: number;
}

interface FfprobeData {
  streams?: FfprobeStream[];
  format?: { duration?: string; format_name?: string; size?: string };
}

const QA_REF_PATTERN = /^tang-evidence:(qa-[0-9a-f-]+)\/record\.json$/i;

export async function runQaVerification(
  engine: EditorEngine,
  input: RunQaVerificationInput,
): Promise<QaEvidenceRecord> {
  const mode = input.mode ?? "post_batch";
  if (mode === "final_delivery" && !input.deliveryPath) {
    throw new Error("final_delivery QA requires deliveryPath");
  }
  if (input.batchId && !EDIT_BATCH_ID_PATTERN.test(input.batchId)) {
    throw new Error(`Invalid edit batch id "${input.batchId}".`);
  }

  const qaId = `qa-${randomUUID()}`;
  const dir = join(engine.dataDir, "tang-evidence", qaId);
  mkdirSync(dir, { recursive: true });
  const evidenceRef = `tang-evidence:${qaId}/record.json`;
  const createdAt = new Date().toISOString();
  const project = engine.getProject();
  const observedRevision = project.revision;
  const failures: string[] = [];

  const structural = inspectStructure(engine);
  failures.push(...structural.issues.map((issue) => `STRUCTURAL: ${issue}`));

  let batchResult: EditBatchResult | undefined;
  if (input.batchId) {
    try {
      batchResult = readBatchResult(engine, input.batchId);
      if (batchResult.projectId !== input.projectId) {
        failures.push(`BATCH: projectId ${batchResult.projectId} != ${input.projectId}`);
      }
      if (batchResult.status !== "done") {
        failures.push(`BATCH: status ${batchResult.status} is not done`);
      }
      if (batchResult.projectRevisionAfter !== input.basedOnRevision) {
        failures.push(
          `BATCH: revision ${batchResult.projectRevisionAfter} != expected ${input.basedOnRevision}`,
        );
      }
    } catch (error) {
      failures.push(`BATCH: ${errorMessage(error)}`);
    }
  }

  const stale = project.id !== input.projectId || observedRevision !== input.basedOnRevision;
  if (project.id !== input.projectId) failures.push(`STALE: projectId ${project.id} != ${input.projectId}`);
  if (observedRevision !== input.basedOnRevision) {
    failures.push(`STALE: revision ${observedRevision} != ${input.basedOnRevision}`);
  }

  const renderedFrames: QaEvidenceRecord["renderedFrames"] = [];
  let preview: QaEvidenceRecord["preview"];
  let delivery: QaEvidenceRecord["delivery"];

  if (!stale && structural.pass) {
    const frameSeconds = resolveFrameSeconds(engine, input.frameSeconds, batchResult);
    for (let index = 0; index < frameSeconds.length; index += 1) {
      const atSeconds = frameSeconds[index]!;
      try {
        const sourcePath = await engine.renderFrame(atSeconds);
        const fileName = `frame-${String(index + 1).padStart(2, "0")}.png`;
        const durablePath = join(dir, fileName);
        copyFileSync(sourcePath, durablePath);
        renderedFrames.push({
          atSeconds,
          artifactRef: `tang-evidence:${qaId}/${fileName}`,
          sourcePath,
        });
      } catch (error) {
        failures.push(`FRAME@${atSeconds.toFixed(3)}: ${errorMessage(error)}`);
      }
    }

    try {
      const result = await engine.renderPreview();
      preview = { path: result.path, probe: await probeMedia(result.path) };
    } catch (error) {
      failures.push(`PREVIEW: ${errorMessage(error)}`);
    }

    if (input.deliveryPath) {
      try {
        const probe = await probeMedia(input.deliveryPath);
        const durationTolerance = Math.max(0.25, 3 / Math.max(1, project.fps));
        const expectedDuration = engine.timelineDuration();
        const durationMatches =
          probe.duration !== null && Math.abs(probe.duration - expectedDuration) <= durationTolerance;
        const canvasMatches =
          !!probe.video && probe.video.width === project.width && probe.video.height === project.height;
        const requireAudio = input.requireAudio ?? project.assets.some((asset) => asset.hasAudio);
        const audioPresentWhenRequired = !requireAudio || !!probe.audio;
        if (!durationMatches) {
          failures.push(
            `DELIVERY: duration ${String(probe.duration)} does not match ${expectedDuration.toFixed(3)}s ± ${durationTolerance.toFixed(3)}s`,
          );
        }
        if (!canvasMatches) {
          failures.push(
            `DELIVERY: canvas ${probe.video?.width ?? "?"}x${probe.video?.height ?? "?"} != ${project.width}x${project.height}`,
          );
        }
        if (!audioPresentWhenRequired) failures.push("DELIVERY: expected audio stream is missing");
        delivery = {
          path: input.deliveryPath,
          probe,
          checks: { durationMatches, canvasMatches, audioPresentWhenRequired },
        };
      } catch (error) {
        failures.push(`DELIVERY: ${errorMessage(error)}`);
      }
    }
  }

  if (!stale && structural.pass && renderedFrames.length === 0) {
    failures.push("FRAME: no rendered frame evidence was produced");
  }
  if (!stale && structural.pass && !preview) failures.push("PREVIEW: preview evidence missing");
  if (mode === "final_delivery" && !delivery) failures.push("DELIVERY: delivery evidence missing");

  const verdict: QaVerdict = stale ? "stale" : failures.length === 0 ? "pass" : "fail";
  const record: QaEvidenceRecord = {
    schemaVersion: 1,
    qaId,
    evidenceRef,
    projectId: input.projectId,
    basedOnRevision: input.basedOnRevision,
    observedRevision,
    mode,
    ...(input.batchId ? { batchId: input.batchId } : {}),
    ...(batchResult ? { batchResultRef: batchResult.resultRef } : {}),
    createdAt,
    completedAt: new Date().toISOString(),
    verdict,
    accepted: verdict === "pass",
    structural,
    renderedFrames,
    ...(preview ? { preview } : {}),
    ...(delivery ? { delivery } : {}),
    failures,
    nextAction:
      verdict === "pass"
        ? { kind: "continue" }
        : verdict === "stale"
          ? { kind: "replan", reason: "QA binding is stale; reread the live project and rebuild the plan." }
          : input.batchId
            ? { kind: "restore_batch", batchId: input.batchId, reason: "QA failed after a checkpoint-backed batch." }
            : { kind: "replan", reason: "QA failed; correct/replan before acceptance." },
  };

  writeDurable(join(dir, "record.json"), JSON.stringify(record, null, 2));
  if (record.accepted) engine.recordTangBatchReferences({ evidenceRef });
  return record;
}

export function getQaEvidence(engine: EditorEngine, evidenceRef: string): QaEvidenceRecord {
  const match = QA_REF_PATTERN.exec(evidenceRef);
  if (!match) throw new Error(`Invalid QA evidence ref "${evidenceRef}".`);
  const path = join(engine.dataDir, "tang-evidence", match[1]!, "record.json");
  if (!existsSync(path)) throw new Error(`Unknown QA evidence ref "${evidenceRef}".`);
  const parsed = JSON.parse(readFileSync(path, "utf8")) as QaEvidenceRecord;
  if (parsed.schemaVersion !== 1 || parsed.evidenceRef !== evidenceRef) {
    throw new Error(`QA evidence record "${evidenceRef}" is invalid or mismatched.`);
  }
  return parsed;
}

function inspectStructure(engine: EditorEngine): QaEvidenceRecord["structural"] {
  const project = engine.getProject();
  const issues: string[] = [];
  const assetIds = new Set(project.assets.map((asset) => asset.id));
  const trackIndexes = new Set<number>();
  const clipIds = new Set<string>();
  let clipCount = 0;

  for (const track of project.tracks) {
    if (trackIndexes.has(track.index)) issues.push(`duplicate track index ${track.index}`);
    trackIndexes.add(track.index);
    for (const clip of track.clips) {
      clipCount += 1;
      if (clipIds.has(clip.id)) issues.push(`duplicate clip id ${clip.id}`);
      clipIds.add(clip.id);
      if (clip.startFrame < 0) issues.push(`clip ${clip.id} has negative startFrame`);
      if (clip.sourceOutFrame <= clip.sourceInFrame) {
        issues.push(`clip ${clip.id} has non-positive source range`);
      }
      if (!clip.adjustment && (!clip.assetId || !assetIds.has(clip.assetId))) {
        issues.push(`clip ${clip.id} references missing asset ${String(clip.assetId)}`);
      }
    }
  }
  if (clipCount === 0) issues.push("timeline has no clips");
  return {
    pass: issues.length === 0,
    trackCount: project.tracks.length,
    clipCount,
    durationFrames: engine.timelineDurationFrames(),
    issues,
  };
}

function resolveFrameSeconds(
  engine: EditorEngine,
  requested: number[] | undefined,
  batchResult: EditBatchResult | undefined,
): number[] {
  const total = engine.timelineDuration();
  const clamp = (seconds: number) => Math.min(Math.max(0, seconds), Math.max(0, total - 0.05));
  const values = requested?.length
    ? requested
    : batchResult?.affectedFrameRanges.length
      ? batchResult.affectedFrameRanges.slice(0, 4).map((range) => {
          const midpoint = (range.startFrame + range.endFrame) / 2;
          return midpoint / Math.max(1, engine.getProject().fps);
        })
      : [total / 2];
  return [...new Set(values.map(clamp).map((value) => Number(value.toFixed(3))))].slice(0, 8);
}

function readBatchResult(engine: EditorEngine, batchId: string): EditBatchResult {
  const path = join(engine.dataDir, "tang-batches", batchId, "result.json");
  if (!existsSync(path)) throw new Error(`batch result is unavailable for ${batchId}`);
  const parsed = JSON.parse(readFileSync(path, "utf8")) as EditBatchResult;
  if (parsed.schemaVersion !== 1 || parsed.batchId !== batchId) {
    throw new Error(`batch result is invalid or mismatched for ${batchId}`);
  }
  return parsed;
}

async function probeMedia(path: string): Promise<MediaProbeFacts> {
  const stdout = await runFfprobe([
    "-v",
    "error",
    "-show_entries",
    "format=duration,format_name,size:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
    "-of",
    "json",
    path,
  ]);
  const data = JSON.parse(stdout) as FfprobeData;
  const video = data.streams?.find((stream) => stream.codec_type === "video");
  const audio = data.streams?.find((stream) => stream.codec_type === "audio");
  const numberOrNull = (value: string | undefined): number | null => {
    const n = value === undefined ? Number.NaN : Number(value);
    return Number.isFinite(n) ? n : null;
  };
  return {
    path,
    duration: numberOrNull(data.format?.duration),
    formatName: data.format?.format_name ?? null,
    sizeBytes: numberOrNull(data.format?.size),
    video: video
      ? {
          codec: video.codec_name ?? null,
          width: video.width ?? null,
          height: video.height ?? null,
          frameRate: video.r_frame_rate ?? null,
        }
      : null,
    audio: audio
      ? {
          codec: audio.codec_name ?? null,
          sampleRate: numberOrNull(audio.sample_rate),
          channels: audio.channels ?? null,
        }
      : null,
  };
}

function writeDurable(path: string, content: string): void {
  const fd = openSync(path, "w");
  try {
    writeFileSync(fd, content, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
