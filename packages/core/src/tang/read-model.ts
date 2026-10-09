import { Buffer } from "node:buffer";
import type { EditorEngine } from "../engine.js";
import {
  clipDurationFrames,
  clipEndFrame,
  type AssetTranscript,
  type Clip,
  type Marker,
  type Project,
} from "../types.js";
import type { TangMetadata, TangMetadataStatus } from "./metadata.js";

export const DEFAULT_TANG_READ_BUDGET_BYTES = 64 * 1024;
const INTERNAL_TANG_READ_BUDGET_BYTES = DEFAULT_TANG_READ_BUDGET_BYTES - 256;
const DEFAULT_RANGE_CLIP_LIMIT = 80;
const DEFAULT_RANGE_TRANSCRIPT_LIMIT = 160;
const MAX_RANGE_CLIP_LIMIT = 200;
const MAX_RANGE_TRANSCRIPT_LIMIT = 300;
const DEFAULT_TRANSCRIPT_RADIUS = 50;
const MAX_TRANSCRIPT_RADIUS = 100;
const MAX_TRANSCRIPT_RANGE_WORDS = 201;

export interface TangReadStateToken {
  projectId: string;
  revision: number;
  metadataState: TangMetadataStatus["state"];
  indexRevision: number | null;
  indexStale: boolean;
  indexMutationEligible: boolean;
}

export interface TangChapterRef {
  id: string;
  title?: string;
  startFrame: number;
  endFrame: number;
  summary?: string;
  sceneRefs?: string[];
  transcriptSpanRefs?: unknown[];
  keyEntities?: string[];
  editorialSignals?: string[];
}

export interface TangInspectRangeInput {
  startFrame: number;
  endFrame: number;
  includeTranscript?: boolean;
  includeMarkers?: boolean;
  clipOffset?: number;
  transcriptOffset?: number;
  clipLimit?: number;
  transcriptLimit?: number;
}

export interface TangTranscriptWindowInput {
  assetId: string;
  centerWord?: number;
  centerSeconds?: number;
  startWord?: number;
  endWord?: number;
  radiusWords?: number;
}

export function projectOverview(engine: EditorEngine) {
  const project = engine.getProject();
  const state = readStateToken(engine);
  const metadata = engine.getTangMetadataForNavigation();
  const chapters = chapterRefs(metadata, engine.timelineDurationFrames());
  const clipCount = project.tracks.reduce((sum, track) => sum + track.clips.length, 0);
  const assetSummaries = project.assets.slice(0, 100).map((asset) => ({
    assetId: asset.id,
    name: boundedText(asset.name, 240),
    duration: Number(asset.duration.toFixed(3)),
    width: asset.width,
    height: asset.height,
    hasVideo: asset.hasVideo,
    hasAudio: asset.hasAudio,
    transcriptIndexed: !!asset.transcriptIndexed,
    missing: !!asset.missing,
  }));
  const allReviewMarkers = (project.markers ?? []).filter((marker) => marker.note || marker.name);
  const reviewMarkers = allReviewMarkers.slice(0, 50).map(compactMarker);

  const result = {
    state,
    project: {
      id: project.id,
      name: boundedText(project.name, 240),
      projectFile: engine.getCurrentPath() ?? null,
      unsavedChanges: engine.isDirty(),
      durationFrames: engine.timelineDurationFrames(),
      durationSeconds: Number(engine.timelineDuration().toFixed(3)),
      fps: project.fps,
      canvas: { width: project.width, height: project.height },
      counts: {
        assets: project.assets.length,
        tracks: project.tracks.length,
        clips: clipCount,
        markers: project.markers?.length ?? 0,
        transcriptIndexedAssets: project.assets.filter((asset) => asset.transcriptIndexed).length,
      },
    },
    assets: assetSummaries,
    chapters: chapters.slice(0, 100),
    reviewMarkers,
    analysisStatus: {
      metadataState: state.metadataState,
      chapterIndex: chapters.length > 0 ? (state.indexStale ? "stale" : "available") : "missing",
      transcriptIndex: project.assets.some((asset) => asset.transcriptIndexed) ? "partial_or_available" : "missing",
    },
    truncation: {
      assets: project.assets.length > assetSummaries.length,
      chapters: chapters.length > 100,
      reviewMarkers: allReviewMarkers.length > reviewMarkers.length,
    },
    byteBudget: DEFAULT_TANG_READ_BUDGET_BYTES,
  };

  trimOverviewToBudget(result);
  return withSerializedBytes(result);
}

export function inspectProjectRange(engine: EditorEngine, input: TangInspectRangeInput) {
  const project = engine.getProject();
  const durationFrames = engine.timelineDurationFrames();
  if (durationFrames <= 0) throw new Error("The timeline is empty; there is no range to inspect.");

  const startFrame = clampInt(input.startFrame, 0, durationFrames - 1);
  const endFrame = clampInt(input.endFrame, startFrame + 1, durationFrames);
  if (endFrame <= startFrame) throw new Error("endFrame must be greater than startFrame");

  const state = readStateToken(engine);
  const metadata = engine.getTangMetadataForNavigation();
  const chapters = chapterRefs(metadata, durationFrames).filter(
    (chapter) => chapter.endFrame > startFrame && chapter.startFrame < endFrame,
  );
  const clipOffset = Math.max(0, Math.floor(input.clipOffset ?? 0));
  const transcriptOffset = Math.max(0, Math.floor(input.transcriptOffset ?? 0));
  const clipLimit = clampInt(input.clipLimit ?? DEFAULT_RANGE_CLIP_LIMIT, 1, MAX_RANGE_CLIP_LIMIT);
  const transcriptLimit = clampInt(
    input.transcriptLimit ?? DEFAULT_RANGE_TRANSCRIPT_LIMIT,
    1,
    MAX_RANGE_TRANSCRIPT_LIMIT,
  );

  const allClips = intersectingClips(project, startFrame, endFrame);
  const clipRows = allClips.slice(clipOffset, clipOffset + clipLimit);
  const allTranscript = input.includeTranscript === false
    ? []
    : intersectingTranscript(engine, project, allClips, startFrame, endFrame);
  const transcriptRows = allTranscript.slice(transcriptOffset, transcriptOffset + transcriptLimit);
  const allMarkers = input.includeMarkers === false
    ? []
    : (project.markers ?? []).filter((marker) => marker.frame >= startFrame && marker.frame < endFrame);

  const result = {
    state,
    range: { startFrame, endFrame, durationFrames: endFrame - startFrame },
    chapters,
    clips: clipRows,
    transcript: transcriptRows,
    markers: allMarkers.slice(0, 100).map(compactMarker),
    pagination: {
      clips: pageInfo(clipOffset, clipRows.length, allClips.length),
      transcript: pageInfo(transcriptOffset, transcriptRows.length, allTranscript.length),
    },
    truncation: {
      chapters: false,
      clips: clipOffset + clipRows.length < allClips.length,
      transcript: transcriptOffset + transcriptRows.length < allTranscript.length,
      markers: allMarkers.length > 100,
      byteBudget: false,
    },
    byteBudget: DEFAULT_TANG_READ_BUDGET_BYTES,
  };

  trimRangeToBudget(result);
  result.pagination.clips = pageInfo(clipOffset, result.clips.length, allClips.length);
  result.pagination.transcript = pageInfo(transcriptOffset, result.transcript.length, allTranscript.length);
  return withSerializedBytes(result);
}

export function inspectChapter(
  engine: EditorEngine,
  chapterId: string,
  options: Omit<TangInspectRangeInput, "startFrame" | "endFrame"> = {},
) {
  const metadata = engine.getTangMetadataForNavigation();
  const chapters = chapterRefs(metadata, engine.timelineDurationFrames());
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) {
    const available = chapters.slice(0, 20).map((item) => item.id).join(", ");
    throw new Error(
      chapters.length === 0
        ? "No chapter index is available. Use project_overview/inspect_range until chapter analysis populates Tang readModel.chapters."
        : `Unknown chapterId "${chapterId}". Available chapter IDs: ${available}`,
    );
  }
  const range = inspectProjectRange(engine, {
    ...options,
    startFrame: chapter.startFrame,
    endFrame: chapter.endFrame,
  });
  const { serializedBytes: _rangeBytes, ...rangeWithoutBytes } = range;
  const result = { selectedChapter: chapter, ...rangeWithoutBytes };
  trimRangeToBudget(result);
  return withSerializedBytes(result);
}

export function transcriptWindow(engine: EditorEngine, input: TangTranscriptWindowInput) {
  const project = engine.getProject();
  const asset = project.assets.find((item) => item.id === input.assetId);
  if (!asset) throw new Error(`Unknown assetId "${input.assetId}"`);
  const transcript = engine.getTranscript(input.assetId);
  const state = readStateToken(engine);
  if (!transcript?.words?.length) {
    return withSerializedBytes({
      state,
      asset: { assetId: asset.id, name: boundedText(asset.name, 240) },
      transcript: null,
      reason: "word_level_transcript_missing",
      byteBudget: DEFAULT_TANG_READ_BUDGET_BYTES,
    });
  }

  const words = transcript.words;
  let from: number;
  let to: number;
  let anchorWord: number | null = null;
  if (input.startWord !== undefined || input.endWord !== undefined) {
    if (input.startWord === undefined || input.endWord === undefined) {
      throw new Error("startWord and endWord must be provided together");
    }
    from = clampInt(Math.min(input.startWord, input.endWord), 0, words.length - 1);
    to = clampInt(Math.max(input.startWord, input.endWord), from, words.length - 1);
    if (to - from + 1 > MAX_TRANSCRIPT_RANGE_WORDS) to = from + MAX_TRANSCRIPT_RANGE_WORDS - 1;
  } else {
    const radius = clampInt(input.radiusWords ?? DEFAULT_TRANSCRIPT_RADIUS, 0, MAX_TRANSCRIPT_RADIUS);
    if (input.centerWord !== undefined) {
      anchorWord = clampInt(input.centerWord, 0, words.length - 1);
    } else if (input.centerSeconds !== undefined) {
      anchorWord = nearestWord(words, input.centerSeconds);
    } else {
      anchorWord = 0;
    }
    from = Math.max(0, anchorWord - radius);
    to = Math.min(words.length - 1, anchorWord + radius);
  }

  const selected = words.slice(from, to + 1).map((word, offset) => ({
    i: from + offset,
    start: Number(word.start.toFixed(3)),
    end: Number(word.end.toFixed(3)),
    text: boundedText(word.text, 256),
  }));
  const requestedEnd = input.startWord !== undefined && input.endWord !== undefined
    ? clampInt(Math.max(input.startWord, input.endWord), from, words.length - 1)
    : to;

  const result = {
    state,
    asset: { assetId: asset.id, name: boundedText(asset.name, 240) },
    transcript: {
      model: transcript.model ?? null,
      language: transcript.language ?? null,
      totalWords: words.length,
      fromWord: from,
      toWord: to,
      anchorWord,
      words: selected,
    },
    truncation: {
      requestedRangeCapped: requestedEnd > to,
      byteBudget: false,
    },
    byteBudget: DEFAULT_TANG_READ_BUDGET_BYTES,
  };

  while (serializedBytes(result) > INTERNAL_TANG_READ_BUDGET_BYTES && result.transcript.words.length > 1) {
    result.transcript.words.pop();
    result.transcript.toWord = result.transcript.words.at(-1)?.i ?? from;
    result.truncation.byteBudget = true;
  }
  return withSerializedBytes(result);
}

function readStateToken(engine: EditorEngine): TangReadStateToken {
  const project = engine.getProject();
  const status = engine.getTangMetadataStatus();
  const metadata = engine.getTangMetadataForNavigation();
  const indexRevision = metadata?.basedOnRevision ?? status.basedOnRevision ?? null;
  const hasReadModel = !!metadata?.readModel;
  const indexStale = status.state !== "valid" || indexRevision !== project.revision;
  return {
    projectId: project.id,
    revision: project.revision,
    metadataState: status.state,
    indexRevision,
    indexStale,
    indexMutationEligible: hasReadModel && !indexStale,
  };
}

function chapterRefs(metadata: TangMetadata | null, durationFrames: number): TangChapterRef[] {
  const raw = metadata?.readModel?.["chapters"];
  if (!Array.isArray(raw)) return [];
  const rows: TangChapterRef[] = [];
  for (const item of raw) {
    if (!isRecord(item) || typeof item.id !== "string" || !item.id.trim()) continue;
    const startFrame = integer(item.startFrame);
    const endFrame = integer(item.endFrame);
    if (startFrame === null || endFrame === null || startFrame < 0 || endFrame <= startFrame) continue;
    if (durationFrames > 0 && startFrame >= durationFrames) continue;
    rows.push({
      id: item.id,
      ...(typeof item.title === "string" ? { title: boundedText(item.title, 240) } : {}),
      startFrame,
      endFrame: durationFrames > 0 ? Math.min(endFrame, durationFrames) : endFrame,
      ...(typeof item.summary === "string" ? { summary: boundedText(item.summary, 1000) } : {}),
      ...(stringArray(item.sceneRefs) ? { sceneRefs: item.sceneRefs.slice(0, 100) } : {}),
      ...(Array.isArray(item.transcriptSpanRefs) ? { transcriptSpanRefs: item.transcriptSpanRefs.slice(0, 100) } : {}),
      ...(stringArray(item.keyEntities) ? { keyEntities: item.keyEntities.slice(0, 100) } : {}),
      ...(stringArray(item.editorialSignals) ? { editorialSignals: item.editorialSignals.slice(0, 100) } : {}),
    });
  }
  return rows.sort((a, b) => a.startFrame - b.startFrame || a.id.localeCompare(b.id));
}

function intersectingClips(project: Project, startFrame: number, endFrame: number) {
  return [...project.tracks]
    .sort((a, b) => a.index - b.index)
    .flatMap((track) => track.clips
      .filter((clip) => clipEndFrame(clip) > startFrame && clip.startFrame < endFrame)
      .map((clip) => {
        const asset = project.assets.find((item) => item.id === clip.assetId);
        const intersectionStartFrame = Math.max(startFrame, clip.startFrame);
        const intersectionEndFrame = Math.min(endFrame, clipEndFrame(clip));
        return {
          trackIndex: track.index,
          clipId: clip.id,
          assetId: clip.assetId,
          asset: boundedText(asset?.name ?? (clip.adjustment ? "(adjustment layer)" : "(missing)"), 240),
          startFrame: clip.startFrame,
          endFrame: clipEndFrame(clip),
          durationFrames: clipDurationFrames(clip),
          intersectionStartFrame,
          intersectionEndFrame,
          sourceStartFrame: sourceFrameAtTimeline(clip, intersectionStartFrame),
          sourceEndFrame: sourceFrameAtTimeline(clip, intersectionEndFrame),
          speed: clip.effects?.speed ?? 1,
        };
      }));
}

function intersectingTranscript(
  engine: EditorEngine,
  project: Project,
  clips: ReturnType<typeof intersectingClips>,
  startFrame: number,
  endFrame: number,
) {
  const clipById = new Map<string, Clip>();
  for (const track of project.tracks) for (const clip of track.clips) clipById.set(clip.id, clip);
  const rows: Array<{
    assetId: string;
    clipId: string;
    segmentIndex: number;
    sourceStart: number;
    sourceEnd: number;
    timelineStartFrame: number;
    timelineEndFrame: number;
    text: string;
  }> = [];
  for (const clipRow of clips) {
    const clip = clipById.get(clipRow.clipId);
    if (!clip?.assetId) continue;
    const assetId = clip.assetId;
    const transcript = engine.getTranscript(assetId);
    if (!transcript) continue;
    const sourceStartSec = clipRow.sourceStartFrame / project.fps;
    const sourceEndSec = clipRow.sourceEndFrame / project.fps;
    transcript.segments.forEach((segment, segmentIndex) => {
      if (segment.end <= sourceStartSec || segment.start >= sourceEndSec) return;
      const timelineStartFrame = clampInt(
        timelineFrameAtSource(clip, segment.start * project.fps),
        Math.max(startFrame, clip.startFrame),
        Math.min(endFrame, clipEndFrame(clip)),
      );
      const timelineEndFrame = clampInt(
        timelineFrameAtSource(clip, segment.end * project.fps),
        timelineStartFrame,
        Math.min(endFrame, clipEndFrame(clip)),
      );
      rows.push({
        assetId,
        clipId: clip.id,
        segmentIndex,
        sourceStart: Number(segment.start.toFixed(3)),
        sourceEnd: Number(segment.end.toFixed(3)),
        timelineStartFrame,
        timelineEndFrame,
        text: boundedText(segment.text, 1024),
      });
    });
  }
  return rows.sort(
    (a, b) => a.timelineStartFrame - b.timelineStartFrame || a.clipId.localeCompare(b.clipId) || a.segmentIndex - b.segmentIndex,
  );
}

function sourceFrameAtTimeline(clip: Clip, timelineFrame: number): number {
  const speed = clip.effects?.speed ?? 1;
  const offset = clampInt(timelineFrame - clip.startFrame, 0, clipDurationFrames(clip));
  return Math.round(clip.sourceInFrame + offset * speed);
}

function timelineFrameAtSource(clip: Clip, sourceFrame: number): number {
  const speed = clip.effects?.speed ?? 1;
  return Math.round(clip.startFrame + (sourceFrame - clip.sourceInFrame) / speed);
}

function compactMarker(marker: Marker) {
  return {
    frame: marker.frame,
    ...(marker.name ? { name: boundedText(marker.name, 240) } : {}),
    ...(marker.note ? { note: boundedText(marker.note, 1000) } : {}),
    ...(marker.color ? { color: boundedText(marker.color, 64) } : {}),
  };
}

function trimOverviewToBudget(result: {
  assets: unknown[];
  chapters: unknown[];
  reviewMarkers: unknown[];
  truncation: { assets: boolean; chapters: boolean; reviewMarkers: boolean };
}) {
  while (serializedBytes(result) > INTERNAL_TANG_READ_BUDGET_BYTES) {
    if (result.assets.length > 10) {
      result.assets.pop();
      result.truncation.assets = true;
    } else if (result.reviewMarkers.length > 0) {
      result.reviewMarkers.pop();
      result.truncation.reviewMarkers = true;
    } else if (result.chapters.length > 1) {
      result.chapters.pop();
      result.truncation.chapters = true;
    } else break;
  }
}

function trimRangeToBudget(result: {
  chapters: unknown[];
  clips: unknown[];
  transcript: unknown[];
  markers: unknown[];
  truncation: { chapters: boolean; clips: boolean; transcript: boolean; markers: boolean; byteBudget: boolean };
}) {
  while (serializedBytes(result) > INTERNAL_TANG_READ_BUDGET_BYTES) {
    result.truncation.byteBudget = true;
    if (result.transcript.length > 1) {
      result.transcript.pop();
      result.truncation.transcript = true;
    } else if (result.clips.length > 1) {
      result.clips.pop();
      result.truncation.clips = true;
    } else if (result.markers.length > 0) {
      result.markers.pop();
      result.truncation.markers = true;
    } else if (result.chapters.length > 1) {
      result.chapters.pop();
      result.truncation.chapters = true;
    } else break;
  }
}

function pageInfo(offset: number, returned: number, total: number) {
  const nextOffset = offset + returned < total ? offset + returned : null;
  return { offset, returned, total, nextOffset };
}

function nearestWord(words: NonNullable<AssetTranscript["words"]>, seconds: number): number {
  let best = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < words.length; i++) {
    const midpoint = (words[i].start + words[i].end) / 2;
    const distance = Math.abs(midpoint - seconds);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
}

function withSerializedBytes<T extends object>(value: T): T & { serializedBytes: number } {
  const output = Object.assign(value, { serializedBytes: 0 });
  output.serializedBytes = serializedBytes(output);
  output.serializedBytes = serializedBytes(output);
  return output;
}

function serializedBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

function boundedText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 1))}…`;
}

function integer(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function clampInt(value: number, min: number, max: number): number {
  const lo = Math.ceil(min);
  const hi = Math.max(lo, Math.floor(max));
  return Math.min(hi, Math.max(lo, Math.floor(value)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
