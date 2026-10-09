import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EditorEngine } from "../src/engine.js";
import { methods } from "../src/rpc.js";
import {
  resolveGuardedGapCut,
  resolveGuardedWordRemoval,
  resolveTranscriptionPolicy,
  VIETNAMESE_CUT_GUARD_SEC,
  VIETNAMESE_EDIT_MODEL,
} from "../src/whisper/policy.js";
import type { Project } from "../src/types.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const work = join(repoRoot, ".tmp", "tve-imp-008-smoke");
const frozenPack = join(repoRoot, ".spike-temp", "vi-stt", "human-review-pack");

function probeMedia(path: string): { duration: number; hasAudio: boolean; hasVideo: boolean } {
  const ffprobe = process.env.AIVE_FFPROBE;
  if (!ffprobe) throw new Error("AIVE_FFPROBE is required for preview/audio QA smoke.");
  const probe = spawnSync(ffprobe, ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type", "-of", "json", path], { encoding: "utf8" });
  if (probe.status !== 0) throw new Error(`ffprobe failed for ${path}: ${probe.stderr ?? ""}`);
  const json = JSON.parse(probe.stdout) as { format?: { duration?: string }; streams?: { codec_type?: string }[] };
  return {
    duration: Number(json.format?.duration ?? 0),
    hasAudio: json.streams?.some((stream) => stream.codec_type === "audio") ?? false,
    hasVideo: json.streams?.some((stream) => stream.codec_type === "video") ?? false,
  };
}

let failures = 0;
function check(ok: boolean, message: string): void {
  if (!ok) failures++;
  console.log(`${ok ? "ok  " : "FAIL"} ${message}`);
}

async function main(): Promise<void> {
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });

  console.log("1. frozen Vietnamese transcription policy...");
  const vi = resolveTranscriptionPolicy({ language: "vi-VN" });
  check(vi.model === VIETNAMESE_EDIT_MODEL, `vi-VN resolves model=${vi.model}`);
  check(vi.language === "vi" && vi.vietnamese, "vi-VN canonicalizes to explicit language=vi");
  const en = resolveTranscriptionPolicy({});
  check(en.model === "base.en" && en.language === "en", "non-Vietnamese default remains base.en/en");
  let incompatibleRejected = false;
  try {
    resolveTranscriptionPolicy({ language: "vi", model: "small" });
  } catch {
    incompatibleRejected = true;
  }
  check(incompatibleRejected, "Vietnamese incompatible small model fails closed");

  console.log("2. RPC contracts accept explicit Vietnamese policy inputs...");
  const indexParsed = methods.index_transcript.schema.parse({ assetId: "a0", language: "vi" });
  const captionsParsed = methods.generate_captions.schema.parse({ clipId: "c0", language: "vi" });
  const tightenParsed = methods.tighten_talk.schema.parse({ clipId: "c0", language: "vi" });
  check(indexParsed.language === "vi", "index_transcript accepts language=vi");
  check(captionsParsed.language === "vi", "generate_captions accepts language=vi");
  check(tightenParsed.language === "vi", "tighten_talk accepts language=vi for auto-index");

  console.log("3. frozen 20-sample gap fixture reproduces the DESIGN 13/7 result...");
  const tsv = readFileSync(join(frozenPack, "cut_audition_review.tsv"), "utf8").replace(/^\uFEFF/, "").trim().split(/\r?\n/);
  const header = tsv.shift()!.split("\t");
  const column = Object.fromEntries(header.map((h, i) => [h, i]));
  let safeCut = 0;
  let safeNoop = 0;
  let audioArtifactsOk = true;
  for (const row of tsv.filter(Boolean)) {
    const cols = row.split("\t");
    const left = Number(cols[column.cut_left_sec]);
    const right = Number(cols[column.cut_right_sec]);
    const result = resolveGuardedGapCut(left, right, VIETNAMESE_CUT_GUARD_SEC);
    if (result.status === "SAFE_CUT") safeCut++;
    else safeNoop++;
    for (const key of ["context_audio", "cut_preview_audio"] as const) {
      try {
        if (statSync(join(frozenPack, cols[column[key]])).size <= 44) audioArtifactsOk = false;
      } catch {
        audioArtifactsOk = false;
      }
    }
  }
  check(tsv.length === 20, `frozen cut samples=${tsv.length}`);
  check(safeCut === 13 && safeNoop === 7, `production resolver reproduces SAFE_CUT=${safeCut}, SAFE_NOOP=${safeNoop}`);
  check(audioArtifactsOk, "all retained context/cut-preview WAV artifacts are non-empty");

  console.log("4. word-range guard is fail-closed around speech...");
  const words = [
    { start: 0.5, end: 0.8, text: "xin" },
    { start: 0.85, end: 1.05, text: "à" },
    { start: 1.1, end: 1.4, text: "chào" },
    { start: 1.7, end: 1.9, text: "bạn" },
    { start: 2.3, end: 2.5, text: "nhé" },
  ];
  const unsafe = resolveGuardedWordRemoval(words, 1, 1, 0, 10);
  const safe = resolveGuardedWordRemoval(words, 3, 3, 0, 10);
  check(unsafe.status === "SAFE_NOOP" && unsafe.reviewNeeded, "50ms-adjacent word becomes SAFE_NOOP/review-needed");
  check(safe.status === "SAFE_CUT" && !safe.reviewNeeded, "well-isolated word becomes SAFE_CUT");

  console.log("5. engine Vietnamese delete path performs zero mutation for unsafe range...");
  const projectPath = join(work, "vi.aive");
  const sourceAudio = join(frozenPack, "cut_01_context.wav");
  const sourceProbe = probeMedia(sourceAudio);
  check(sourceProbe.hasAudio && sourceProbe.duration > 1, `retained Vietnamese QA source is valid audio (${sourceProbe.duration.toFixed(3)}s)`);
  const now = Date.now();
  const project: Project = {
    id: "vi-policy-smoke",
    name: "VI policy smoke",
    width: 1920,
    height: 1080,
    fps: 30,
    assets: [{
      id: "a0",
      path: sourceAudio,
      name: "retained-vi-context",
      duration: sourceProbe.duration,
      width: 0,
      height: 0,
      fps: 30,
      hasVideo: false,
      hasAudio: true,
      addedAt: now,
      missing: false,
      transcript: {
        language: "vi",
        model: VIETNAMESE_EDIT_MODEL,
        segments: [{ start: 0.5, end: 2.5, text: words.map((w) => w.text).join(" ") }],
        words,
      },
    }],
    tracks: [{
      id: "v0",
      kind: "video",
      index: 0,
      clips: [{ id: "c0", assetId: "a0", startFrame: 0, sourceInFrame: 0, sourceOutFrame: Math.round(sourceProbe.duration * 30) }],
    }],
    revision: 1,
    schemaVersion: 3,
    createdAt: now,
    updatedAt: now,
  };
  writeFileSync(projectPath, JSON.stringify(project), "utf8");
  const engine = new EditorEngine(join(work, "data"));
  await engine.load(projectPath);
  const call = async <T>(name: keyof typeof methods, params: Record<string, unknown>): Promise<T> => {
    const method = methods[name];
    const parsed = method.schema.parse(params);
    return (await method.handler(engine, parsed as never)) as T;
  };
  const summary = () => call<{ totalFrames: number }>("timeline_summary", {});
  const beforeUnsafe = (await summary()).totalFrames;
  console.log("6. rendered preview/audio QA before and after a safe Vietnamese cut...");
  const previewBefore = await engine.renderPreview();
  const previewBeforeProbe = probeMedia(previewBefore.path);
  check(statSync(previewBefore.path).size > 1024 && previewBeforeProbe.hasAudio && previewBeforeProbe.hasVideo, "pre-cut render_preview is a non-empty A/V artifact");
  check(Math.abs(previewBeforeProbe.duration - beforeUnsafe / 30) < 0.25, `pre-cut preview duration ${previewBeforeProbe.duration.toFixed(3)}s matches timeline`);
  const unsafeReport = await call<{
    cuts: number;
    framesRemoved: number;
    reviewNeeded: { reason: string }[];
  }>("delete_transcript_ranges", { assetId: "a0", ranges: [{ fromWord: 1, toWord: 1 }], padFrames: 60 });
  const afterUnsafe = (await summary()).totalFrames;
  check(unsafeReport.cuts === 0 && unsafeReport.framesRemoved === 0, "unsafe Vietnamese request performs zero cuts");
  check(unsafeReport.reviewNeeded.length === 1, "unsafe Vietnamese request returns reviewNeeded");
  check(afterUnsafe === beforeUnsafe, "unsafe Vietnamese request leaves timeline unchanged");

  const safeReport = await call<{
    cuts: number;
    framesRemoved: number;
    reviewNeeded: unknown[];
  }>("delete_transcript_ranges", { assetId: "a0", ranges: [{ fromWord: 3, toWord: 3 }], padFrames: 60 });
  const afterSafe = (await summary()).totalFrames;
  check(safeReport.cuts >= 1 && safeReport.framesRemoved > 0, "safe Vietnamese word range produces a real ripple cut");
  check(safeReport.reviewNeeded.length === 0, "safe Vietnamese word range needs no manual review");
  check(beforeUnsafe - afterSafe === safeReport.framesRemoved, "safe cut removes exactly the reported frames");

  const previewAfter = await engine.renderPreview();
  const previewAfterProbe = probeMedia(previewAfter.path);
  check(statSync(previewAfter.path).size > 1024 && previewAfterProbe.hasAudio && previewAfterProbe.hasVideo, "post-cut render_preview is a non-empty A/V artifact");
  check(Math.abs(previewAfterProbe.duration - afterSafe / 30) < 0.25, `post-cut preview duration ${previewAfterProbe.duration.toFixed(3)}s matches edited timeline`);
  check(previewAfterProbe.duration < previewBeforeProbe.duration, "safe Vietnamese cut shortens rendered preview without dropping audio");

  console.log(failures === 0 ? "TVE-IMP-008 VI POLICY SMOKE PASSED" : `TVE-IMP-008 VI POLICY SMOKE FAILED (${failures})`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("TVE-IMP-008 VI POLICY SMOKE FAILED:", error);
  process.exit(1);
});
