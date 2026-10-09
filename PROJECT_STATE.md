# PROJECT_STATE

Project: Tang AI Video Editor on SynthCut base
Root: `E:\SynthCut`
Branch: `chatgpt/ai-video-editor-design`
HEAD: `c921f9e`

## Canonical lifecycle
`docs/process/PROJECT_LIFECYCLE_V1.md`
Global contract: `docs/CHATCODE_GLOBAL_MULTI_PROJECT_EXECUTION_LAW.md` §19 + §20.

## Current lifecycle phase
`BUILD & VERIFY — TVE-IMP-001..011 + TVE-E2E-001 COMMITTED; MAIN verification gate pending`

## Phase gates
- DISCOVER: PASS
- DEFINE: FROZEN FOR V1
- RESEARCH: PASS
- DESIGN: FROZEN — `TVE-FRZ-001 PASS`
- PLAN IMPLEMENTATION: PASS — `TVE-PLAN-001..004 PASS`
- BUILD & VERIFY: ACTIVE — `TVE-E2E-001 PASS/COMMITTED c921f9e`; push/PR/review/merge/main verification remains
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
- `TVE-IMP-005 — Checkpoint-backed coherent batch/audit/rollback` — COMMITTED `840bacd`
- `TVE-IMP-006 — Bounded long-form preview/export execution` — COMMITTED `52039c5`
- `TVE-IMP-007 — 300-clip timeline viewport culling/virtualization` — COMMITTED `7741f69`
- `TVE-IMP-008 — Vietnamese STT policy and fail-closed cut resolver` — COMMITTED `dcb3579`
- `TVE-IMP-009 — Dependency hardening promotion` — COMMITTED `f46feda`
- `TVE-IMP-010 — Tang long-form editorial orchestration contract` — COMMITTED `10711c1`
- `TVE-IMP-011 — QA and durable evidence coordinator` — COMMITTED `1cf0b80`

## Active production task
`MAIN verification gate — TVE-E2E-001 is PASS/COMMITTED c921f9e; feature branch is not yet MAIN VERIFIED`

Acceptance summary:
- one authoritative 30-minute/~300-clip project proves integrated core/MCP/UI contracts;
- bounded reads, stale-plan rejection, coherent rollback/recovery, Vietnamese fail-closed policy and viewport convergence are exercised together where cross-feature interaction matters;
- jobs/cancel, final 1080p MP4, durable final-delivery QA, restart/persistence and error paths are proven;
- CapCut is not required at runtime;
- feature-branch E2E PASS does not by itself authorize MAIN VERIFIED.

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

## Latest TVE-IMP-005 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-005.md`.
- Core build: PASS / exit 0.
- Dedicated coherent-batch smoke: PASS / exit 0 with marker `TVE-IMP-005 COHERENT BATCH SMOKE PASSED`.
- Verified stale-plan zero mutation/no batch artifact; forced mid-batch runtime failure rollback; durable checkpoint/audit/result; successful batch; save/restart; explicit recovery after restart; recovered save/reopen.
- Root typecheck: PASS / exit 0.
- EditPlan sync allowlist audit: PASS — 51 allowlisted methods, 0 async, 0 missing handlers.
- Cached diff review/check: PASS; task commit scope 5 files, +951/-1.
- Commit: PASS — `840bacd`.

## Latest TVE-IMP-006 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-006.md`.
- Independent VERIFY found and repaired the continuous-transition command-growth edge case before task closure.
- Repaired-source core build: PASS / exit 0.
- Root typecheck: PASS / exit 0.
- Cache regression smoke: PASS / exit 0.
- Export regression smoke: PASS / exit 0 for H.264/H.265 and WebM/VP9 fallback.
- Dedicated 310-clip/1800s production smoke: PASS with marker `TVE_IMP_006_RESULT`.
- Transition command bound: 2 inputs / 1112 chars; preview max 3 / 1601; final max 3 / 1615.
- Cache reuse: 299/300 = 99.6667%; remote frame 0 renders + 1 hit.
- 20-cycle RSS ratio: 1.04818x; cancel clean; final exact 1800s 1920x1080 30fps H.264+AAC.
- `git diff --check`: PASS.
- Commit: PASS — `52039c5`.

## Latest TVE-IMP-007 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-007.md`.
- Desktop typecheck: PASS / exit 0 after final production repair.
- Renderer production build: PASS / exit 0 after final production repair.
- Final clean 300-clip Electron acceptance: PASS / exit 0.
- First paint 185 ms; authoritative clips 300; rendered clip/element DOM 6 initial / 10 max.
- Interaction p95 6.2 ms; drag reflection 6.2 ms; 0 long tasks; visible/offscreen selection 1/1; renderer crash=false.
- Focused diff/check/review: PASS.
- Commit: PASS — `7741f69`.

## Latest TVE-IMP-008 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-008.md`.
- Core build: PASS / exit 0.
- Dedicated VI-policy + frozen 20-sample resolver smoke: PASS / exit 0; 13 SAFE_CUT + 7 SAFE_NOOP.
- Unsafe Vietnamese delete: zero mutation + reviewNeeded; safe delete: real ripple cut.
- Production preview/audio QA: PASS; 8.900 s pre-cut H.264+AAC → 8.700 s post-cut H.264+AAC.
- Root typecheck: PASS / exit 0.
- Focused diff/check/review: PASS.
- Commit: PASS — `dcb3579`.

## Latest TVE-IMP-009 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-009.md`.
- Materialized production dependency tree verification: PASS / `npm ls --omit=dev --json` exit 0.
- Production audit: PASS / 0 findings.
- Full audit remaining risk: 12 findings = 11 high + 1 critical, isolated to the tracked electron-builder dev/packaging chain; semver-major remediation deferred by frozen scope.
- Root build: PASS / exit 0.
- Root typecheck: PASS / exit 0.
- Composite smoke: PASS / exit 0.
- CLIP tokenizer smoke: PASS / exit 0.
- Core security smoke: PASS / exit 0 using project-local FFmpeg/FFprobe.
- Commit: PASS — `f46feda`.

## Latest TVE-IMP-010 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-010.md`.
- Repaired MCP build: PASS / exit 0.
- Real stdio 30-minute / 300-clip orchestration smoke: PASS / exit 0 with marker `TVE-IMP-010 LONG-FORM ORCHESTRATION SMOKE PASSED`.
- Six chapter packets; overview 1,711 bytes; chapter read 23,634 bytes; real revision 12; real clip `clip-001`; non-mutating dry-run 1 operation.
- Root typecheck: PASS / exit 0.
- Focused staged diff/check/review: PASS; task scope 5 files / +464.
- Commit: PASS — `10711c1`.

## Latest TVE-IMP-011 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-011.md`.
- Core build: PASS / exit 0.
- MCP build: PASS / exit 0.
- Dedicated QA coordinator smoke: PASS / exit 0 with marker `TVE-IMP-011 QA COORDINATOR SMOKE PASSED`.
- STALE and failed-delivery records are durable but rejected from accepted evidenceRefs; matching delivery PASS records structural + exact frame + preview/audio + ffprobe delivery facts.
- Save/restart preserves only accepted evidenceRefs while `.aive` remains authoritative edit truth.
- Root typecheck: PASS / exit 0.
- Focused cached diff/check/review: PASS; task scope 7 files / +710/-5.
- Commit: PASS — `1cf0b80`.

## Latest TVE-E2E-001 verification
- Evidence: `docs/evidence/e2e/TVE-E2E-001.md`.
- Integrated runtime: PASS / exit 0 with marker `TVE-E2E-001 INTEGRATED PROOF PASSED`.
- Same authoritative project: `proj_jnjvadlpe3`, 310 clips, 1800 s.
- MCP bounded reads: overview 1708 B; chapter 24383 B; six packets.
- UI/MCP/core convergence: same initial revision; coherent rollback observed as exactly one restored-state UI broadcast.
- Stale plan: rejected with zero mutation/no UI state advance.
- Coherent batch: forced runtime failure rolled back and restored 310 clips; durable audit/checkpoint refs survive save/restart.
- Vietnamese policy: `vi` + `large-v3-turbo`; unsafe cut produced zero cuts + reviewNeeded.
- Same-project durable IMP-006 evidence supplies final exact 1800 s 1080p H.264+AAC and clean cancel; IMP-007/011 evidence reused without blind rerun.
- CapCut process count: 0; no required package dependency.
- Root typecheck: PASS / exit 0.
- Commit: `c921f9e`.

## NEXT_EXACT_ACTION
Inspect remote/upstream/auth/existing PR state. If available, push feature branch, create/reuse PR to main, review and merge only after PASS, then verify merged main with the risk-based main gate. Do not mark MAIN VERIFIED before actual merge + main verification.
