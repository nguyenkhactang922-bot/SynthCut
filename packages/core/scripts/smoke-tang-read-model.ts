import { Buffer } from "node:buffer";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EditorEngine } from "../src/engine.js";
import { methods } from "../src/rpc.js";
import { saveTangMetadata, type TangMetadata } from "../src/tang/metadata.js";
import { DEFAULT_TANG_READ_BUDGET_BYTES } from "../src/tang/read-model.js";
import { PROJECT_SCHEMA_VERSION, type Project } from "../src/types.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ok   ${message}`);
}

async function call<T = unknown>(
  engine: EditorEngine,
  name: keyof typeof methods,
  params: Record<string, unknown> = {},
): Promise<T> {
  const method = methods[name];
  const parsed = (method.schema as { parse: (input: unknown) => unknown }).parse(params);
  return (await method.handler(engine, parsed as never)) as T;
}

function bytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const tmpRoot = join(repoRoot, ".tmp");
  mkdirSync(tmpRoot, { recursive: true });
  const runRoot = join(tmpRoot, `tve-imp-002-${process.pid}-${Date.now()}`);
  mkdirSync(runRoot, { recursive: true });
  const projectPath = join(runRoot, "long-form.aive");
  const dataDir = join(runRoot, "data");
  mkdirSync(dataDir, { recursive: true });

  const fps = 30;
  const clipFrames = 6 * fps;
  const clipCount = 300;
  const totalFrames = clipFrames * clipCount;
  const projectId = "project-long-form-300";
  const assetId = "asset-main";

  const words = Array.from({ length: 6000 }, (_, i) => ({
    start: Number((i * 0.3).toFixed(3)),
    end: Number((i * 0.3 + 0.18).toFixed(3)),
    text: i === 3500 ? "noi-dung-quan-trong" : i === 4800 ? "minh-hoa-san-pham" : `word-${i}`,
  }));
  const segments = Array.from({ length: 900 }, (_, i) => ({
    start: i * 2,
    end: i * 2 + 2,
    text: `segment-${i} long-form spoken context for deterministic bounded range inspection`,
  }));
  const clips = Array.from({ length: clipCount }, (_, i) => ({
    id: `clip-${String(i + 1).padStart(3, "0")}`,
    assetId,
    startFrame: i * clipFrames,
    sourceInFrame: i * clipFrames,
    sourceOutFrame: (i + 1) * clipFrames,
  }));

  const project: Project = {
    id: projectId,
    name: "30 minute bounded read fixture",
    width: 1920,
    height: 1080,
    fps,
    assets: [{
      id: assetId,
      path: join(runRoot, "missing-source.mp4"),
      name: "main-source.mp4",
      duration: 1800,
      width: 1920,
      height: 1080,
      fps,
      hasVideo: true,
      hasAudio: true,
      addedAt: Date.now(),
      missing: true,
      transcript: { segments, words, model: "large-v3-turbo", language: "vi" },
    }],
    tracks: [{ id: "track-v1", kind: "video", index: 0, name: "V1", clips }],
    markers: Array.from({ length: 6 }, (_, i) => ({
      frame: i * 5 * 60 * fps,
      name: `Chapter ${i + 1}`,
      note: `Review chapter ${i + 1}`,
    })),
    revision: 7,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  writeFileSync(projectPath, JSON.stringify(project, null, 2), "utf8");

  const chapters = Array.from({ length: 6 }, (_, i) => ({
    id: `chapter-${i + 1}`,
    title: `Chapter ${i + 1}`,
    startFrame: i * 5 * 60 * fps,
    endFrame: (i + 1) * 5 * 60 * fps,
    summary: `Five minute chapter ${i + 1}`,
    sceneRefs: [`scene-${i + 1}-a`, `scene-${i + 1}-b`],
  }));
  const sidecar: TangMetadata = {
    schemaVersion: 1,
    coreProjectId: projectId,
    basedOnRevision: 7,
    updatedAt: new Date().toISOString(),
    readModel: { chapters },
  };
  await saveTangMetadata(projectPath, sidecar);

  let passed = false;
  try {
    const engine = new EditorEngine(dataDir);
    await engine.load(projectPath);

    console.log("1. project_overview stays bounded and exposes current revision + chapter refs...");
    const overview = await call<any>(engine, "project_overview");
    assert(overview.project.counts.clips === 300, "overview reports all 300 authoritative clips by count");
    assert(overview.chapters.length === 6, "overview returns six derived chapter references");
    assert(overview.state.projectId === projectId, "overview carries project identity token");
    assert(overview.state.revision === engine.getProject().revision, "overview carries current project revision");
    assert(overview.state.indexMutationEligible === true, "fresh chapter index is mutation-eligible by revision token");
    assert(bytes(overview) <= DEFAULT_TANG_READ_BUDGET_BYTES, `overview <=64 KiB (${bytes(overview)} bytes)`);

    console.log("2. inspect_chapter resolves five minutes to current core clip IDs/frames without full state...");
    const chapter4 = await call<any>(engine, "inspect_chapter", { chapterId: "chapter-4" });
    assert(chapter4.range.startFrame === 27_000 && chapter4.range.endFrame === 36_000, "chapter-4 resolves exact frozen frame range");
    assert(chapter4.clips.length === 50, "five-minute chapter returns exactly 50 intersecting clips");
    assert(chapter4.clips[0].clipId === "clip-151", "chapter starts on current authoritative clip-151");
    assert(chapter4.clips.at(-1)?.clipId === "clip-200", "chapter ends on current authoritative clip-200");
    assert(chapter4.transcript.length === 150, "chapter returns only 150 intersecting transcript segments");
    assert(bytes(chapter4) <= DEFAULT_TANG_READ_BUDGET_BYTES, `chapter inspection <=64 KiB (${bytes(chapter4)} bytes)`);

    console.log("3. get_transcript_window returns stable numbered local context instead of 6,000 words...");
    const window = await call<any>(engine, "get_transcript_window", { assetId, centerWord: 3500, radiusWords: 50 });
    assert(window.transcript.words.length === 101, "word window is 101 words");
    assert(window.transcript.words.some((word: any) => word.i === 3500 && word.text === "noi-dung-quan-trong"), "window preserves target word index/content");
    assert(window.transcript.totalWords === 6000, "window reports total transcript size without dumping it");
    assert(bytes(window) <= DEFAULT_TANG_READ_BUDGET_BYTES, `transcript window <=64 KiB (${bytes(window)} bytes)`);

    console.log("4. inspect_range resolves localized edit target to exact current clip/source frames...");
    const localized = await call<any>(engine, "inspect_range", { startFrame: 31_500, endFrame: 31_680 });
    assert(localized.clips.length === 1, "six-second localized range resolves one clip");
    assert(localized.clips[0].clipId === "clip-176", "localized frame 31,500 resolves authoritative clip-176");
    assert(localized.clips[0].intersectionStartFrame === 31_500, "localized timeline start frame is exact");
    assert(localized.clips[0].sourceStartFrame === 31_500, "source-frame mapping remains exact at speed=1");
    assert(bytes(localized) <= DEFAULT_TANG_READ_BUDGET_BYTES, `localized range <=64 KiB (${bytes(localized)} bytes)`);

    console.log("5. oversized whole-project inspection fails bounded by truncation/pagination, not context explosion...");
    const broad = await call<any>(engine, "inspect_range", {
      startFrame: 0,
      endFrame: totalFrames,
      clipLimit: 200,
      transcriptLimit: 300,
    });
    assert(bytes(broad) <= DEFAULT_TANG_READ_BUDGET_BYTES, `broad range hard-capped <=64 KiB (${bytes(broad)} bytes)`);
    assert(broad.truncation.clips || broad.truncation.transcript || broad.truncation.byteBudget, "broad range reports truncation instead of silently overflowing context");
    assert(broad.pagination.clips.nextOffset !== null || broad.pagination.transcript.nextOffset !== null, "broad range exposes a continuation offset");

    console.log("6. live mutation marks chapter index stale/navigation-only while current clip reads remain usable...");
    await call(engine, "set_project_settings", { name: "Revision changed after index build" });
    const staleOverview = await call<any>(engine, "project_overview");
    assert(staleOverview.state.indexStale === true, "revision drift marks index stale");
    assert(staleOverview.state.indexMutationEligible === false, "stale index cannot authorize mutation");
    assert(staleOverview.chapters.length === 6, "stale chapter refs remain available for navigation");
    const staleChapter = await call<any>(engine, "inspect_chapter", { chapterId: "chapter-4", includeTranscript: false });
    assert(staleChapter.state.indexStale === true, "chapter inspection carries stale state token");
    assert(staleChapter.clips[0].clipId === "clip-151", "stale navigation re-resolves against current core clip IDs");

    passed = true;
    console.log("TVE-IMP-002 BOUNDED READ MODEL SMOKE PASSED");
  } finally {
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
