import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EditorEngine, EditorServer } from "@aive/core";
import { PROJECT_SCHEMA_VERSION, type Project } from "@aive/core/types";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { buildLongFormWorkPackets } from "../src/tang/orchestration.js";

type ToolText = { content: Array<{ type: string; text?: string }>; isError?: boolean };
function parse(result: ToolText): any {
  if (result.isError) throw new Error(result.content[0]?.text ?? "tool error");
  const text = result.content.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("tool returned no text");
  return JSON.parse(text);
}

async function main(): Promise<void> {
  const root = process.cwd();
  const runRoot = join(root, ".tmp", `tve-imp-010-${process.pid}-${Date.now()}`);
  const dataDir = join(runRoot, "data");
  mkdirSync(dataDir, { recursive: true });
  const fps = 30;
  const clipFrames = 180;
  const clipCount = 300;
  const durationFrames = fps * 60 * 30;
  const assetId = "asset-long-form";
  const clips = Array.from({ length: clipCount }, (_, i) => ({
    id: `clip-${String(i + 1).padStart(3, "0")}`,
    assetId,
    startFrame: i * clipFrames,
    sourceInFrame: 0,
    sourceOutFrame: clipFrames,
  }));
  const project: Project = {
    id: "project-long-form-30m",
    name: "30m orchestration fixture",
    width: 1920,
    height: 1080,
    fps,
    assets: [{
      id: assetId,
      path: join(runRoot, "missing.mp4"),
      name: "source.mp4",
      duration: 1800,
      width: 1920,
      height: 1080,
      fps,
      hasVideo: true,
      hasAudio: true,
      addedAt: Date.now(),
      missing: true,
      transcript: {
        segments: [{ start: 0, end: 1800, text: "representative Vietnamese long form transcript" }],
        words: [{ start: 0, end: 0.4, text: "xin" }, { start: 0.5, end: 0.9, text: "chao" }],
        model: "large-v3-turbo",
        language: "vi",
      },
    }],
    tracks: [{ id: "v0", kind: "video", index: 0, name: "V1", clips }],
    markers: [],
    revision: 11,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const projectPath = join(runRoot, "long-form.aive");
  writeFileSync(projectPath, JSON.stringify(project, null, 2), "utf8");
  const chapters = Array.from({ length: 6 }, (_, i) => ({
    id: `chapter-${i + 1}`,
    title: `Chapter ${i + 1}`,
    startFrame: i * 9000,
    endFrame: (i + 1) * 9000,
    summary: `bounded chapter ${i + 1}`,
    sceneRefs: [`scene-${i + 1}`],
  }));
  writeFileSync(join(runRoot, "long-form.tang.json"), JSON.stringify({
    schemaVersion: 1,
    coreProjectId: project.id,
    basedOnRevision: project.revision,
    updatedAt: new Date().toISOString(),
    readModel: { chapters },
  }, null, 2), "utf8");

  const engine = new EditorEngine(dataDir);
  await engine.load(projectPath);
  const server = new EditorServer(engine, { port: 0, dataDir });
  const port = await server.start();
  let client: Client | undefined;
  let passed = false;
  try {
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["packages/mcp/dist/index.js"],
      env: { ...process.env, AIVE_CORE_URL: `http://127.0.0.1:${port}`, AIVE_DATA_DIR: dataDir },
    });
    client = new Client({ name: "imp010-smoke", version: "0.0.0" });
    await client.connect(transport);

    const prompts = await client.listPrompts();
    assert.ok(prompts.prompts.some((p) => p.name === "edit_long_form"), "edit_long_form prompt exposed");
    const prompt = await client.getPrompt({
      name: "edit_long_form",
      arguments: { goal: "Tighten a 30-minute Vietnamese documentary for retention", platform: "widescreen", targetMinutes: "30", language: "vi" },
    });
    const content = prompt.messages[0]?.content;
    const promptText = content && "text" in content ? String(content.text) : "";
    for (const token of ["PROJECT -> CHAPTER -> SCENE/BEAT -> EDIT ACTION", "project_overview", "dry_run_edit_plan", "apply_edit_plan", "language=vi", "large-v3-turbo", "Never write .aive directly"]) {
      assert.ok(promptText.includes(token), `prompt contains ${token}`);
    }

    const overview = parse(await client.callTool({ name: "project_overview", arguments: {} }) as ToolText);
    const overviewBytes = Buffer.byteLength(JSON.stringify(overview), "utf8");
    assert.ok(overviewBytes <= 64 * 1024, "overview bounded");
    assert.equal(overview.state.projectId, project.id);
    const packets = buildLongFormWorkPackets(overview);
    assert.equal(packets.length, 6, "30m fixture decomposes into six chapter packets");
    assert.ok(packets.every((packet) => packet.basedOnRevision === overview.state.revision));

    const chapter = parse(await client.callTool({ name: "inspect_chapter", arguments: { chapterId: "chapter-1" } }) as ToolText);
    const chapterBytes = Buffer.byteLength(JSON.stringify(chapter), "utf8");
    assert.ok(chapterBytes <= 64 * 1024, "chapter read bounded");
    const clipId = "clip-001";
    assert.ok(JSON.stringify(chapter).includes(clipId), "bounded chapter resolves real clip id");

    const plan = {
      planId: "imp010-plan-1",
      projectId: overview.state.projectId,
      basedOnRevision: overview.state.revision,
      scope: { chapterId: "chapter-1" },
      operations: [{
        id: "op-volume",
        rpcMethod: "set_clip_volume",
        params: { clipId, volume: 0.8 },
        rationale: "reduce opening bed for dialogue",
        affectedRangeEstimate: { startFrame: 0, endFrame: clipFrames },
        evidenceRefs: ["bounded:chapter-1"],
      }],
      expectedEffects: ["opening dialogue clearer"],
      qaChecks: ["inspect_timeline", "get_frame", "render_preview"],
      riskLevel: "low",
    };
    const before = JSON.stringify(engine.getProject());
    const dry = parse(await client.callTool({ name: "dry_run_edit_plan", arguments: plan }) as ToolText);
    assert.equal(dry.operationCount, 1);
    assert.equal(JSON.stringify(engine.getProject()), before, "dry-run is non-mutating");
    assert.deepEqual(packets[0]!.mutationSequence, ["dry_run_edit_plan", "apply_edit_plan"], "plan-before-mutation order fixed");
    assert.ok(!promptText.includes("get_state first"), "no whole-state default");
    assert.ok(promptText.includes("shared SynthCut project"), "no shadow timeline contract");

    console.log(JSON.stringify({ packets: packets.length, overviewBytes, chapterBytes, revision: overview.state.revision, clipId, dryRunOperations: dry.operationCount }));
    console.log("TVE-IMP-010 LONG-FORM ORCHESTRATION SMOKE PASSED");
    passed = true;
  } finally {
    await client?.close().catch(() => {});
    await server.stop().catch(() => {});
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
