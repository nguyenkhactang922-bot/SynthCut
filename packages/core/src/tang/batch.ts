import { randomUUID } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { EditorEngine, EngineBatchCheckpoint } from "../engine.js";
import {
  dryRunEditPlan,
  editPlanSchema,
  type PlannedOperationParser,
} from "./edit-plan.js";

export const EDIT_BATCH_ID_PATTERN = /^batch-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type PlannedOperationExecutor = (
  engine: EditorEngine,
  rpcMethod: string,
  params: Record<string, unknown>,
) => unknown;

export interface EditBatchOperationRecord {
  id: string;
  rpcMethod: string;
  status: "done" | "failed";
  revisionBefore: number;
  revisionAfter?: number;
  error?: string;
}

export interface EditBatchResult {
  schemaVersion: 1;
  batchId: string;
  planId: string;
  projectId: string;
  status: "done" | "rolled_back" | "rollback_failed";
  projectRevisionBefore: number;
  projectRevisionAfter: number;
  startedAt: string;
  endedAt: string;
  operations: EditBatchOperationRecord[];
  changedClipIds: string[];
  affectedFrameRanges: Array<{ startFrame: number; endFrame: number }>;
  auditRef: string;
  checkpointRef: string;
  resultRef: string;
  rollbackRef?: string;
  failure?: { operationId: string; error: string };
  rollbackError?: string;
  atomicity: "checkpoint-backed-recoverability-not-acid";
}

export interface EditBatchRecoveryResult {
  batchId: string;
  projectId: string;
  status: "recovered";
  projectRevisionAfter: number;
  auditRef: string;
  checkpointRef: string;
  atomicity: "checkpoint-backed-recoverability-not-acid";
}

interface CheckpointMeta {
  schemaVersion: 1;
  batchId: string;
  planId: string;
  projectId: string;
  basedOnRevision: number;
  createdAt: string;
  engineContext: Omit<EngineBatchCheckpoint, "project">;
}

interface BatchPaths {
  dir: string;
  checkpoint: string;
  checkpointMeta: string;
  audit: string;
  result: string;
  auditRef: string;
  checkpointRef: string;
  resultRef: string;
}

/** Apply a validated EditPlan as one checkpoint-protected coherent batch. */
export function applyEditPlanBatch(
  engine: EditorEngine,
  rawPlan: unknown,
  parseOperation: PlannedOperationParser,
  executeOperation: PlannedOperationExecutor,
): EditBatchResult {
  const plan = editPlanSchema.parse(rawPlan);
  // Initial fail-closed validation happens before any durable batch artifact exists.
  dryRunEditPlan(engine, plan, parseOperation);

  const batchId = `batch-${randomUUID()}`;
  const paths = batchPaths(engine, batchId);
  const checkpoint = engine.captureBatchCheckpoint();
  if (checkpoint.project.id !== plan.projectId || checkpoint.project.revision !== plan.basedOnRevision) {
    throw new Error("STALE_EDIT_PLAN: project changed before checkpoint capture; rebuild the plan before mutation.");
  }

  mkdirSync(paths.dir, { recursive: true });
  writeDurable(paths.checkpoint, JSON.stringify(checkpoint.project, null, 2));
  const { project: _project, ...engineContext } = checkpoint;
  const meta: CheckpointMeta = {
    schemaVersion: 1,
    batchId,
    planId: plan.planId,
    projectId: plan.projectId,
    basedOnRevision: plan.basedOnRevision,
    createdAt: new Date().toISOString(),
    engineContext,
  };
  writeDurable(paths.checkpointMeta, JSON.stringify(meta, null, 2));
  appendAudit(paths.audit, {
    type: "batch_started",
    at: meta.createdAt,
    batchId,
    planId: plan.planId,
    projectId: plan.projectId,
    basedOnRevision: plan.basedOnRevision,
  });

  engine.beginCoherentBatch(batchId);
  let lockedDryRun;
  try {
    // Recheck immediately before the first mutation while the coherent lock is held.
    try {
      lockedDryRun = dryRunEditPlan(engine, plan, parseOperation);
    } catch (error) {
      rmSync(paths.dir, { recursive: true, force: true });
      throw error;
    }

    const startedAt = new Date().toISOString();
    const operationRecords: EditBatchOperationRecord[] = [];

    for (const operation of plan.operations) {
      const revisionBefore = engine.getProject().revision;
      appendAudit(paths.audit, {
        type: "operation_attempted",
        at: new Date().toISOString(),
        batchId,
        operationId: operation.id,
        rpcMethod: operation.rpcMethod,
        params: operation.params,
        rationale: operation.rationale,
        evidenceRefs: operation.evidenceRefs,
        revisionBefore,
      });

      try {
        const value = executeOperation(engine, operation.rpcMethod, operation.params);
        if (isPromiseLike(value)) {
          throw new Error(`EditPlan v1 operation "${operation.rpcMethod}" resolved asynchronously; coherent batches accept synchronous deterministic mutations only.`);
        }
        const revisionAfter = engine.getProject().revision;
        const record: EditBatchOperationRecord = {
          id: operation.id,
          rpcMethod: operation.rpcMethod,
          status: "done",
          revisionBefore,
          revisionAfter,
        };
        operationRecords.push(record);
        appendAudit(paths.audit, {
          type: "operation_done",
          at: new Date().toISOString(),
          batchId,
          ...record,
        });
      } catch (error) {
        const message = errorMessage(error);
        const failed: EditBatchOperationRecord = {
          id: operation.id,
          rpcMethod: operation.rpcMethod,
          status: "failed",
          revisionBefore,
          error: message,
        };
        operationRecords.push(failed);
        appendAudit(paths.audit, {
          type: "operation_failed",
          at: new Date().toISOString(),
          batchId,
          ...failed,
        });
        return rollbackFailedBatch(
          engine,
          paths,
          meta,
          plan.planId,
          plan.projectId,
          startedAt,
          operationRecords,
          lockedDryRun.prediction.clipIds,
          lockedDryRun.prediction.ranges,
          operation.id,
          message,
        );
      }
    }

    const result: EditBatchResult = {
      schemaVersion: 1,
      batchId,
      planId: plan.planId,
      projectId: plan.projectId,
      status: "done",
      projectRevisionBefore: plan.basedOnRevision,
      projectRevisionAfter: engine.getProject().revision,
      startedAt,
      endedAt: new Date().toISOString(),
      operations: operationRecords,
      changedClipIds: [...lockedDryRun.prediction.clipIds],
      affectedFrameRanges: lockedDryRun.prediction.ranges.map((range) => ({ ...range })),
      auditRef: paths.auditRef,
      checkpointRef: paths.checkpointRef,
      resultRef: paths.resultRef,
      atomicity: "checkpoint-backed-recoverability-not-acid",
    };
    appendAudit(paths.audit, {
      type: "batch_done",
      at: result.endedAt,
      batchId,
      projectRevisionAfter: result.projectRevisionAfter,
    });
    writeDurable(paths.result, JSON.stringify(result, null, 2));
    engine.recordTangBatchReferences({
      batchAuditRef: paths.auditRef,
      checkpointRef: paths.checkpointRef,
    });
    return result;
  } finally {
    engine.endCoherentBatch(batchId);
  }
}

/** Restore the durable pre-batch checkpoint by generated batch id, including after restart. */
export function restoreEditBatch(engine: EditorEngine, batchId: string): EditBatchRecoveryResult {
  const paths = batchPaths(engine, batchId);
  if (!existsSync(paths.checkpoint) || !existsSync(paths.checkpointMeta)) {
    throw new Error(`Unknown or incomplete edit batch "${batchId}"; durable checkpoint is unavailable.`);
  }
  const checkpoint = readCheckpoint(paths);
  if (checkpoint.project.id !== engine.getProject().id) {
    throw new Error(
      `Edit batch "${batchId}" targets project "${checkpoint.project.id}" but current project is "${engine.getProject().id}". Open the matching project before recovery.`,
    );
  }

  engine.beginCoherentBatch(batchId);
  try {
    engine.restoreBatchCheckpoint(checkpoint);
    const recoveredAt = new Date().toISOString();
    appendAudit(paths.audit, {
      type: "explicit_recovery",
      at: recoveredAt,
      batchId,
      projectRevisionAfter: engine.getProject().revision,
    });
    engine.recordTangBatchReferences({
      batchAuditRef: paths.auditRef,
      checkpointRef: paths.checkpointRef,
    });
    return {
      batchId,
      projectId: engine.getProject().id,
      status: "recovered",
      projectRevisionAfter: engine.getProject().revision,
      auditRef: paths.auditRef,
      checkpointRef: paths.checkpointRef,
      atomicity: "checkpoint-backed-recoverability-not-acid",
    };
  } finally {
    engine.endCoherentBatch(batchId);
  }
}

function rollbackFailedBatch(
  engine: EditorEngine,
  paths: BatchPaths,
  meta: CheckpointMeta,
  planId: string,
  projectId: string,
  startedAt: string,
  operations: EditBatchOperationRecord[],
  changedClipIds: string[],
  affectedFrameRanges: Array<{ startFrame: number; endFrame: number }>,
  failedOperationId: string,
  failureMessage: string,
): EditBatchResult {
  let status: EditBatchResult["status"] = "rolled_back";
  let rollbackError: string | undefined;
  try {
    engine.restoreBatchCheckpoint(readCheckpoint(paths));
    appendAudit(paths.audit, {
      type: "batch_rolled_back",
      at: new Date().toISOString(),
      batchId: meta.batchId,
      failedOperationId,
      projectRevisionAfter: engine.getProject().revision,
    });
  } catch (error) {
    status = "rollback_failed";
    rollbackError = errorMessage(error);
    appendAudit(paths.audit, {
      type: "rollback_failed",
      at: new Date().toISOString(),
      batchId: meta.batchId,
      failedOperationId,
      error: rollbackError,
      projectRevisionAfter: engine.getProject().revision,
    });
  }

  const result: EditBatchResult = {
    schemaVersion: 1,
    batchId: meta.batchId,
    planId,
    projectId,
    status,
    projectRevisionBefore: meta.basedOnRevision,
    projectRevisionAfter: engine.getProject().revision,
    startedAt,
    endedAt: new Date().toISOString(),
    operations,
    changedClipIds: [...changedClipIds],
    affectedFrameRanges: affectedFrameRanges.map((range) => ({ ...range })),
    auditRef: paths.auditRef,
    checkpointRef: paths.checkpointRef,
    resultRef: paths.resultRef,
    rollbackRef: paths.checkpointRef,
    failure: { operationId: failedOperationId, error: failureMessage },
    ...(rollbackError ? { rollbackError } : {}),
    atomicity: "checkpoint-backed-recoverability-not-acid",
  };
  writeDurable(paths.result, JSON.stringify(result, null, 2));
  engine.recordTangBatchReferences({
    batchAuditRef: paths.auditRef,
    checkpointRef: paths.checkpointRef,
  });
  return result;
}

function readCheckpoint(paths: BatchPaths): EngineBatchCheckpoint {
  const meta = JSON.parse(readFileSync(paths.checkpointMeta, "utf8")) as CheckpointMeta;
  if (meta.schemaVersion !== 1 || meta.batchId !== basenameBatchId(paths.dir)) {
    throw new Error("Batch checkpoint metadata is invalid or mismatched");
  }
  const project = JSON.parse(readFileSync(paths.checkpoint, "utf8")) as EngineBatchCheckpoint["project"];
  if (!project?.id || project.id !== meta.projectId || project.revision !== meta.basedOnRevision) {
    throw new Error("Batch checkpoint project binding is invalid or mismatched");
  }
  return { project, ...meta.engineContext };
}

function batchPaths(engine: EditorEngine, batchId: string): BatchPaths {
  if (!EDIT_BATCH_ID_PATTERN.test(batchId)) {
    throw new Error(`Invalid edit batch id "${batchId}".`);
  }
  const dir = join(engine.dataDir, "tang-batches", batchId);
  return {
    dir,
    checkpoint: join(dir, "checkpoint.aive"),
    checkpointMeta: join(dir, "checkpoint.meta.json"),
    audit: join(dir, "audit.jsonl"),
    result: join(dir, "result.json"),
    auditRef: `tang-batch:${batchId}/audit.jsonl`,
    checkpointRef: `tang-batch:${batchId}/checkpoint.aive`,
    resultRef: `tang-batch:${batchId}/result.json`,
  };
}

function basenameBatchId(dir: string): string {
  return dir.replace(/[\\/]+$/, "").split(/[\\/]/).at(-1) ?? "";
}

function writeDurable(path: string, content: string): void {
  const fd = openSync(path, "w");
  try {
    writeFileSync(fd, content, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function appendAudit(path: string, event: Record<string, unknown>): void {
  const fd = openSync(path, "a");
  try {
    appendFileSync(fd, `${JSON.stringify(event)}\n`, "utf8");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && (typeof value === "object" || typeof value === "function") && typeof (value as PromiseLike<unknown>).then === "function";
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}