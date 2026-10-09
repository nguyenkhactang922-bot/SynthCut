# TVE-IMP-005 — Checkpoint-backed coherent batch / audit / rollback

Status: PASS / VERIFIED FOR TASK SCOPE
Date: 2026-10-08
Baseline HEAD before task commit: `a99a9b11bbc86f6f72ae4da884ab90711176ee08`
Depends on: `TVE-IMP-004` committed at `3ab9518`
Frozen basis: `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md` §8, `docs/evidence/spikes/TVE-SPIKE-SAFE-BATCH-001.md`

## Implemented production behavior

- Added `packages/core/src/tang/batch.ts` as the production coherent-batch orchestration layer.
- `apply_edit_plan` consumes the committed IMP-004 `EditPlan` contract and performs dry-run validation before mutation.
- A unique batch directory is created under the engine `dataDir/tang-batches/<batchId>/`.
- Before the first mutation, the batch writes and fsyncs:
  - `checkpoint.aive` — self-contained pre-batch project snapshot;
  - `checkpoint.meta.json` — project/plan binding plus minimal engine recovery context;
  - append-only `audit.jsonl` batch-start record.
- Ordered operations execute only through the existing RPC registry/handlers; there is no direct serialized project mutation path.
- A coherent engine lock suppresses per-operation `change` events; clients receive one consolidated state change after success/rollback/recovery rather than observable partial batch states.
- On the first operation failure, later operations stop; the durable checkpoint is read back from disk and restored.
- Restore receives a fresh project revision so the failed/applied plan token cannot be silently reused.
- Success and rollback both leave durable audit/checkpoint/result artifacts.
- `restore_edit_batch` can explicitly restore a retained checkpoint by batch ID after restart, provided the current project ID matches.
- Logical audit/checkpoint references are indexed in Tang derived metadata and persist on the next normal project save.
- Result records explicitly declare `checkpoint-backed-recoverability-not-acid`; no stronger atomicity claim is made.

## Engine integration

`packages/core/src/engine.ts` adds narrow batch-only primitives:
- capture self-contained batch checkpoint;
- restore checkpoint while preserving the original project path;
- reset undo/redo on checkpoint recovery;
- restore cached transcript/visual state from the self-contained snapshot;
- assign a fresh revision after recovery;
- coalesce project change events while a coherent batch is active;
- index durable batch/checkpoint/evidence refs into derived Tang metadata.

The authoritative edit/render truth remains the core `Project` / `.aive` state. Batch files are explicit recovery/audit artifacts only.

## RPC integration

`packages/core/src/rpc.ts` exposes:
- `apply_edit_plan`
- `restore_edit_batch`

The implementation reuses the same existing RPC schemas and handlers used by UI/MCP. The EditPlan v1 allowlist remains restricted to synchronous deterministic mutations.

## Runtime verification

### Core build
Command:
`npm.cmd run build --workspace @aive/core`

Result: PASS / exit `0`.

### Dedicated production safe-batch smoke
Command:
`npm.cmd exec tsx packages/core/scripts/smoke-edit-batch.ts`

Result: PASS / exit `0`.
Result marker:
`TVE-IMP-005 COHERENT BATCH SMOKE PASSED`

Verified cases:
1. stale revision rejects before durable batch directory creation and causes zero mutation;
2. a valid first operation followed by a runtime invariant failure (`remove_track` on the last video track) records ordered attempt/done/fail audit entries;
3. forced mid-batch failure returns `rolled_back` and restores normalized pre-batch semantic state from the durable checkpoint;
4. rollback assigns a fresh revision, releases the coherent lock, and emits one consolidated change event;
5. checkpoint, append-only audit, and result artifacts remain durable after rollback;
6. successful two-operation batch returns `done`, changes authoritative project state, emits one consolidated change event, and retains checkpoint/result artifacts;
7. successful result records the non-ACID atomicity statement;
8. Tang live metadata indexes the successful audit/checkpoint refs;
9. normal save + new `EditorEngine` restart preserves successful `.aive` state and sidecar refs;
10. `restore_edit_batch` after restart restores pre-success semantic state with a fresh revision and preserves the original project path;
11. durable audit records `explicit_recovery` after restart;
12. recovered state can be saved/reopened as authoritative `.aive` state while checkpoint remains a separate explicit recovery artifact.

### Root typecheck
Command:
`npm.cmd run typecheck`

Result: PASS / exit `0` across core + MCP + desktop.

### Synchronous allowlist review
A source audit parsed `EDIT_PLAN_MUTATION_METHODS` and matched every allowlisted RPC against the current RPC registry.

Result:
- allowlisted methods: `51`
- async allowlisted handlers: `0`
- missing handlers: `0`

This guards the coherent-batch invariant that execution does not intentionally yield to an async RPC operation after the checkpoint boundary.

### Diff hygiene
`git diff --check -- packages/core/src/engine.ts packages/core/src/rpc.ts`

Result: PASS / exit `0` (Git emitted only local LF/CRLF conversion warnings, no whitespace errors).

Tracked logical diff before staging:
- `packages/core/src/engine.ts`: `+152/-1`
- `packages/core/src/rpc.ts`: `+26/-0`

Untracked task files before staging:
- `packages/core/src/tang/batch.ts`
- `packages/core/scripts/smoke-edit-batch.ts`
- this evidence file.

## Acceptance mapping

- stale plan rejected: PASS;
- durable pre-batch checkpoint before mutation: PASS;
- ordered append-only audit: PASS;
- stop on first failure: PASS;
- forced mid-batch failure restores normalized pre-batch state: PASS;
- successful batch emits complete durable result/audit/checkpoint refs: PASS;
- explicit recovery retained and works after restart: PASS;
- same core/RPC mutation surface reused: PASS;
- no shadow timeline / checkpoint not edit truth: PASS;
- no ACID claim: PASS.

## Known bounded v1 behavior

- Checkpoints/audits are intentionally retained; cleanup/retention policy is not implemented in this task because the frozen requirement requires retention through QA/recovery and does not define automatic expiry.
- Tang audit/checkpoint refs become disk-persistent on the next normal `.aive` save, keeping sidecar revision binding consistent with authoritative disk state.
- Coherent batching accepts only synchronous deterministic EditPlan v1 mutations. Async render/transcribe/file/job/project-lifecycle operations remain outside this batch contract.

## Verdict

`TVE-IMP-005 = PASS / VERIFIED FOR TASK SCOPE`

The production implementation satisfies the frozen checkpoint-backed recoverability contract and the task decomposition exit gate. It is explicitly recoverability rather than database ACID.
