import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EditorEngine } from "../src/engine.js";
import { methods } from "../src/rpc.js";
import { tangMetadataPath, type TangMetadata } from "../src/tang/metadata.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`ASSERTION FAILED: ${message}`);
  console.log(`  ok   ${message}`);
}

async function call(
  engine: EditorEngine,
  name: keyof typeof methods,
  params: Record<string, unknown> = {},
): Promise<unknown> {
  const method = methods[name];
  const parsed = (method.schema as { parse: (input: unknown) => unknown }).parse(params);
  return method.handler(engine, parsed as never);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const tmpRoot = join(repoRoot, ".tmp");
  mkdirSync(tmpRoot, { recursive: true });
  const runRoot = join(tmpRoot, `tve-imp-001-${process.pid}-${Date.now()}`);
  mkdirSync(runRoot, { recursive: true });

  const projectPath = join(runRoot, "fixture.aive");
  const metadataPath = tangMetadataPath(projectPath);
  const dataDir = join(runRoot, "data");
  mkdirSync(dataDir, { recursive: true });

  let passed = false;
  try {
    console.log("1. first save creates adjacent versioned Tang sidecar...");
    const engine = new EditorEngine(dataDir);
    await engine.save(projectPath);
    assert(existsSync(projectPath), ".aive project exists");
    assert(existsSync(metadataPath), "adjacent .tang.json exists");

    const diskProject1 = readJson<{ id: string; revision: number }>(projectPath);
    const sidecar1 = readJson<TangMetadata>(metadataPath);
    assert(sidecar1.schemaVersion === 1, "sidecar schemaVersion=1");
    assert(sidecar1.coreProjectId === diskProject1.id, "sidecar binds core project id");
    assert(sidecar1.basedOnRevision === diskProject1.revision, "sidecar binds persisted revision");
    const forbiddenShadowKeys = ["tracks", "clips", "assets", "timeline"];
    assert(
      forbiddenShadowKeys.every((key) => !(key in (sidecar1 as unknown as Record<string, unknown>))),
      "sidecar contains no shadow timeline/assets/clips",
    );
    assert(engine.getTangMetadataStatus().state === "valid", "live sidecar status is valid after save");

    console.log("2. a normal edit immediately makes derived metadata stale until save...");
    await call(engine, "set_project_settings", { name: "Changed after sidecar save" });
    assert(engine.getTangMetadataStatus().state === "stale", "live revision drift marks metadata stale");
    assert(engine.getTangMetadata() === null, "stale metadata cannot be returned as valid");

    console.log("3. save rebases/replaces sidecar safely...");
    await engine.save(projectPath);
    const diskProject2 = readJson<{ id: string; revision: number }>(projectPath);
    const sidecar2 = readJson<TangMetadata>(metadataPath);
    assert(sidecar2.basedOnRevision === diskProject2.revision, "save rebases sidecar to current persisted revision");
    assert(engine.getTangMetadataStatus().state === "valid", "sidecar returns to valid after save");

    console.log("4. restart/load validates disk binding, then rebases only in-memory session metadata...");
    const engine2 = new EditorEngine(join(runRoot, "data-restart-1"));
    const loaded2 = await engine2.load(projectPath);
    assert(loaded2.id === diskProject2.id, "restart loads authoritative .aive project");
    assert(engine2.getTangMetadataStatus().state === "valid", "valid persisted sidecar is accepted on restart");
    const liveMetadata2 = engine2.getTangMetadata();
    assert(!!liveMetadata2, "valid derived metadata is available after restart");
    assert(liveMetadata2.basedOnRevision === engine2.getProject().revision, "in-memory metadata rebases to live session revision");
    await engine2.save(projectPath);
    const diskProject3 = readJson<{ revision: number }>(projectPath);
    const sidecar3 = readJson<TangMetadata>(metadataPath);
    assert(sidecar3.basedOnRevision === diskProject3.revision, "next save persists rebased session revision");

    console.log("5. stale sidecar fails safe and .aive remains authoritative...");
    writeFileSync(metadataPath, JSON.stringify({ ...sidecar3, basedOnRevision: Math.max(0, sidecar3.basedOnRevision - 1) }, null, 2));
    const engine3 = new EditorEngine(join(runRoot, "data-restart-stale"));
    const loaded3 = await engine3.load(projectPath);
    assert(loaded3.id === diskProject2.id, "stale sidecar does not block .aive load");
    assert(engine3.getTangMetadataStatus().state === "stale", "stale disk sidecar is reported stale");
    await engine3.save(projectPath);
    assert(engine3.getTangMetadataStatus().state === "valid", "save repairs stale sidecar binding");

    console.log("6. malformed sidecar fails safe and save repairs it...");
    writeFileSync(metadataPath, "{ definitely-not-json", "utf8");
    const engine4 = new EditorEngine(join(runRoot, "data-restart-invalid"));
    const loaded4 = await engine4.load(projectPath);
    assert(loaded4.id === diskProject2.id, "malformed sidecar does not block .aive load");
    assert(engine4.getTangMetadataStatus().state === "invalid", "malformed sidecar is reported invalid");
    await engine4.save(projectPath);
    assert(readJson<TangMetadata>(metadataPath).schemaVersion === 1, "save replaces malformed sidecar with valid schema");

    console.log("7. unknown/shadow top-level keys are rejected instead of being re-persisted...");
    const validBeforeShadowTest = readJson<TangMetadata>(metadataPath);
    writeFileSync(metadataPath, JSON.stringify({ ...validBeforeShadowTest, tracks: [{ id: "shadow" }] }, null, 2));
    const engineShadow = new EditorEngine(join(runRoot, "data-restart-shadow-key"));
    const loadedShadow = await engineShadow.load(projectPath);
    assert(loadedShadow.id === diskProject2.id, "shadow-key sidecar does not block .aive load");
    assert(engineShadow.getTangMetadataStatus().state === "invalid", "unknown shadow key makes sidecar invalid");
    await engineShadow.save(projectPath);
    const repairedShadow = readJson<Record<string, unknown>>(metadataPath);
    assert(!("tracks" in repairedShadow), "repair does not re-persist shadow timeline keys");

    console.log("8. deleting sidecar leaves project usable and next save recreates it...");
    rmSync(metadataPath, { force: true });
    const engine5 = new EditorEngine(join(runRoot, "data-restart-missing"));
    const loaded5 = await engine5.load(projectPath);
    assert(loaded5.id === diskProject2.id, "missing sidecar does not block .aive load");
    assert(engine5.getTangMetadataStatus().state === "missing", "missing sidecar is reported missing");
    await call(engine5, "set_project_settings", { name: "Still usable without sidecar" });
    assert(engine5.getProject().name === "Still usable without sidecar", "editing remains usable without sidecar");
    await engine5.save(projectPath);
    assert(existsSync(metadataPath), "save recreates deleted sidecar");
    assert(engine5.getTangMetadataStatus().state === "valid", "recreated sidecar is valid");

    console.log("8. a final restart proves repaired persistence and no temp/backup leakage...");
    const engine6 = new EditorEngine(join(runRoot, "data-restart-final"));
    await engine6.load(projectPath);
    assert(engine6.getTangMetadataStatus().state === "valid", "final restart accepts repaired sidecar");
    const leftovers = readdirSync(runRoot).filter((name) => /\.tang\.json\..*\.(tmp|bak)$/.test(name));
    assert(leftovers.length === 0, "atomic replacement leaves no temp/backup files");

    passed = true;
    console.log("TVE-IMP-001 TANG SIDECAR SMOKE PASSED");
  } finally {
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
