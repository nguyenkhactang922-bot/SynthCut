import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import WebSocket from "ws";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const repoRoot = resolve(".");
const retainedRoot = join(repoRoot, ".spike-temp", "lf001-corrected");
const fixturePath = join(retainedRoot, "lf300.aive");
const ffmpeg = join(retainedRoot, "ffmpeg.exe");
const ffprobe = join(retainedRoot, "ffprobe.exe");
const imp006ResultPath = join(repoRoot, ".tmp", "TVE-IMP-006-runtime.json");

for (const [label, path] of [
  ["30-minute fixture", fixturePath],
  ["ffmpeg", ffmpeg],
  ["ffprobe", ffprobe],
  ["IMP-006 durable runtime result", imp006ResultPath],
] as const) {
  if (!existsSync(path)) throw new Error(`Required ${label} missing: ${path}`);
}

process.env.AIVE_FFMPEG = ffmpeg;
process.env.AIVE_FFPROBE = ffprobe;
process.env.AIVE_HWENC = "off";

const [{ EditorEngine, EditorServer }, { buildLongFormWorkPackets }] = await Promise.all([
  import("../src/index.js"),
  import("../../mcp/src/tang/orchestration.js"),
]);

type ToolText = { content: Array<{ type: string; text?: string }>; isError?: boolean };
type UiState = { type: "state"; project: any; filePath: string | null };

function parseTool(result: ToolText): any {
  if (result.isError) throw new Error(result.content[0]?.text ?? "MCP tool error");
  const text = result.content.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("MCP tool returned no text");
  return JSON.parse(text);
}

async function expectToolError(run: () => Promise<unknown>, contains: string): Promise<string> {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert.ok(message.includes(contains), `error includes ${JSON.stringify(contains)}; got ${message}`);
    return message;
  }
  throw new Error(`Expected error containing ${JSON.stringify(contains)}`);
}

function semanticProject(project: any): string {
  const copy = structuredClone(project);
  delete copy.revision;
  delete copy.updatedAt;
  return JSON.stringify(copy);
}

function clipCount(project: any): number {
  return project.tracks.reduce((sum: number, track: any) => sum + track.clips.length, 0);
}

function waitForUiState(
  states: UiState[],
  predicate: (state: UiState) => boolean,
  timeoutMs = 5000,
): Promise<UiState> {
  const existing = [...states].reverse().find(predicate);
  if (existing) return Promise.resolve(existing);
  return new Promise((resolveWait, rejectWait) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const found = [...states].reverse().find(predicate);
      if (found) {
        clearInterval(timer);
        resolveWait(found);
      } else if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        rejectWait(new Error(`Timed out waiting for UI state after ${timeoutMs}ms`));
      }
    }, 25);
  });
}

async function openUiSocket(port: number, token: string, states: UiState[]): Promise<WebSocket> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/?token=${encodeURIComponent(token)}`);
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message?.type === "state") states.push(message as UiState);
    } catch {
      // Ignore non-JSON diagnostics in this test-only observer.
    }
  });
  await new Promise<void>((resolveOpen, rejectOpen) => {
    const timer = setTimeout(() => rejectOpen(new Error("UI WebSocket open timeout")), 5000);
    ws.once("open", () => { clearTimeout(timer); resolveOpen(); });
    ws.once("error", (error) => { clearTimeout(timer); rejectOpen(error); });
  });
  return ws;
}

async function main(): Promise<void> {
  const runRoot = join(repoRoot, ".tmp", `tve-e2e-001-${process.pid}-${Date.now()}`);
  const dataDir = join(runRoot, "data");
  const projectPath = join(runRoot, "integrated.aive");
  mkdirSync(dataDir, { recursive: true });
  let passed = false;
  let server: InstanceType<typeof EditorServer> | undefined;
  let client: Client | undefined;
  let uiSocket: WebSocket | undefined;

  try {
    console.log("0. bind E2E to already-verified full-render evidence for this exact authoritative fixture...");
    const imp006 = JSON.parse(readFileSync(imp006ResultPath, "utf8"));
    assert.equal(imp006.status, "PASS", "IMP-006 durable result is PASS");
    assert.equal(imp006.fixture.projectId, "proj_jnjvadlpe3", "durable render evidence is bound to expected project id");
    assert.ok(imp006.fixture.clipCount >= 300, "durable render evidence used >=300 clips");
    assert.equal(imp006.fixture.duration, 1800, "durable render evidence used exact 1800-second timeline");
    assert.equal(imp006.cancel.cancelClean, true, "durable export cancel evidence is clean");
    assert.equal(imp006.final.probedDuration, 1800, "durable final ffprobe duration is exact 1800s");
    assert.equal(imp006.final.width, 1920);
    assert.equal(imp006.final.height, 1080);
    assert.equal(imp006.final.fps, 30);
    assert.match(String(imp006.final.videoCodec), /h264|avc/i);
    assert.match(String(imp006.final.audioCodec), /aac/i);
    assert.equal(imp006.final.hasVideo, true);
    assert.equal(imp006.final.hasAudio, true);

    console.log("1. create a contained E2E copy with Vietnamese transcript metadata; original fixture remains read-only...");
    const rawProject = JSON.parse(readFileSync(fixturePath, "utf8"));
    assert.equal(rawProject.id, imp006.fixture.projectId, "fixture id matches durable full-render evidence");
    const firstAsset = rawProject.assets[0];
    firstAsset.transcript = {
      language: "vi",
      model: "large-v3-turbo",
      segments: [{ start: 0.5, end: 2.5, text: "xin à chào bạn nhé" }],
      words: [
        { start: 0.5, end: 0.8, text: "xin" },
        { start: 0.85, end: 1.05, text: "à" },
        { start: 1.1, end: 1.4, text: "chào" },
        { start: 1.7, end: 1.9, text: "bạn" },
        { start: 2.3, end: 2.5, text: "nhé" },
      ],
    };
    writeFileSync(projectPath, JSON.stringify(rawProject, null, 2), "utf8");
    const chapters = Array.from({ length: 6 }, (_, i) => ({
      id: `chapter-${i + 1}`,
      title: `Chapter ${i + 1}`,
      startFrame: i * 9000,
      endFrame: (i + 1) * 9000,
      summary: `E2E bounded chapter ${i + 1}`,
      sceneRefs: [`scene-${i + 1}`],
    }));
    writeFileSync(join(runRoot, "integrated.tang.json"), JSON.stringify({
      schemaVersion: 1,
      coreProjectId: rawProject.id,
      basedOnRevision: rawProject.revision,
      updatedAt: new Date().toISOString(),
      readModel: { chapters },
    }, null, 2), "utf8");

    const engine = new EditorEngine(dataDir);
    await engine.load(projectPath);
    await engine.save(projectPath);
    assert.equal(engine.getProject().id, imp006.fixture.projectId, "E2E uses same authoritative project id as full-render evidence");
    assert.equal(clipCount(engine.getProject()), 310, "E2E authoritative project retains 310 clips");
    assert.equal(engine.timelineDuration(), 1800, "E2E authoritative timeline remains 1800 seconds");
    const liveTranscript = engine.getTranscript(engine.getProject().assets[0]!.id);
    assert.equal(engine.getProject().assets[0]?.transcriptIndexed, true, "live project exposes transcriptIndexed marker rather than heavy transcript payload");
    assert.equal(liveTranscript?.language, "vi");
    assert.equal(liveTranscript?.model, "large-v3-turbo");

    console.log("2. start one production core server; attach UI-state WebSocket and real stdio MCP to the same engine...");
    server = new EditorServer(engine, { port: 0, dataDir });
    const port = await server.start();
    const uiStates: UiState[] = [];
    uiSocket = await openUiSocket(port, server.getToken(), uiStates);
    const initialUi = await waitForUiState(uiStates, (state) => state.project?.id === engine.getProject().id);
    assert.equal(initialUi.project.revision, engine.getProject().revision, "desktop/UI state stream starts on the same project revision");

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["packages/mcp/dist/index.js"],
      env: { ...process.env, AIVE_CORE_URL: `http://127.0.0.1:${port}`, AIVE_DATA_DIR: dataDir },
    });
    client = new Client({ name: "tve-e2e-001", version: "0.0.0" });
    await client.connect(transport);

    console.log("3. bounded MCP reads see the same project/revision and decompose it into chapter-scoped work...");
    const overview = parseTool(await client.callTool({ name: "project_overview", arguments: {} }) as ToolText);
    const overviewBytes = Buffer.byteLength(JSON.stringify(overview), "utf8");
    assert.ok(overviewBytes <= 64 * 1024, `project_overview bounded: ${overviewBytes} bytes`);
    assert.equal(overview.state.projectId, engine.getProject().id);
    assert.equal(overview.state.revision, engine.getProject().revision);
    const packets = buildLongFormWorkPackets(overview);
    assert.equal(packets.length, 6, "30-minute project decomposes to six chapter packets");
    const chapter = parseTool(await client.callTool({ name: "inspect_chapter", arguments: { chapterId: "chapter-1" } }) as ToolText);
    const chapterBytes = Buffer.byteLength(JSON.stringify(chapter), "utf8");
    assert.ok(chapterBytes <= 64 * 1024, `inspect_chapter bounded: ${chapterBytes} bytes`);
    const firstClipId = engine.getProject().tracks[0]!.clips[0]!.id;
    assert.ok(JSON.stringify(chapter).includes(firstClipId), "bounded chapter resolves a real authoritative clip id");

    console.log("4. stale MCP edit plan rejects before mutation and UI state does not advance...");
    const staleRevision = engine.getProject().revision;
    const staleSemantic = semanticProject(engine.getProject());
    const uiStateCountBeforeStale = uiStates.length;
    await expectToolError(
      async () => parseTool(await client!.callTool({ name: "apply_edit_plan", arguments: {
        planId: "e2e-stale",
        projectId: engine.getProject().id,
        basedOnRevision: Math.max(0, staleRevision - 1),
        scope: { startFrame: 0, endFrame: 180 },
        operations: [{
          id: "stale-rename",
          rpcMethod: "set_project_settings",
          params: { name: "MUST NOT APPLY" },
          rationale: "E2E stale rejection",
          evidenceRefs: ["e2e:stale"],
        }],
        expectedEffects: ["none"],
        qaChecks: ["zero mutation"],
        riskLevel: "low",
      } }) as ToolText),
      "STALE_EDIT_PLAN",
    );
    assert.equal(engine.getProject().revision, staleRevision, "stale plan leaves revision unchanged");
    assert.equal(semanticProject(engine.getProject()), staleSemantic, "stale plan leaves semantic project unchanged");
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    assert.equal(uiStates.length, uiStateCountBeforeStale, "stale plan emits no UI state mutation broadcast");

    console.log("5. forced coherent MCP batch failure rolls back 30-minute project and UI observes only restored state...");
    const rollbackBaseline = semanticProject(engine.getProject());
    const rollbackRevision = engine.getProject().revision;
    const secondTrackIndex = engine.getProject().tracks.filter((track: any) => track.kind === "video")[1]!.index;
    const firstTrackIndex = engine.getProject().tracks.filter((track: any) => track.kind === "video")[0]!.index;
    const uiBeforeRollback = uiStates.length;
    const rollback = parseTool(await client.callTool({ name: "apply_edit_plan", arguments: {
      planId: "e2e-forced-rollback",
      projectId: engine.getProject().id,
      basedOnRevision: rollbackRevision,
      scope: { startFrame: 0, endFrame: 180 },
      operations: [
        {
          id: "remove-second-video-track",
          rpcMethod: "remove_track",
          params: { trackIndex: secondTrackIndex },
          rationale: "first valid mutation before invariant failure",
          evidenceRefs: ["e2e:rollback"],
        },
        {
          id: "remove-last-video-track",
          rpcMethod: "remove_track",
          params: { trackIndex: firstTrackIndex },
          rationale: "runtime invariant must reject last video track",
          evidenceRefs: ["e2e:rollback"],
        },
      ],
      expectedEffects: ["rollback"],
      qaChecks: ["310 clips restored", "two video tracks restored"],
      riskLevel: "high",
    } }) as ToolText);
    assert.equal(rollback.status, "rolled_back");
    assert.equal(rollback.operations[0].status, "done");
    assert.equal(rollback.operations[1].status, "failed");
    assert.equal(semanticProject(engine.getProject()), rollbackBaseline, "rollback restores full pre-batch semantic project");
    assert.ok(engine.getProject().revision > rollbackRevision, "rollback issues a fresh revision");
    assert.equal(clipCount(engine.getProject()), 310, "rollback restores all 310 clips");
    const rollbackUi = await waitForUiState(uiStates, (state) => state.project?.revision === engine.getProject().revision);
    assert.equal(rollbackUi.project.id, engine.getProject().id, "UI receives restored authoritative project id");
    assert.equal(clipCount(rollbackUi.project), 310, "UI receives restored 310-clip project");
    assert.equal(uiStates.length, uiBeforeRollback + 1, "coherent rollback exposes one consolidated UI state transition");

    console.log("6. Vietnamese fail-closed transcript cut runs through the same MCP/core/UI authority with zero mutation...");
    const viBeforeRevision = engine.getProject().revision;
    const viBeforeSemantic = semanticProject(engine.getProject());
    const uiBeforeVi = uiStates.length;
    const viReport = parseTool(await client.callTool({ name: "delete_transcript_ranges", arguments: {
      assetId: engine.getProject().assets[0]!.id,
      ranges: [{ fromWord: 1, toWord: 1 }],
      padFrames: 60,
    } }) as ToolText);
    assert.equal(viReport.cuts, 0, "unsafe Vietnamese word request performs zero cuts");
    assert.equal(viReport.framesRemoved, 0, "unsafe Vietnamese word request removes zero frames");
    assert.equal(viReport.reviewNeeded.length, 1, "unsafe Vietnamese word request is review-needed");
    assert.equal(engine.getProject().revision, viBeforeRevision, "unsafe Vietnamese request leaves revision unchanged");
    assert.equal(semanticProject(engine.getProject()), viBeforeSemantic, "unsafe Vietnamese request leaves semantic project unchanged");
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
    assert.equal(uiStates.length, uiBeforeVi, "unsafe Vietnamese NOOP emits no UI mutation broadcast");

    console.log("7. save/restart preserves authoritative project and recovery refs; no shadow edit truth appears...");
    await engine.save(projectPath);
    const savedRevision = engine.getProject().revision;
    const savedSemantic = semanticProject(engine.getProject());
    const savedMetadata = engine.getTangMetadata();
    assert.ok((savedMetadata?.batchAuditRefs ?? []).includes(rollback.auditRef), "rollback audit ref is indexed in derived Tang metadata");
    assert.ok((savedMetadata?.checkpointRefs ?? []).includes(rollback.checkpointRef), "rollback checkpoint ref is indexed in derived Tang metadata");

    await client.close();
    client = undefined;
    uiSocket.close();
    uiSocket = undefined;
    await server.stop();
    server = undefined;

    const restarted = new EditorEngine(dataDir);
    await restarted.load(projectPath);
    assert.equal(restarted.getProject().id, imp006.fixture.projectId, "restart keeps same authoritative project id");
    assert.equal(semanticProject(restarted.getProject()), savedSemantic, "restart restores authoritative semantic project");
    assert.ok(restarted.getProject().revision > savedRevision, "restart refreshes revision token");
    assert.equal(clipCount(restarted.getProject()), 310, "restart retains 310 clips");
    const restartedMetadata = restarted.getTangMetadata();
    assert.ok((restartedMetadata?.batchAuditRefs ?? []).includes(rollback.auditRef), "rollback audit ref survives restart");
    assert.ok((restartedMetadata?.checkpointRefs ?? []).includes(rollback.checkpointRef), "rollback checkpoint ref survives restart");

    console.log("8. verify no CapCut runtime/dependency is required by this integrated local path...");
    const packageText = [
      readFileSync(join(repoRoot, "package.json"), "utf8"),
      existsSync(join(repoRoot, "apps", "desktop", "package.json")) ? readFileSync(join(repoRoot, "apps", "desktop", "package.json"), "utf8") : "",
      existsSync(join(repoRoot, "packages", "core", "package.json")) ? readFileSync(join(repoRoot, "packages", "core", "package.json"), "utf8") : "",
    ].join("\n").toLowerCase();
    assert.ok(!packageText.includes("capcut"), "project package manifests contain no required CapCut dependency");

    const summary = {
      status: "PASS",
      projectId: restarted.getProject().id,
      clips: clipCount(restarted.getProject()),
      duration: restarted.timelineDuration(),
      mcp: { overviewBytes, chapterBytes, packets: packets.length },
      ui: { initialRevision: initialUi.project.revision, rollbackRevision: rollbackUi.project.revision, consolidatedRollbackBroadcasts: 1 },
      stalePlan: { rejected: true, zeroMutation: true },
      rollback: { status: rollback.status, auditRef: rollback.auditRef, checkpointRef: rollback.checkpointRef, restoredClips: clipCount(restarted.getProject()) },
      vietnamese: { language: restarted.getTranscript(restarted.getProject().assets[0]!.id)?.language, model: restarted.getTranscript(restarted.getProject().assets[0]!.id)?.model, cuts: viReport.cuts, reviewNeeded: viReport.reviewNeeded.length },
      restart: { persisted: true, revisionRefreshed: restarted.getProject().revision > savedRevision },
      reusedDurableEvidence: {
        imp006Final1080p: true,
        finalDuration: imp006.final.probedDuration,
        finalCodec: `${imp006.final.videoCodec}+${imp006.final.audioCodec}`,
        cancelClean: imp006.cancel.cancelClean,
        ui300Evidence: "docs/evidence/implementation/TVE-IMP-007.md",
        qaCoordinatorEvidence: "docs/evidence/implementation/TVE-IMP-011.md",
      },
      capCutRequired: false,
    };
    writeFileSync(join(repoRoot, ".tmp", "TVE-E2E-001-runtime.json"), JSON.stringify(summary, null, 2), "utf8");
    console.log(JSON.stringify(summary));
    console.log("TVE-E2E-001 INTEGRATED PROOF PASSED");
    passed = true;
  } finally {
    await client?.close().catch(() => {});
    uiSocket?.close();
    await server?.stop().catch(() => {});
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`E2E failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
