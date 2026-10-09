import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const retainedFixtureRoot = join(repoRoot, ".spike-temp", "lf001-corrected");
const ffmpeg = join(retainedFixtureRoot, "ffmpeg.exe");
const ffprobe = join(retainedFixtureRoot, "ffprobe.exe");
const source = join(retainedFixtureRoot, "source-6s.mp4");

for (const [label, path] of [["ffmpeg", ffmpeg], ["ffprobe", ffprobe], ["source fixture", source]] as const) {
  if (!existsSync(path)) throw new Error(`Required retained ${label} is missing: ${path}`);
}

// executor.ts captures these at module load time, so set them before importing core modules.
process.env.AIVE_FFMPEG = ffmpeg;
process.env.AIVE_FFPROBE = ffprobe;
process.env.AIVE_HWENC = "off";

const [{ EditorEngine }, { methods }] = await Promise.all([
  import("../src/engine.js"),
  import("../src/rpc.js"),
]);

type Engine = InstanceType<typeof EditorEngine>;

type QaRecord = {
  qaId: string;
  evidenceRef: string;
  verdict: "pass" | "fail" | "stale";
  accepted: boolean;
  structural: { pass: boolean; clipCount: number };
  renderedFrames: Array<{ artifactRef: string }>;
  preview?: { probe: { video: unknown; audio: unknown } };
  delivery?: {
    checks: { durationMatches: boolean; canvasMatches: boolean; audioPresentWhenRequired: boolean };
  };
  nextAction: { kind: string };
};

function check(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ok   ${message}`);
}

async function call<T>(engine: Engine, name: keyof typeof methods, params: Record<string, unknown> = {}): Promise<T> {
  const entry = methods[name];
  const parsed = (entry.schema as { parse: (value: unknown) => unknown }).parse(params);
  return (await entry.handler(engine, parsed as never)) as T;
}

function qaRecordPath(dataDir: string, record: QaRecord): string {
  return join(dataDir, "tang-evidence", record.qaId, "record.json");
}

function qaFramePath(dataDir: string, record: QaRecord, artifactRef: string): string {
  const prefix = `tang-evidence:${record.qaId}/`;
  check(artifactRef.startsWith(prefix), `frame ref is bound to ${record.qaId}`);
  return join(dataDir, "tang-evidence", record.qaId, artifactRef.slice(prefix.length));
}

async function main(): Promise<void> {
  const runRoot = join(repoRoot, ".tmp", `tve-imp-011-${process.pid}-${Date.now()}`);
  const dataDir = join(runRoot, "data");
  const projectPath = join(runRoot, "qa-fixture.aive");
  const goodDelivery = join(runRoot, "delivery-good.mp4");
  mkdirSync(dataDir, { recursive: true });
  let passed = false;

  try {
    const engine = new EditorEngine(dataDir);

    console.log("1. build one small authoritative A/V project and final delivery...");
    const imported = await call<{ asset: { id: string; duration: number; hasAudio: boolean; width: number; height: number } }>(
      engine,
      "import_video",
      { path: source },
    );
    check(imported.asset.hasAudio, "retained fixture has audio");
    check(imported.asset.width === 1920 && imported.asset.height === 1080, "retained fixture is 1920x1080");
    await call(engine, "add_clip", { assetId: imported.asset.id, sourceOutFrame: 90 });
    await engine.save(projectPath);
    const projectId = engine.getProject().id;
    const basedOnRevision = engine.getProject().revision;
    check(engine.timelineDurationFrames() === 90, "authoritative timeline is exactly 90 frames");

    await call(engine, "export_video", {
      outputPath: goodDelivery,
      container: "mp4",
      videoCodec: "h264",
      quality: 28,
      encoderPreset: "ultrafast",
      audioCodec: "aac",
      audioBitrate: "96k",
    });
    check(existsSync(goodDelivery), "good final-delivery artifact exists");

    console.log("2. stale QA fails closed before render acceptance and remains durable...");
    const stale = await call<QaRecord>(engine, "run_qa_verification", {
      projectId,
      basedOnRevision: Math.max(0, basedOnRevision - 1),
      mode: "post_batch",
      frameSeconds: [1],
    });
    check(stale.verdict === "stale" && !stale.accepted, "stale binding returns STALE/not accepted");
    check(stale.nextAction.kind === "replan", "stale binding requires replan");
    check(stale.renderedFrames.length === 0, "stale QA produces no rendered-frame acceptance evidence");
    check(existsSync(qaRecordPath(dataDir, stale)), "stale QA record is durably written");
    const staleRead = await call<QaRecord>(engine, "get_qa_evidence", { evidenceRef: stale.evidenceRef });
    check(staleRead.verdict === "stale", "stale durable record is readable by logical evidenceRef");
    check(!(engine.getTangMetadata()?.evidenceRefs ?? []).includes(stale.evidenceRef), "stale evidenceRef is not indexed as accepted evidence");

    console.log("3. wrong-duration final delivery fails closed but keeps diagnostic evidence...");
    const failed = await call<QaRecord>(engine, "run_qa_verification", {
      projectId,
      basedOnRevision,
      mode: "final_delivery",
      frameSeconds: [1],
      deliveryPath: source,
      requireAudio: true,
    });
    check(failed.verdict === "fail" && !failed.accepted, "mismatched delivery returns FAIL/not accepted");
    check(failed.nextAction.kind === "replan", "failed delivery requires correction/replan");
    check(failed.delivery?.checks.durationMatches === false, "failed delivery records duration mismatch");
    check(!!failed.preview?.probe.video && !!failed.preview?.probe.audio, "failed QA still captures preview A/V diagnostics");
    check(failed.renderedFrames.length >= 1, "failed QA keeps rendered-frame diagnostic evidence");
    check(existsSync(qaRecordPath(dataDir, failed)), "failed QA record is durably written");
    const failedRead = await call<QaRecord>(engine, "get_qa_evidence", { evidenceRef: failed.evidenceRef });
    check(failedRead.verdict === "fail", "failed durable record is readable by logical evidenceRef");
    check(!(engine.getTangMetadata()?.evidenceRefs ?? []).includes(failed.evidenceRef), "failed evidenceRef is not indexed as accepted evidence");

    console.log("4. matching final delivery produces accepted structural/frame/preview/delivery evidence...");
    const good = await call<QaRecord>(engine, "run_qa_verification", {
      projectId,
      basedOnRevision,
      mode: "final_delivery",
      frameSeconds: [0.5, 1.5, 2.5],
      deliveryPath: goodDelivery,
      requireAudio: true,
    });
    check(good.verdict === "pass" && good.accepted, "matching delivery returns PASS/accepted");
    check(good.nextAction.kind === "continue", "PASS evidence authorizes continue");
    check(good.structural.pass && good.structural.clipCount === 1, "structural QA passes on one authoritative clip");
    check(good.renderedFrames.length === 3, "three exact rendered-frame evidence artifacts were captured");
    for (const frame of good.renderedFrames) {
      check(existsSync(qaFramePath(dataDir, good, frame.artifactRef)), `durable frame artifact exists: ${frame.artifactRef}`);
    }
    check(!!good.preview?.probe.video && !!good.preview?.probe.audio, "PASS preview probe records both video and audio");
    check(
      good.delivery?.checks.durationMatches === true &&
      good.delivery?.checks.canvasMatches === true &&
      good.delivery?.checks.audioPresentWhenRequired === true,
      "PASS delivery records ffprobe-backed duration/canvas/audio checks",
    );
    check(existsSync(qaRecordPath(dataDir, good)), "PASS QA record is durably written");
    const goodRead = await call<QaRecord>(engine, "get_qa_evidence", { evidenceRef: good.evidenceRef });
    check(goodRead.verdict === "pass" && goodRead.accepted, "PASS durable record is readable by logical evidenceRef");

    const liveRefs = engine.getTangMetadata()?.evidenceRefs ?? [];
    check(liveRefs.includes(good.evidenceRef), "only PASS evidenceRef is indexed into live Tang metadata");
    check(!liveRefs.includes(stale.evidenceRef) && !liveRefs.includes(failed.evidenceRef), "STALE/FAIL refs remain excluded from accepted evidence index");

    console.log("5. save/restart persists accepted evidence refs without making evidence edit truth...");
    await engine.save(projectPath);
    const restarted = new EditorEngine(dataDir);
    await restarted.load(projectPath);
    check(restarted.timelineDurationFrames() === 90, "restart loads authoritative .aive timeline unchanged");
    const restartedRefs = restarted.getTangMetadata()?.evidenceRefs ?? [];
    check(restartedRefs.includes(good.evidenceRef), "accepted evidenceRef persists in adjacent Tang sidecar after save/restart");
    check(!restartedRefs.includes(stale.evidenceRef) && !restartedRefs.includes(failed.evidenceRef), "rejected evidenceRefs remain absent after restart");
    const restartedGood = await call<QaRecord>(restarted, "get_qa_evidence", { evidenceRef: good.evidenceRef });
    check(restartedGood.verdict === "pass", "durable PASS QA record remains readable after restart");

    passed = true;
    console.log("TVE-IMP-011 QA COORDINATOR SMOKE PASSED");
  } finally {
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((error) => {
  console.error("TVE-IMP-011 QA COORDINATOR SMOKE FAILED:", error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
