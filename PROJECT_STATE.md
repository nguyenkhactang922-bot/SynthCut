# PROJECT_STATE

Project: Tang AI Video Editor on SynthCut base
Root: `E:\SynthCut`
Branch: `chatgpt/ai-video-editor-design`
HEAD: `3ab9518`

## Canonical lifecycle
`docs/process/PROJECT_LIFECYCLE_V1.md`
Global contract: `docs/CHATCODE_GLOBAL_MULTI_PROJECT_EXECUTION_LAW.md` §19 + §20.

## Current lifecycle phase
`BUILD & VERIFY — TVE-IMP-001..004 COMMITTED; TVE-IMP-005 ACTIVE / CLAIMED`

## Phase gates
- DISCOVER: PASS
- DEFINE: FROZEN FOR V1
- RESEARCH: PASS
- DESIGN: FROZEN — `TVE-FRZ-001 PASS`
- PLAN IMPLEMENTATION: PASS — `TVE-PLAN-001..004 PASS`
- BUILD & VERIFY: ACTIVE — first production task claimed
- RELEASE & OPERATE: LOCKED until MAIN VERIFIED
- LEARN: FUTURE

## Governance normalization
The canonical lifecycle now contains 39 named substages. Post-update runtime verification confirmed all ten contract fields are present 39/39:
- Input
- Entry Gate
- Work
- Output
- Exit Gate
- Artifact
- Evidence
- Owner/Authority
- Risks/Open Questions
- Loopback

No prior valid evidence was rerun merely for this normalization.

## Frozen architecture baseline
Freeze record: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`.

Key frozen decisions:
- SynthCut remains base and `.aive` remains the only authoritative edit/render truth.
- Tang derived metadata uses adjacent `<project>.tang.json`, revision-aware and rebuildable.
- PROJECT→CHAPTER→SCENE/BEAT hierarchy is a derived read/orchestration model only.
- long-form default reads are bounded; ordinary target <=64 KiB.
- coherent AI batches use revision guard + durable pre-batch `.aive` checkpoint + ordered audit + rollback/recovery.
- 300-clip UI uses viewport culling/virtualization rather than core rewrite.
- long-form FFmpeg execution is segment/window bounded by intersecting dependencies; bounded segment audio uses PCM concat with one final AAC encode/mux.
- CapCut is not required at runtime.
- dependency hardening uses the proven non-force remediation path.
- Vietnamese edit-grade default is multilingual `large-v3-turbo`, explicit `language=vi`, under fail-closed >=120 ms per-side cut guard; insufficient gap = NOOP/review-needed.

## Verified DESIGN evidence
- `TVE-SPIKE-DEPSEC-001`: PASS
- `TVE-SPIKE-MCP-CONTEXT`: PASS
- `TVE-SPIKE-UI-300`: PASS
- `TVE-SPIKE-LF-001`: PASS
- `TVE-SPIKE-SAFE-BATCH-001`: PASS
- `TVE-SPIKE-VI-STT`: PASS UNDER REVISED AUTOMATED AC-18

VI-STT automated result:
- speech: 639.96 s
- WER: 0.0941734417 <= 0.20
- deterministic rare/key recall: 0.79 >= 0.75
- timing p95: 1.12 s <= 1.5 s
- timing violations: 0
- 20/20 cut samples safe-resolved: 13 SAFE_CUT + 7 SAFE_NOOP
- model inference rerun for amendment: false
Evidence: `docs/evidence/spikes/TVE-SPIKE-VI-STT.md`, `.spike-temp/vi-stt/automated-validation.json`.

Historical human-review pack remains optional spot-check QA and is not claimed as human-reviewed.

## PLAN IMPLEMENTATION
- TVE-PLAN-001 Dependency Graph: PASS — `docs/plan/DEPENDENCY_GRAPH_V1.md`
- TVE-PLAN-002 Task Decomposition: PASS — `docs/plan/TASK_DECOMPOSITION_V1.md`
- TVE-PLAN-003 Traceability: PASS — `docs/plan/TRACEABILITY_PLAN_V1.md`
- TVE-PLAN-004 Production Task Queue: PASS — `tasks/TASK_QUEUE.md`

## Completed production tasks
- `TVE-IMP-001 — Tang metadata sidecar foundation` — COMMITTED `622769d`
- `TVE-IMP-002 — Bounded project/chapter/range/transcript read model` — COMMITTED `c0e62eb`
- `TVE-IMP-003 — MCP bounded tool exposure and operator contract` — COMMITTED `68adf99`
- `TVE-IMP-004 — EditPlan, revision guard and dry-run` — COMMITTED `3ab9518`

## Active production task
`TVE-IMP-005 — Checkpoint-backed coherent batch/audit/rollback`

Acceptance summary:
- consume a verified current EditPlan;
- create a durable pre-batch `.aive` checkpoint before mutation;
- execute ordered validated operations with an append-only audit/result record;
- stop on failure and restore/recover to normalized pre-batch state according to frozen policy;
- stale plan rejection remains fail-closed; no ACID claim.

## Hard gate
`IMPLEMENTATION_ALLOWED=true`

This authorization is task/dependency scoped, not blanket permission to skip queue order.

## Git identity
Repo-local identity is configured and verified: `nguyenkhactang922-bot <nguyenkhactang813@gmail.com>`.

## Latest TVE-IMP-001 verification
- Implementation/Test/Evidence/Verify/Review: PASS.
- Evidence: `docs/evidence/implementation/TVE-IMP-001.md`.
- Final hardened sidecar smoke: PASS / exit 0, including unknown/shadow-key rejection, stale/malformed/missing fail-safe, restart/rebase/repair, and no temp/backup leakage on success path.
- Core build: PASS / exit 0.
- Root typecheck (core + MCP + desktop): PASS / exit 0.
- `git diff --check` on tracked engine diff: PASS / exit 0.
- Commit: PASS — `622769d`.

## Latest TVE-IMP-002 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-002.md`.
- Final core build: PASS / exit 0.
- Dedicated 30m/300-clip bounded-read smoke: PASS / exit 0.
- Root typecheck (core + MCP + desktop): PASS / exit 0.
- `git diff --check`: PASS / exit 0.
- Commit: PASS — `c0e62eb`.

## Latest TVE-IMP-003 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-003.md`.
- Final repaired MCP build: PASS / exit 0.
- Real stdio MCP bounded-tools smoke: PASS / exit 0; 4/4 bounded tools `readOnlyHint=true`; payload parity with core RPC; generic registration intact at 98 tools.
- Root typecheck: PASS / exit 0.
- `git diff --check`: PASS / exit 0.
- Commit: PASS — `68adf99`.

## Latest TVE-IMP-004 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-004.md`.
- Core build: PASS / exit 0.
- Dedicated EditPlan dry-run smoke: PASS / exit 0 with marker `TVE-IMP-004 EDIT PLAN DRY RUN SMOKE PASSED`.
- Root typecheck: PASS / exit 0.
- Diff review/check: PASS; `rpc.ts` logical diff limited to +28 lines after EOL cleanup.
- Commit: PASS — `3ab9518`.

## NEXT_EXACT_ACTION
Analyze frozen SAFE-BATCH/D-008 evidence and existing save/load/recovery/mutation plumbing for `TVE-IMP-005`; implement the smallest checkpoint-backed coherent batch/audit/rollback layer on top of committed EditPlan. Do not start IMP-006 until IMP-005 reaches its verified/committed boundary.