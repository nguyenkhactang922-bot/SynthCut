import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { EditorEngine } from "../src/engine.js";
import { methods } from "../src/rpc.js";

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

async function expectError(run: () => Promise<unknown>, contains: string): Promise<string> {
  try {
    await run();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    assert(message.includes(contains), `error includes ${JSON.stringify(contains)}`);
    return message;
  }
  throw new Error(`ASSERTION FAILED: expected error containing ${JSON.stringify(contains)}`);
}

function semanticProject(project: ReturnType<EditorEngine["getProject"]>): string {
  const copy = structuredClone(project) as ReturnType<EditorEngine["getProject"]> & {
    revision?: number;
    updatedAt?: number;
  };
  delete copy.revision;
  delete copy.updatedAt;
  return JSON.stringify(copy);
}

function batchDirCount(dataDir: string): number {
  const root = join(dataDir, "tang-batches");
  if (!existsSync(root)) return 0;
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory()).length;
}

function batchPath(dataDir: string, batchId: string, file: string): string {
  return join(dataDir, "tang-batches", batchId, file);
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const tmpRoot = join(repoRoot, ".tmp");
  mkdirSync(tmpRoot, { recursive: true });
  const runRoot = join(tmpRoot, `tve-imp-005-${process.pid}-${Date.now()}`);
  const dataDir = join(runRoot, "data");
  const projectPath = join(runRoot, "batch-fixture.aive");
  mkdirSync(dataDir, { recursive: true });

  let passed = false;
  try {
    const engine = new EditorEngine(dataDir);
    await call(engine, "set_project_settings", { name: "Batch Baseline" });
    await engine.save(projectPath);
    const baselineSemantic = semanticProject(engine.getProject());
    const baselineRevision = engine.getProject().revision;

    console.log("1. stale plan fails before durable batch artifacts or mutation...");
    const staleBefore = batchDirCount(dataDir);
    await expectError(
      () => call(engine, "apply_edit_plan", {
        planId: "plan-stale",
        projectId: engine.getProject().id,
        basedOnRevision: Math.max(0, baselineRevision - 1),
        scope: { startFrame: 0, endFrame: 60 },
        operations: [{
          id: "rename-stale",
          rpcMethod: "set_project_settings",
          params: { name: "Must Not Apply" },
          rationale: "stale rejection proof",
          evidenceRefs: [],
        }],
        expectedEffects: ["none"],
        qaChecks: ["zero mutation"],
        riskLevel: "medium",
      }),
      "STALE_EDIT_PLAN",
    );
    assert(engine.getProject().revision === baselineRevision, "stale rejection leaves revision unchanged");
    assert(semanticProject(engine.getProject()) === baselineSemantic, "stale rejection leaves semantic project unchanged");
    assert(batchDirCount(dataDir) === staleBefore, "stale rejection creates no batch directory");

    console.log("2. forced mid-batch runtime failure rolls back to durable checkpoint...");
    let failureChangeEvents = 0;
    const onFailureChange = () => { failureChangeEvents += 1; };
    engine.on("change", onFailureChange);
    const failureResult = await call<any>(engine, "apply_edit_plan", {
      planId: "plan-forced-failure",
      projectId: engine.getProject().id,
      basedOnRevision: engine.getProject().revision,
      scope: { startFrame: 0, endFrame: 60 },
      operations: [
        {
          id: "rename-before-failure",
          rpcMethod: "set_project_settings",
          params: { name: "Should Roll Back" },
          rationale: "prove first mutation happened before runtime failure",
          evidenceRefs: ["test:forced-failure"],
        },
        {
          id: "remove-last-video-track",
          rpcMethod: "remove_track",
          params: { trackIndex: 0 },
          rationale: "valid schema/reference but runtime invariant rejects last video track",
          evidenceRefs: ["test:runtime-invariant"],
        },
      ],
      expectedEffects: ["rollback"],
      qaChecks: ["semantic baseline restored"],
      riskLevel: "high",
    });
    engine.off("change", onFailureChange);
    assert(failureResult.status === "rolled_back", "forced failure returns rolled_back");
    assert(failureResult.operations.length === 2, "failure audit records attempted operations in order");
    assert(failureResult.operations[0].status === "done", "first operation completed before injected runtime failure");
    assert(failureResult.operations[1].status === "failed", "second operation records failure");
    assert(failureResult.failure?.operationId === "remove-last-video-track", "result identifies exact failed operation");
    assert(semanticProject(engine.getProject()) === baselineSemantic, "rollback restores normalized pre-batch semantic state");
    assert(engine.getProject().revision > baselineRevision, "rollback assigns a fresh revision so old plan tokens stay stale");
    assert(engine.activeCoherentBatchId() === null, "coherent batch lock is released after rollback");
    assert(failureChangeEvents === 1, "clients observe one consolidated change event, not partial operations");
    assert(existsSync(batchPath(dataDir, failureResult.batchId, "checkpoint.aive")), "failure checkpoint remains durable");
    assert(existsSync(batchPath(dataDir, failureResult.batchId, "audit.jsonl")), "failure audit remains durable");
    assert(existsSync(batchPath(dataDir, failureResult.batchId, "result.json")), "failure result remains durable");
    const failureAudit = readFileSync(batchPath(dataDir, failureResult.batchId, "audit.jsonl"), "utf8");
    assert(failureAudit.includes('"type":"operation_done"'), "failure audit contains completed operation entry");
    assert(failureAudit.includes('"type":"operation_failed"'), "failure audit contains failed operation entry");
    assert(failureAudit.includes('"type":"batch_rolled_back"'), "failure audit contains rollback entry");

    console.log("3. successful batch emits durable audit/checkpoint/result and one visible state transition...");
    let successChangeEvents = 0;
    const onSuccessChange = () => { successChangeEvents += 1; };
    engine.on("change", onSuccessChange);
    const successBaselineSemantic = semanticProject(engine.getProject());
    const successResult = await call<any>(engine, "apply_edit_plan", {
      planId: "plan-success",
      projectId: engine.getProject().id,
      basedOnRevision: engine.getProject().revision,
      scope: { startFrame: 0, endFrame: 60 },
      operations: [
        {
          id: "rename-success",
          rpcMethod: "set_project_settings",
          params: { name: "Batch Applied" },
          rationale: "successful batch mutation one",
          evidenceRefs: ["test:success"],
        },
        {
          id: "marker-success",
          rpcMethod: "set_markers",
          params: { frames: [{ frame: 30, name: "Batch Review", note: "verify checkpoint recovery" }] },
          rationale: "successful batch mutation two",
          evidenceRefs: ["test:success"],
        },
      ],
      expectedEffects: ["rename", "marker"],
      qaChecks: ["audit complete", "explicit recovery retained"],
      riskLevel: "medium",
    });
    engine.off("change", onSuccessChange);
    assert(successResult.status === "done", "successful batch returns done");
    assert(successResult.operations.length === 2 && successResult.operations.every((op: any) => op.status === "done"), "successful audit records both operations done");
    assert(engine.getProject().name === "Batch Applied", "successful batch changes authoritative project");
    assert(engine.getProject().markers?.[0]?.frame === 30, "successful batch applies marker mutation");
    assert(successChangeEvents === 1, "successful coherent batch emits one consolidated change event");
    assert(engine.activeCoherentBatchId() === null, "coherent batch lock is released after success");
    assert(existsSync(batchPath(dataDir, successResult.batchId, "checkpoint.aive")), "success checkpoint remains durable");
    assert(existsSync(batchPath(dataDir, successResult.batchId, "result.json")), "success result remains durable");
    const persistedResult = readJson<any>(batchPath(dataDir, successResult.batchId, "result.json"));
    assert(persistedResult.status === "done", "durable result records done status");
    assert(persistedResult.atomicity === "checkpoint-backed-recoverability-not-acid", "result explicitly avoids ACID claim");
    const liveMetadata = engine.getTangMetadata();
    assert(liveMetadata?.batchAuditRefs?.includes(successResult.auditRef), "live Tang metadata indexes batch audit ref");
    assert(liveMetadata?.checkpointRefs?.includes(successResult.checkpointRef), "live Tang metadata indexes checkpoint ref");

    console.log("4. save + restart retains successful state and durable Tang refs...");
    await engine.save(projectPath);
    const restarted = new EditorEngine(dataDir);
    await restarted.load(projectPath);
    assert(restarted.getProject().name === "Batch Applied", "restart loads successful batch state from authoritative .aive");
    assert(restarted.getProject().markers?.[0]?.frame === 30, "restart preserves successful marker");
    const restartedMetadata = restarted.getTangMetadata();
    assert(restartedMetadata?.batchAuditRefs?.includes(successResult.auditRef), "restart retains durable batch audit ref in sidecar");
    assert(restartedMetadata?.checkpointRefs?.includes(successResult.checkpointRef), "restart retains durable checkpoint ref in sidecar");

    console.log("5. explicit recovery after restart restores pre-success semantics with a fresh revision...");
    const loadedRevisionBeforeRecovery = restarted.getProject().revision;
    const recovery = await call<any>(restarted, "restore_edit_batch", { batchId: successResult.batchId });
    assert(recovery.status === "recovered", "explicit recovery returns recovered");
    assert(semanticProject(restarted.getProject()) === successBaselineSemantic, "explicit recovery restores pre-success semantic state");
    assert(restarted.getProject().revision > loadedRevisionBeforeRecovery, "explicit recovery assigns a fresh revision");
    assert(restarted.getCurrentPath() === projectPath, "explicit recovery preserves original project path");
    assert(restarted.activeCoherentBatchId() === null, "coherent batch lock is released after explicit recovery");
    const recoveryAudit = readFileSync(batchPath(dataDir, successResult.batchId, "audit.jsonl"), "utf8");
    assert(recoveryAudit.includes('"type":"explicit_recovery"'), "durable audit records explicit recovery after restart");

    console.log("6. recovered state can be saved and reopened without checkpoint becoming edit truth...");
    await restarted.save(projectPath);
    const reopened = new EditorEngine(dataDir);
    await reopened.load(projectPath);
    assert(semanticProject(reopened.getProject()) === successBaselineSemantic, "reopened authoritative .aive matches recovered semantic state");
    assert(existsSync(batchPath(dataDir, successResult.batchId, "checkpoint.aive")), "checkpoint remains an explicit recovery artifact after save/reopen");

    passed = true;
    console.log("TVE-IMP-005 COHERENT BATCH SMOKE PASSED");
  } finally {
    if (passed) rmSync(runRoot, { recursive: true, force: true });
    else console.error(`Failure artifacts preserved under ${runRoot}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
});
