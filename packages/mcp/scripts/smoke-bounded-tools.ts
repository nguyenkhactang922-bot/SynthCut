import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EditorEngine, EditorServer } from "@aive/core";
import { methods } from "@aive/core/rpc";
import { PROJECT_SCHEMA_VERSION, type Project } from "@aive/core/types";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { PLATFORM_INSTRUCTIONS } from "../src/guide.js";

interface ToolText {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

function parse(result: ToolText): any {
  if (result.isError) throw new Error(`tool error: ${result.content[0]?.text}`);
  const text = result.content.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("tool returned no text payload");
  return JSON.parse(text);
}

function jsonComparable(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value));
}

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const tmpRoot = join(repoRoot, ".tmp");
  mkdirSync(tmpRoot, { recursive: true });
  const runRoot = join(tmpRoot, `tve-imp-003-${process.pid}-${Date.now()}`);
  mkdirSync(runRoot, { recursive: true });
  const dataDir = join(runRoot, "data");
  mkdirSync(dataDir, { recursive: true });
  const projectPath = join(runRoot, "mcp-bounded.aive");

  const fps = 30;
  const assetId = "asset-spoken";
  const words = Array.from({ length: 120 }, (_, i) => ({
    start: Number((i * 0.25).toFixed(3)),
    end: Number((i * 0.25 + 0.15).toFixed(3)),
    text: i === 60 ? "target-word" : `word-${i}`,
  }));
  const segments = Array.from({ length: 30 }, (_, i) => ({
    start: i,
    end: i + 1,
    text: `segment-${i} bounded MCP transport parity`,
  }));
  const project: Project = {
    id: "project-mcp-bounded",
    name: "MCP bounded read fixture",
    width: 1920,
    height: 1080,
    fps,
    assets: [{
      id: assetId,
      path: join(runRoot, "missing.mp4"),
      name: "spoken-source.mp4",
      duration: 30,
      width: 1920,
      height: 1080,
      fps,
      hasVideo: true,
      hasAudio: true,
      addedAt: Date.now(),
      missing: true,
      transcript: { segments, words, model: "large-v3-turbo", language: "vi" },
    }],
    tracks: [{
      id: "track-v1",
      kind: "video",
      index: 0,
      name: "V1",
      clips: [
        { id: "clip-1", assetId, startFrame: 0, sourceInFrame: 0, sourceOutFrame: 450 },
        { id: "clip-2", assetId, startFrame: 450, sourceInFrame: 450, sourceOutFrame: 900 },
      ],
    }],
    markers: [{ frame: 0, name: "Chapter 1", note: "review opening" }],
    revision: 7,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  writeFileSync(projectPath, JSON.stringify(project, null, 2), "utf8");
  writeFileSync(
    join(runRoot, "mcp-bounded.tang.json"),
    JSON.stringify({
      schemaVersion: 1,
      coreProjectId: project.id,
      basedOnRevision: project.revision,
      updatedAt: new Date().toISOString(),
      readModel: {
        chapters: [{
          id: "chapter-1",
          title: "Opening",
          startFrame: 0,
          endFrame: 900,
          summary: "Entire 30 second fixture",
          sceneRefs: ["scene-1"],
        }],
      },
    }, null, 2),
    "utf8",
  );

  const engine = new EditorEngine(dataDir);
  await engine.load(projectPath);
  const server = new EditorServer(engine, { port: 0, dataDir });
  const port = await server.start();
  const coreUrl = `http://127.0.0.1:${port}`;
  let client: Client | undefined;
  let passed = false;

  try {
    console.log(`1. core listening at ${coreUrl}`);
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["packages/mcp/dist/index.js"],
      env: { ...process.env, AIVE_CORE_URL: coreUrl, AIVE_DATA_DIR: dataDir },
    });
    client = new Client({ name: "bounded-tools-smoke", version: "0.0.0" });
    await client.connect(transport);
    console.log("2. MCP client connected over stdio");

    const listed = await client.listTools();
    const boundedNames = ["project_overview", "inspect_range", "inspect_chapter", "get_transcript_window"] as const;
    for (const name of boundedNames) {
      const tool = listed.tools.find((item) => item.name === name);
      assert.ok(tool, `MCP exposes ${name}`);
      assert.equal(tool.annotations?.readOnlyHint, true, `${name} has readOnlyHint=true`);
    }
    console.log(`3. all ${boundedNames.length} bounded tools exposed with readOnlyHint=true`);

    const guide = await client.readResource({ uri: "aive://guide/editing" });
    const guideText = String(guide.contents[0]?.text ?? "");
    for (const required of ["project_overview", "inspect_range", "inspect_chapter"]) {
      assert.ok(guideText.includes(required), `editing guide names ${required}`);
    }
    for (const required of ["project_overview", "get_transcript_window", "indexMutationEligible", "get_state is an explicit full-detail/debug escape hatch"]) {
      assert.ok(PLATFORM_INSTRUCTIONS.includes(required), `platform instructions include ${required}`);
    }
    console.log("4. operator contract teaches bounded long-form path and full-state escape-hatch policy");

    const directMethods = methods as Record<string, { schema: { parse: (value: unknown) => unknown }; handler: (engine: EditorEngine, params: any) => unknown | Promise<unknown> }>;
    const cases: Array<{ name: typeof boundedNames[number]; args: Record<string, unknown> }> = [
      { name: "project_overview", args: {} },
      { name: "inspect_range", args: { startFrame: 0, endFrame: 450 } },
      { name: "inspect_chapter", args: { chapterId: "chapter-1" } },
      { name: "get_transcript_window", args: { assetId, centerWord: 60, radiusWords: 5 } },
    ];

    for (const testCase of cases) {
      const def = directMethods[testCase.name]!;
      const direct = await def.handler(engine, def.schema.parse(testCase.args));
      const throughMcp = parse((await client.callTool({ name: testCase.name, arguments: testCase.args })) as ToolText);
      assert.deepEqual(throughMcp, jsonComparable(direct), `${testCase.name} payload matches core RPC exactly`);
      assert.ok(Buffer.byteLength(JSON.stringify(throughMcp), "utf8") <= 64 * 1024, `${testCase.name} MCP payload <=64 KiB`);
    }
    console.log("5. all four bounded MCP payloads exactly match core RPC and stay <=64 KiB");

    const fullStateTool = listed.tools.find((item) => item.name === "get_state");
    assert.equal(fullStateTool?.annotations?.readOnlyHint, true, "existing get_state registration remains read-only");
    assert.ok(listed.tools.length > boundedNames.length, "existing generic tool registration remains intact");
    console.log(`6. existing generic registration intact (${listed.tools.length} total tools)`);

    passed = true;
    console.log("TVE-IMP-003 MCP BOUNDED TOOLS SMOKE PASSED");
  } finally {
    await client?.close().catch(() => {});
    await server.stop().catch(() => {});
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
