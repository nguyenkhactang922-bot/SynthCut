import { existsSync, mkdirSync, rmSync, writeFileSync, appendFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { EditorEngine } from "../src/engine.js";
import { probeAsset } from "../src/ffmpeg/ffprobe.js";
import { buildRenderCommand, PREVIEW_PROFILE } from "../src/ffmpeg/graph.js";
import type { ResolvedRenderClip } from "../src/types.js";

interface RuntimeResult {
  status: "PASS" | "FAIL" | "FAIL_EXCEPTION";
  fixture?: Record<string, unknown>;
  commandBound?: Record<string, unknown>;
  preview?: Record<string, unknown>;
  cache?: Record<string, unknown>;
  memory?: Record<string, unknown>;
  cancel?: Record<string, unknown>;
  final?: Record<string, unknown>;
  error?: string;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ok   ${message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function activeBoundedDirs(dataDir: string): string[] {
  const root = join(dataDir, "render");
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("bounded-"))
    .map((entry) => entry.name);
}

async function main(): Promise<void> {
  const repoRoot = resolve(".");
  const fixturePath = join(repoRoot, ".spike-temp", "lf001-corrected", "lf300.aive");
  if (!existsSync(fixturePath)) throw new Error(`long-form fixture missing: ${fixturePath}`);

  const durableTmp = join(repoRoot, ".tmp");
  mkdirSync(durableTmp, { recursive: true });
  const resultPath = join(durableTmp, "TVE-IMP-006-runtime.json");
  const logPath = join(durableTmp, "TVE-IMP-006-runtime.log");
  rmSync(resultPath, { force: true });
  rmSync(logPath, { force: true });

  const runRoot = join(durableTmp, `tve-imp-006-${process.pid}-${Date.now()}`);
  const dataDir = join(runRoot, "data");
  mkdirSync(dataDir, { recursive: true });
  const engine = new EditorEngine(dataDir);
  const result: RuntimeResult = { status: "FAIL" };
  const log = (event: Record<string, unknown>) => {
    const line = JSON.stringify({ ts: new Date().toISOString(), ...event });
    console.log(line);
    appendFileSync(logPath, `${line}\n`, "utf8");
  };

  try {
    const loadStart = performance.now();
    await engine.load(fixturePath);
    const loadMs = performance.now() - loadStart;
    const project = engine.getProject();
    const clipCount = project.tracks.reduce((sum, track) => sum + track.clips.length, 0);
    const duration = engine.timelineDuration();
    result.fixture = { fixturePath, projectId: project.id, revision: project.revision, clipCount, duration, loadMs };
    log({ stage: "fixture_loaded", ...result.fixture });
    assert(clipCount >= 300, `representative project has >=300 clips (${clipCount})`);
    assert(Math.abs(duration - 1800) <= 0.01, `timeline is exactly 1800s (${duration})`);
    assert(loadMs <= 5000, `load gate <=5s (${loadMs.toFixed(2)} ms)`);

    console.log("0. continuous-transition chain stays window-bounded...");
    const transitionClips: ResolvedRenderClip[] = Array.from({ length: 300 }, (_, index) => ({
      path: "synthetic-transition-source.mp4",
      trackIndex: 0,
      showVideo: true,
      startSec: index * 5.5,
      sourceIn: 0,
      sourceSpan: 6,
      outDuration: 6,
      hasAudio: true,
      muted: false,
      ...(index > 0 ? { transition: { type: "fade" as const, duration: 0.5 } } : {}),
    }));
    const boundedProbe = buildRenderCommand(
      transitionClips,
      { width: 1280, height: 720, fps: 30 },
      "synthetic-window.ts",
      PREVIEW_PROFILE,
      undefined,
      undefined,
      { window: { start: 600, end: 606 }, videoOnly: true, mpegts: true },
    );
    const commandInputs = boundedProbe.args.filter((arg) => arg === "-i").length;
    const commandChars = boundedProbe.args.reduce((sum, arg) => sum + arg.length + 3, 0);
    result.commandBound = { commandInputs, commandChars };
    log({ stage: "transition_command_bound", ...result.commandBound });
    assert(commandInputs <= 4, `continuous-transition window uses <=4 inputs (${commandInputs})`);
    assert(commandChars < 10_000, `continuous-transition window stays <10000 chars (${commandChars})`);

    console.log("1. production bounded 30-minute preview...");
    const previewStart = performance.now();
    const preview = await engine.renderPreview();
    const previewElapsedMs = performance.now() - previewStart;
    const previewMeta = await probeAsset(preview.path);
    const firstVideoRenders = engine.renderStats.segmentRenders;
    const firstAudioRenders = engine.renderStats.audioSegmentRenders;
    result.preview = {
      elapsedMs: previewElapsedMs,
      duration: previewMeta.duration,
      width: previewMeta.width,
      height: previewMeta.height,
      fps: previewMeta.fps,
      videoCodec: previewMeta.videoCodec,
      audioCodec: previewMeta.audioCodec,
      firstVideoRenders,
      firstAudioRenders,
      maxInputs: engine.renderStats.maxSegmentInputs,
      maxChars: engine.renderStats.maxSegmentCommandChars,
      singlePassRenders: engine.renderStats.singlePassRenders,
    };
    log({ stage: "preview_done", ...result.preview });
    assert(existsSync(preview.path), "preview artifact exists before verification cleanup");
    assert(Math.abs(previewMeta.duration - 1800) <= 1, `preview duration ~=1800s (${previewMeta.duration})`);
    assert(previewMeta.width === 1280 && previewMeta.height === 720, `preview is 1280x720 (${previewMeta.width}x${previewMeta.height})`);
    assert(Math.abs(previewMeta.fps - 30) < 0.1, `preview is 30fps (${previewMeta.fps})`);
    assert(!!previewMeta.hasVideo && !!previewMeta.hasAudio, "preview contains video + audio");
    assert(engine.renderStats.singlePassRenders === 0, "preview used bounded segmented path without single-pass fallback");
    assert(engine.renderStats.maxSegmentInputs <= 4, `bounded command input count <=4 (${engine.renderStats.maxSegmentInputs})`);
    assert(engine.renderStats.maxSegmentCommandChars < 10_000, `bounded command chars <10000 (${engine.renderStats.maxSegmentCommandChars})`);

    const videoTrack = project.tracks.find((track) => track.kind === "video");
    if (!videoTrack?.clips.length) throw new Error("fixture has no video clips");
    const tailClip = videoTrack.clips.at(-1)!;

    console.log("2. localized edit preserves unrelated segment cache and remote-frame cache...");
    engine.setClipEffects(tailClip.id, { color: { saturation: 0.81 } });
    const renderBefore = engine.renderStats.segmentRenders;
    const hitBefore = engine.renderStats.segmentCacheHits;
    await engine.renderPreview();
    const localVideoRenders = engine.renderStats.segmentRenders - renderBefore;
    const localVideoHits = engine.renderStats.segmentCacheHits - hitBefore;
    const localVideoUnits = localVideoHits + localVideoRenders;
    const reuseRatio = localVideoUnits > 0 ? localVideoHits / localVideoUnits : 0;
    assert(reuseRatio >= 0.9, `localized edit preserves >=90% unrelated video cache (${(reuseRatio * 100).toFixed(2)}%)`);

    engine.setClipEffects(tailClip.id, { color: { saturation: 0.79 } });
    const remoteRenderBefore = engine.renderStats.segmentRenders;
    const remoteHitBefore = engine.renderStats.segmentCacheHits;
    const framePath = await engine.renderFrame(30);
    const remoteRenders = engine.renderStats.segmentRenders - remoteRenderBefore;
    const remoteHits = engine.renderStats.segmentCacheHits - remoteHitBefore;
    assert(existsSync(framePath), "remote verification frame exists");
    assert(remoteRenders === 0, `unchanged remote frame causes 0 new video segment renders (${remoteRenders})`);
    assert(remoteHits >= 1, `unchanged remote frame uses >=1 cache hit (${remoteHits})`);
    result.cache = { localVideoRenders, localVideoHits, localVideoUnits, reuseRatio, remoteRenders, remoteHits };
    log({ stage: "cache_gates_done", ...result.cache });

    console.log("3. twenty localized edit/verify cycles remain memory-bounded...");
    const rssBaseline = process.memoryUsage().rss;
    let maxRss = rssBaseline;
    for (let i = 0; i < 20; i++) {
      engine.setClipEffects(tailClip.id, { color: { saturation: i % 2 === 0 ? 0.77 : 0.83 } });
      await engine.renderFrame(1797);
      maxRss = Math.max(maxRss, process.memoryUsage().rss);
      if ((i + 1) % 5 === 0) log({ stage: "memory_cycle", cycle: i + 1, rss: process.memoryUsage().rss, maxRss });
    }
    const rssAfter = process.memoryUsage().rss;
    const rssRatio = rssBaseline > 0 ? rssAfter / rssBaseline : 1;
    result.memory = { rssBaseline, rssAfter, maxRss, rssRatio };
    assert(rssRatio <= 1.25, `20-cycle RSS ratio <=1.25x (${rssRatio.toFixed(4)}x)`);

    console.log("4. background export returns quickly, reports progress, cancels cleanly...");
    engine.setMusic(project.assets[0].id, { volume: 0.05, fadeInFrames: 30, fadeOutFrames: 30, duck: true });
    const exportSettings = {
      container: "mp4" as const,
      videoCodec: "h264" as const,
      quality: 18,
      audioCodec: "aac" as const,
      audioBitrate: "192k",
      preset: "medium",
      loudnessTarget: -14,
      truePeak: -1.5,
    };
    const cancelOut = join(runRoot, "cancel-30m-1080p.mp4");
    const cancelStart = performance.now();
    const canceled = engine.startExportJob(cancelOut, exportSettings);
    const controlReturnMs = performance.now() - cancelStart;
    const waitStartedAt = Date.now();
    let progressSeen = false;
    while (Date.now() - waitStartedAt < 30_000) {
      const job = engine.jobs.get(canceled.job.id);
      if (!job || job.status !== "running") break;
      if (job.fraction > 0) {
        progressSeen = true;
        break;
      }
      await sleep(100);
    }
    const cancelIssued = engine.jobs.cancel(canceled.job.id);
    try { await canceled.promise; } catch { /* expected */ }
    await sleep(250);
    const canceledJob = engine.jobs.get(canceled.job.id);
    const cancelClean = cancelIssued && canceledJob?.status === "canceled" && !existsSync(cancelOut) && activeBoundedDirs(dataDir).length === 0;
    result.cancel = { controlReturnMs, progressSeen, cancelIssued, job: canceledJob, outputExists: existsSync(cancelOut), transientDirs: activeBoundedDirs(dataDir), cancelClean };
    log({ stage: "cancel_gate_done", ...result.cancel });
    assert(controlReturnMs <= 5000, `background export control returns <=5s (${controlReturnMs.toFixed(2)} ms)`);
    assert(progressSeen, "background export reports progress before cancel");
    assert(cancelClean, "cancel leaves no partial final output or bounded transient directory");

    console.log("5. complete production bounded 30-minute 1080p export...");
    const finalOut = join(runRoot, "final-30m-1080p.mp4");
    const finalStart = performance.now();
    const finalJobStart = engine.startExportJob(finalOut, exportSettings);
    const finalControlReturnMs = performance.now() - finalStart;
    const finalRender = await finalJobStart.promise;
    const finalElapsedMs = performance.now() - finalStart;
    const finalJob = engine.jobs.get(finalJobStart.job.id);
    const finalMeta = await probeAsset(finalOut);
    result.final = {
      controlReturnMs: finalControlReturnMs,
      elapsedMs: finalElapsedMs,
      job: finalJob,
      reportedDuration: finalRender.duration,
      probedDuration: finalMeta.duration,
      width: finalMeta.width,
      height: finalMeta.height,
      fps: finalMeta.fps,
      videoCodec: finalMeta.videoCodec,
      audioCodec: finalMeta.audioCodec,
      hasVideo: finalMeta.hasVideo,
      hasAudio: finalMeta.hasAudio,
      maxInputs: engine.renderStats.maxSegmentInputs,
      maxChars: engine.renderStats.maxSegmentCommandChars,
      videoSegmentRenders: engine.renderStats.segmentRenders,
      videoSegmentCacheHits: engine.renderStats.segmentCacheHits,
      audioSegmentRenders: engine.renderStats.audioSegmentRenders,
      audioSegmentCacheHits: engine.renderStats.audioSegmentCacheHits,
      outputBytes: existsSync(finalOut) ? statSync(finalOut).size : 0,
    };
    log({ stage: "final_export_done", ...result.final });
    assert(finalControlReturnMs <= 5000, `final background control returns <=5s (${finalControlReturnMs.toFixed(2)} ms)`);
    assert(finalJob?.status === "done" && finalJob.fraction === 1, "final export job reaches done / progress=1");
    assert(Math.abs(finalMeta.duration - 1800) <= 1, `final duration ~=1800s (${finalMeta.duration})`);
    assert(finalMeta.width === 1920 && finalMeta.height === 1080, `final is 1920x1080 (${finalMeta.width}x${finalMeta.height})`);
    assert(Math.abs(finalMeta.fps - 30) < 0.1, `final is 30fps (${finalMeta.fps})`);
    assert(/h264|avc/i.test(finalMeta.videoCodec ?? ""), `final video codec is H.264 (${finalMeta.videoCodec})`);
    assert(/aac/i.test(finalMeta.audioCodec ?? ""), `final audio codec is AAC (${finalMeta.audioCodec})`);
    assert(engine.renderStats.maxSegmentInputs <= 4, `all bounded commands use <=4 inputs (${engine.renderStats.maxSegmentInputs})`);
    assert(engine.renderStats.maxSegmentCommandChars < 10_000, `all bounded commands stay <10000 chars (${engine.renderStats.maxSegmentCommandChars})`);
    assert(activeBoundedDirs(dataDir).length === 0, "successful export cleans bounded transient directories");

    result.status = "PASS";
    writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");
    log({ stage: "TVE_IMP_006_RESULT", status: "PASS", resultPath });
    console.log("TVE-IMP-006 BOUNDED LONG-FORM PRODUCTION SMOKE PASSED");
    rmSync(runRoot, { recursive: true, force: true });
  } catch (error) {
    result.status = "FAIL_EXCEPTION";
    result.error = error instanceof Error ? error.stack ?? error.message : String(error);
    writeFileSync(resultPath, JSON.stringify(result, null, 2), "utf8");
    log({ stage: "TVE_IMP_006_FATAL", error: result.error, runRoot });
    console.error(`Failure artifacts preserved under ${runRoot}`);
    throw error;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
