export type EditorialPlatform = "vertical" | "widescreen" | "square";

export interface LongFormBrief {
  goal: string;
  platform?: EditorialPlatform;
  targetMinutes?: number;
  language?: string;
}

export interface ProjectOverviewLike {
  state: {
    projectId: string;
    revision: number;
    indexStale: boolean;
    indexMutationEligible: boolean;
  };
  project: {
    durationFrames: number;
    fps: number;
  };
  chapters?: Array<{
    id: string;
    title?: string;
    startFrame: number;
    endFrame: number;
  }>;
}

export interface EditorialWorkPacket {
  packetId: string;
  hierarchy: {
    projectId: string;
    chapterId?: string;
    sceneBeatResolution: "inspect-bounded-context";
  };
  scope: { chapterId: string } | { startFrame: number; endFrame: number };
  startFrame: number;
  endFrame: number;
  basedOnRevision: number;
  readSequence: Array<{
    method: "inspect_chapter" | "inspect_range";
    args: Record<string, unknown>;
  }>;
  transcriptReadMethod: "get_transcript_window";
  mutationSequence: ["dry_run_edit_plan", "apply_edit_plan"];
  qaSequence: ["inspect_timeline", "get_frame", "render_preview"];
}

const DEFAULT_WINDOW_MINUTES = 5;

/**
 * Convert a bounded project overview into deterministic chapter/range work packets.
 * This is orchestration metadata only: it never mutates state and never becomes a
 * second timeline. Core RPCs remain the sole read/mutation authority.
 */
export function buildLongFormWorkPackets(
  overview: ProjectOverviewLike,
  windowMinutes = DEFAULT_WINDOW_MINUTES,
): EditorialWorkPacket[] {
  const durationFrames = assertPositiveInt(overview.project.durationFrames, "durationFrames");
  const fps = assertPositiveInt(overview.project.fps, "fps");
  const revision = assertNonNegativeInt(overview.state.revision, "revision");
  const projectId = nonEmpty(overview.state.projectId, "projectId");
  const chapters = Array.isArray(overview.chapters) ? overview.chapters : [];
  const chapterIndexUsable = !overview.state.indexStale && overview.state.indexMutationEligible && chapters.length > 0;

  if (chapterIndexUsable) {
    return chapters.map((chapter, index) => {
      const startFrame = clampFrame(chapter.startFrame, 0, durationFrames - 1);
      const endFrame = clampFrame(chapter.endFrame, startFrame + 1, durationFrames);
      if (endFrame <= startFrame) throw new Error(`Invalid chapter range for ${chapter.id}`);
      const chapterId = nonEmpty(chapter.id, `chapters[${index}].id`);
      return packet({
        packetId: `chapter-${String(index + 1).padStart(2, "0")}-${chapterId}`,
        projectId,
        chapterId,
        startFrame,
        endFrame,
        revision,
        readSequence: [
          { method: "inspect_chapter", args: { chapterId } },
          { method: "inspect_range", args: { startFrame, endFrame, includeTranscript: true } },
        ],
      });
    });
  }

  const requestedMinutes = Number.isFinite(windowMinutes) && windowMinutes > 0 ? windowMinutes : DEFAULT_WINDOW_MINUTES;
  const windowFrames = Math.max(1, Math.round(requestedMinutes * 60 * fps));
  const packets: EditorialWorkPacket[] = [];
  for (let startFrame = 0, index = 0; startFrame < durationFrames; startFrame += windowFrames, index += 1) {
    const endFrame = Math.min(durationFrames, startFrame + windowFrames);
    packets.push(packet({
      packetId: `range-${String(index + 1).padStart(2, "0")}`,
      projectId,
      startFrame,
      endFrame,
      revision,
      readSequence: [{ method: "inspect_range", args: { startFrame, endFrame, includeTranscript: true } }],
    }));
  }
  return packets;
}

export function buildLongFormPrompt(brief: LongFormBrief): string {
  const goal = nonEmpty(brief.goal, "goal");
  const targetMinutes = Number.isFinite(brief.targetMinutes) && (brief.targetMinutes ?? 0) > 0
    ? brief.targetMinutes
    : 30;
  const platform = brief.platform ?? "widescreen";
  const language = (brief.language ?? "auto").trim() || "auto";
  const viPolicy = language.toLowerCase() === "vi"
    ? "Vietnamese policy: index/transcribe with language=vi and model=large-v3-turbo. Automatic transcript cuts must honor the frozen >=120 ms per-side guard; unsafe candidates stay NOOP/review-needed."
    : "When speech language is known, pass it explicitly to transcript tools; do not guess an English-only model for non-English material.";

  return [
    "Operate this as a long-form editorial job over the existing shared SynthCut project.",
    `Goal: ${goal}`,
    `Target: about ${targetMinutes} minutes, ${platform}, language=${language}.`,
    "Hierarchy: PROJECT -> CHAPTER -> SCENE/BEAT -> EDIT ACTION.",
    "PROJECT: call project_overview first. Never use get_state as the default long-form context surface.",
    "CHAPTER: if chapter metadata is current, use inspect_chapter; otherwise use bounded inspect_range windows. Treat derived chapters only as navigation, never as edit truth.",
    "SCENE/BEAT: within one bounded packet, use search_transcript/locate_in_timeline and get_transcript_window plus inspect_range to resolve real clip IDs, asset IDs and frame ranges before proposing edits.",
    "EDIT ACTION: create one coherent EditPlan for the packet using the current projectId + revision, an actual chapter/range scope, real RPC method names and real IDs/frames. Call dry_run_edit_plan before apply_edit_plan. If revision changes or dry-run says stale, discard and rebuild from current bounded reads.",
    "VERIFY: after each applied batch inspect structure and rendered truth with inspect_timeline/get_frame; use render_preview for audio/motion/pacing review before continuing or exporting.",
    "Editorial pass order: hook/promise -> narrative clarity -> pacing/retention -> filler/repetition -> B-roll/visual support -> captions/text -> audio/music polish -> QA.",
    "Do not force decoration. Every B-roll, caption, music cue, transition or effect must serve comprehension, continuity, emphasis or retention.",
    viPolicy,
    "Never write .aive directly. Never create a shadow timeline or local second LLM. MCP/core RPC state is authoritative.",
    "Ordinary read payloads must stay bounded; paginate/continue bounded reads instead of dumping the whole project/transcript.",
  ].join("\n");
}

function packet(input: {
  packetId: string;
  projectId: string;
  chapterId?: string;
  startFrame: number;
  endFrame: number;
  revision: number;
  readSequence: EditorialWorkPacket["readSequence"];
}): EditorialWorkPacket {
  const scope = input.chapterId
    ? { chapterId: input.chapterId }
    : { startFrame: input.startFrame, endFrame: input.endFrame };
  return {
    packetId: input.packetId,
    hierarchy: {
      projectId: input.projectId,
      ...(input.chapterId ? { chapterId: input.chapterId } : {}),
      sceneBeatResolution: "inspect-bounded-context",
    },
    scope,
    startFrame: input.startFrame,
    endFrame: input.endFrame,
    basedOnRevision: input.revision,
    readSequence: input.readSequence,
    transcriptReadMethod: "get_transcript_window",
    mutationSequence: ["dry_run_edit_plan", "apply_edit_plan"],
    qaSequence: ["inspect_timeline", "get_frame", "render_preview"],
  };
}

function nonEmpty(value: string, name: string): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) throw new Error(`${name} must be non-empty`);
  return trimmed;
}

function assertPositiveInt(value: number, name: string): number {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`);
  return value;
}

function assertNonNegativeInt(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 0) throw new Error(`${name} must be a non-negative integer`);
  return value;
}

function clampFrame(value: number, min: number, max: number): number {
  const rounded = Number.isFinite(value) ? Math.round(value) : min;
  return Math.max(min, Math.min(max, rounded));
}
