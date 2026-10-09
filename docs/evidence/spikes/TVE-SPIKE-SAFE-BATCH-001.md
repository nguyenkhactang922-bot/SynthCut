# TVE-SPIKE-SAFE-BATCH-001 — Coherent AI Batch Recovery Evidence

Status: PASS FOR SPIKE HYPOTHESIS
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Nature: DESIGN-only disposable POC under `.spike-temp/safe-batch-001/`; no production source mutation.

## Hypothesis
A generic AI batch envelope can safely sit above existing SynthCut operations by combining:
1. `projectId/revision` precondition;
2. durable pre-batch `.aive` checkpoint;
3. ordered operation audit records;
4. explicit restore of the checkpoint on mid-batch failure;
5. explicit recovery/checkpoint path after a successful batch.

This does not require a shadow timeline and does not silently depend on chat history.

## Fixture
Reused the already-persisted representative long-form project from LF-001:
- 30-minute timeline;
- 310 clips in the loaded fixture;
- authoritative core revision at test start: 340.

## Test A — stale revision fail-closed
Batch expected revision 339 while current revision was 340.

Result:
- status: `rejected_stale`;
- zero operations executed;
- authoritative project state unchanged.

Verdict: PASS.

## Test B — forced mid-batch failure + rollback
Preconditions:
- expected/current revision: 340;
- durable `.aive` checkpoint written before applying mutations.

Operations executed before injected failure:
1. `set_effect_clip_1` — completed, revision 341;
2. `move_clip_2` — completed, revision 342;
3. forced failure injected before operation 3.

Recovery:
- checkpoint reloaded;
- normalized authoritative project state matched the pre-batch baseline;
- rollback status: `rolled_back`;
- restore-equivalent: true;
- measured rollback time: **8.1821 ms** on this fixture.

Verdict: PASS.

## Test C — successful batch + auditable operations + explicit recovery
Successful two-operation batch:
1. set clip effect;
2. move clip.

Result:
- batch status: `done`;
- two operation audit records, both `done` with revision-after values;
- authoritative state changed as expected;
- pre-batch checkpoint remained available;
- explicit later reload of that checkpoint restored a state equivalent to the pre-batch state.

Verdict: PASS.

## Production-source integrity
`git diff -- packages/core apps src` after the POC returned empty. The POC did not mutate production source.

## Architecture consequence
The freeze candidate does **not** require a second authoritative timeline or a large transactional rewrite. A production `apply_edit_plan`/batch envelope may be implemented later as orchestration around the core with these invariants:
- compare expected project identity/revision before any mutation;
- create a durable pre-batch checkpoint for coherent/risky batches;
- record ordered requested/applied operations and affected ranges/IDs;
- on failure, expose the failure and restore/offer restore from the known checkpoint according to frozen policy;
- on success, retain audit/checkpoint metadata according to retention policy;
- never claim atomicity stronger than actually provided; this design is checkpoint-backed recoverability, not database ACID.

Production implementation still requires Freeze + Phase 5 task authorization and normal integration/error-path tests.

## Result marker
`SAFE_BATCH_POC_RESULT = PASS`

Measured fields:
- `staleNoMutation=true`;
- `rollbackStatus=rolled_back`;
- `rollbackRestoreEquivalent=true`;
- `rollbackRestoredBaseline=true`;
- `successStatus=done`;
- `successAuditOps=2`;
- `explicitRecoveryEquivalent=true`;
- `productionSourceMutatedByPoc=false`.

## Verdict
**PASS FOR SPIKE HYPOTHESIS.** The fixed safe-mutation gate now has a demonstrated checkpoint/audit/recovery path. This closes R9 of `FREEZE_READINESS_AUDIT_001` at DESIGN POC level.
