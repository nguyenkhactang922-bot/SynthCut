# TASK_QUEUE — Tang AI Video Editor / SynthCut

Canonical lifecycle: `docs/process/PROJECT_LIFECYCLE_V1.md`
Frozen baseline: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`
Phase 5 plan: `docs/plan/DEPENDENCY_GRAPH_V1.md`, `TASK_DECOMPOSITION_V1.md`, `TRACEABILITY_PLAN_V1.md`

## PHASE 1 — DISCOVER — PASS
- TVE-DISC-001 Raw Idea — DONE — `docs/discovery/PRODUCT_DISCOVERY_V1.md`
- TVE-DISC-002 Problem Discovery — DONE — same artifact
- TVE-DISC-003 Discovery Research — DONE — same artifact
- TVE-DISC-004 I/O Hypotheses — DONE — same artifact

## PHASE 2 — DEFINE — FROZEN
- TVE-DEF-001 Brief — DONE/FROZEN — `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`
- TVE-DEF-002 Scope — DONE/FROZEN — `docs/define/PRODUCT_DEFINITION_V1.md`
- TVE-DEF-003 Constraints — DONE/FROZEN — same artifact
- TVE-DEF-004 Acceptance Criteria — DONE/FROZEN — AC-18 amendment explicitly reconciled 2026-10-07

## PHASE 3 — RESEARCH — PASS
- TVE-RES-001 Solution Research + SynthCut audit — DONE
- TVE-RES-002 Repo/Tool/Framework Search — DONE
- TVE-RES-003 License/Security Audit — DONE FOR CURRENT PERSONAL/NONCOMMERCIAL SCOPE
- TVE-RES-004 Candidate Comparison/Reconciliation — DONE
Evidence: `docs/research/` canonical research set.

## PHASE 4 — DESIGN — FROZEN
- TVE-ADR-001 ADR/technology boundaries — FROZEN — `docs/adr/ADR-001_BASE_ARCHITECTURE.md`
- TVE-DES-002 Living system design — FROZEN — `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md`
- TVE-AUD-001 Initial independent audit — DONE
- TVE-LC-AUD-001 Lifecycle delta audit — DONE
- TVE-AUD-002 Lifecycle re-entry audit — DONE
- TVE-SPIKE-DEPSEC-001 — DONE/PASS
- TVE-SPIKE-MCP-CONTEXT — DONE/PASS
- TVE-SPIKE-UI-300 — DONE/PASS
- TVE-SPIKE-LF-001 — DONE/PASS
- TVE-SPIKE-SAFE-BATCH-001 — DONE/PASS
- TVE-SPIKE-VI-STT — DONE/PASS UNDER REVISED AUTOMATED AC-18 — `docs/evidence/spikes/TVE-SPIKE-VI-STT.md`
- TVE-AUD-003 Freeze readiness historical hold — DONE/HISTORICAL
- AC18_AUTOMATED_GATE_CHANGE_004 — DONE/PASS
- FREEZE_READINESS_004 — DONE/PASS TO FREEZE
- TVE-FRZ-001 — DONE/PASS/FROZEN — `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`

Do not rerun PASS DESIGN spikes unless scope/requirements/code/environment/contradictory evidence makes them stale.

## PHASE 5 — PLAN IMPLEMENTATION — PASS

### TVE-PLAN-001 — Dependency Graph
Status: DONE/PASS
Artifact: `docs/plan/DEPENDENCY_GRAPH_V1.md`

### TVE-PLAN-002 — Task Decomposition
Status: DONE/PASS
Artifact: `docs/plan/TASK_DECOMPOSITION_V1.md`

### TVE-PLAN-003 — Requirement/Test/Evidence Traceability
Status: DONE/PASS
Artifact: `docs/plan/TRACEABILITY_PLAN_V1.md`

### TVE-PLAN-004 — Production Task Queue
Status: DONE/PASS after this queue readback/verification
Artifact: `tasks/TASK_QUEUE.md`

Phase 5 exit rule: production implementation may begin only after post-update verification confirms the three plan artifacts + this queue are mutually consistent. When that verification PASSes, set `IMPLEMENTATION_ALLOWED=true` and CLAIM only the first dependency-ready task.

---

# PHASE 6 — BUILD & VERIFY — PRODUCTION QUEUE

Canonical per-task lifecycle:
`CLAIM → ANALYZE → PLAN → CODE → TEST → EVIDENCE → VERIFY → COMMIT → PR (if available) → REVIEW → MERGE → MAIN VERIFIED → NEXT TASK`

Git note: repo-local identity is configured as `nguyenkhactang922-bot <nguyenkhactang813@gmail.com>`. Keep task-scoped commits and never mix unrelated WIP.

## TVE-IMP-001 — Tang metadata sidecar foundation
Status: DONE / COMMITTED — `622769d`
Dependencies: TVE-FRZ-001 + TVE-PLAN-001..004 PASS
Scope/test/evidence: `docs/plan/TASK_DECOMPOSITION_V1.md#tve-imp-001--tang-metadata-sidecar-foundation`
Primary candidate files: new `packages/core/src/tang/metadata.ts`, narrow `packages/core/src/engine.ts`, optional shared types.
Completion requires: task acceptance + tests + evidence + review + commit when Git identity is available.

## TVE-IMP-002 — Bounded project/chapter/range/transcript read model
Status: DONE / COMMITTED — `c0e62eb`
Dependencies: IMP-001 committed at `622769d`
Primary candidate files: new `packages/core/src/tang/read-model.ts`, `packages/core/src/rpc.ts`, narrow engine accessors.

## TVE-IMP-003 — MCP bounded tool exposure and operator contract
Status: DONE / COMMITTED — `68adf99`
Dependencies: IMP-002 committed at `c0e62eb`
Primary candidate files: `packages/mcp/src/index.ts`, `packages/mcp/src/guide.ts`.

## TVE-IMP-004 — EditPlan, revision guard and dry-run
Status: DONE / COMMITTED — `3ab9518`
Dependencies: IMP-003 committed at `68adf99`; IMP-001 semantic dependency satisfied
Primary candidate files: new `packages/core/src/tang/edit-plan.ts`, `packages/core/src/rpc.ts`, narrow `engine.ts` hooks.
Core-lane ordering: execute after IMP-003 has completed its core-read dependency path to reduce shared-file conflict, even though semantic dependency is IMP-001.

## TVE-IMP-005 — Checkpoint-backed coherent batch/audit/rollback
Status: DONE / COMMITTED — `840bacd`
Dependencies: IMP-004 committed at `3ab9518`
Primary candidate files: new `packages/core/src/tang/batch.ts`, `engine.ts`, `rpc.ts`.

## TVE-IMP-006 — Bounded long-form preview/export execution
Status: DONE / COMMITTED — `52039c5`
Evidence: `docs/evidence/implementation/TVE-IMP-006.md`
Dependencies: IMP-005 committed at `840bacd` (shared-core serialization)
Primary candidate files: `packages/core/src/engine.ts`, `packages/core/src/ffmpeg/`, `packages/core/src/jobs.ts` only where needed.

## TVE-IMP-007 — 300-clip viewport culling/virtualization
Status: DONE / COMMITTED — `7741f69`
Evidence: `docs/evidence/implementation/TVE-IMP-007.md`
Dependencies: FROZEN DESIGN
Primary candidate files: `apps/desktop/src/timeline.tsx`, optional styles/helpers.
Convergence: must be verified before E2E.

## TVE-IMP-008 — Vietnamese STT + fail-closed transcript-cut policy
Status: DONE / COMMITTED — `dcb3579`
Evidence: `docs/evidence/implementation/TVE-IMP-008.md`
Dependencies: IMP-006 verified/committed
Primary candidate files: `packages/core/src/whisper/transcribe.ts`, transcript edit RPC/helpers, policy helper.
Frozen policy: multilingual `large-v3-turbo`, explicit `vi`, >=120 ms guard each side, insufficient gap = NOOP/review-needed.

## TVE-IMP-009 — Dependency hardening promotion
Status: DONE / COMMITTED — `f46feda`
Evidence: `docs/evidence/implementation/TVE-IMP-009.md`
Dependencies: FROZEN DESIGN
Primary files: `package-lock.json` only; no manifest/source change.
Convergence: production audit 0; remaining dev/packaging findings explicitly carried to release hardening.

## TVE-IMP-010 — Tang long-form editorial orchestration contract
Status: DONE / COMMITTED — `10711c1`
Evidence: `docs/evidence/implementation/TVE-IMP-010.md`
Dependencies: bounded reads/MCP + safe batch + Vietnamese policy
Primary candidate files: `packages/mcp/src/guide.ts`, `packages/mcp/src/index.ts`, optional pure `packages/mcp/src/tang/` helpers.

## TVE-IMP-011 — QA and durable evidence coordinator
Status: DONE / COMMITTED — `1cf0b80`
Evidence: `docs/evidence/implementation/TVE-IMP-011.md`
Dependencies: IMP-005 + IMP-006 + IMP-008 + IMP-010 — all satisfied
Primary scope: structural → rendered frame → preview/audio → delivery verification and evidence refs.

## TVE-E2E-001 — Integrated frozen-requirement proof
Status: DONE / COMMITTED — `c921f9e`
Evidence: `docs/evidence/e2e/TVE-E2E-001.md`
Required integrated proof: 30-minute/~300 clips, UI+MCP same project, bounded reads, stale-plan rejection, safe batch rollback, Vietnamese policy, viewport UI, jobs/cancel, final 1080p MP4, no required CapCut runtime, restart/persistence/error paths.
Artifact target: `docs/evidence/e2e/TVE-E2E-001.md`.

## MAIN VERIFIED
Status: DONE / PASS — `personal/main@af92f20` verified after PR #1 review+merge.
Evidence: `docs/evidence/e2e/TVE-MAIN-VERIFICATION.md`.
Merged-main root typecheck PASS; integrated E2E PASS / exit 0; merge tree equals reviewed feature tip. Upstream `origin/main` was not modified.

---

# COMMERCIAL RELEASE RE-ENTRY — B + C — 2026-10-09

## TVE-REL-001 — Commercial scope / license-security re-entry / ADR / Phase-7 plan
Status: DONE / PASS
Dependencies: MAIN VERIFIED + explicit user authorization `B + C`
Artifacts:
- `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
Result: GPL commercial distribution path accepted with fail-closed Remotion, FFmpeg provenance, release-tool security, fork identity/updater and trusted-signing gates.

# PHASE 7 — RELEASE & OPERATE — ACTIVE
Canonical plan: `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
Baseline retained: `personal/main@af92f20` MAIN VERIFIED.
Branch: `chatgpt/phase7-commercial-release`.

## TVE-REL-002 — Fork identity + updater ownership
Status: DONE / PASS
Dependencies: REL-001 PASS
Evidence: `docs/evidence/release/TVE-REL-002.md`
Result: fork display/app identity, installer identity and updater publish provider now use `Tang AI Video Editor` + `nguyenkhactang922-bot/SynthCut`; upstream visible logo/name removed from renderer bundle; typecheck/build/static scans PASS.

## TVE-REL-003 — Third-party provenance + corresponding-source compliance
Status: DONE / PASS / COMMITTED — `e051b8d`
Evidence: `docs/evidence/release/TVE-REL-003.md`
Result: exact Windows FFmpeg pin + fail-closed version/hash gate; source offer/notices/package-lock/distribution-doc hashes recorded; 36 staged files independently re-hashed PASS; root typecheck + diff check PASS.

## TVE-REL-004 — Release-tool dependency security hardening
Status: DONE / PASS / COMMITTED — `20c8ff9`
Dependencies: REL-003 committed at `e051b8d`
Evidence: `docs/evidence/release/TVE-REL-004.md`
Result: electron-builder upgraded non-force from 25.1.8 to 26.15.3; full audit reduced 11 high + 1 critical to 8 documented build-only moderate findings; production audit 0; build/typecheck/unpacked package smoke PASS.

## TVE-REL-005 — Release workflow + version metadata hardening
Status: DONE / PASS / COMMITTED — `227535b`
Dependencies: REL-004 committed at `20c8ff9`
Evidence: `docs/evidence/release/TVE-REL-005.md`
Result: version set aligned at `1.0.6`; manual workflow is read-only/non-publishing; tag publication is fork-only + commercial-gated; upstream npm namespace publication disabled; artifact/version/tag negative gates PASS.

## TVE-REL-006 — Local packaged acceptance
Status: DONE / PASS
Dependencies: REL-005 committed at `227535b`
Evidence: `docs/evidence/release/TVE-REL-006.md`
Accepted candidate source manifest: `225a987dfb5490949ba107eac4c9e0dd0c74499b`, tracked dirty=false.
Result: NSIS+ZIP integrity PASS; hashes/provenance/update metadata PASS; packaged MCP/core/bundled-resource smoke PASS; project save/open PASS; representative H.264+AAC export PASS; installer exit 0; installed desktop launch PASS. No publication occurred. `asar=false` was assessed and remains deferred hardening because an ASAR package needs additional MCP launcher/path work.

## TVE-REL-007 — Commercial authorization / license strategy
Status: DONE / PASS — owner-approved unsigned commercial lane
Dependencies: REL-006 PASS
Evidence: `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md` + `docs/evidence/release/TVE-REL-007-REMOTION.md` + `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md` + retained `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`
Result:
- `REMOTION_LICENSE_GATE=PASS` / `FREE_LICENSE_ELIGIBLE`.
- `SUPABASE_LICENSE_BACKEND=PASS`; founder/admin key prefix `TAIVE-F3E3Y`, maxDevices=3, no expiry, activeDevices=0 after exact test cleanup; plaintext key is not stored in Git.
- bounded DEFINE/ADR/PLAN amendment now explicitly permits the current unsigned commercial lane with owner-accepted Unknown-publisher/SmartScreen risk.
- packaged desktop activation/restart persistence through real renderer/preload/main IPC PASS; same device remained activeDevices=1; persisted key encrypted via Electron `safeStorage`.
- full 1.1.0 NSIS/ZIP dist PASS / exit 0; installer SHA-256 `867fb75aceecab263ad0a5b3914f55ce71772dfa6aa923749b689dc1ecad6451`; ZIP SHA-256 `2ff621e45d4c7d78211282beec983fecc66ea6f2f635f074aa8ece53d2d004f2`.
- installer and packaged app both intentionally `NotSigned`; trusted signing remains optional future hardening.
- no tag/push/PR/merge/GitHub Release/updater side effect occurred in REL-007.

## TVE-REL-008 — GitHub Release publication
Status: ELIGIBLE / PRE-PUBLICATION GUARD
Dependencies: REL-007 PASS
Target: `nguyenkhactang922-bot/SynthCut` only.
Next gate: reviewed committed source; verify branch/remote auth, existing PR state, local+remote `v1.1.0` tag absence, and GitHub Release collision absence before any push/tag/release side effect.

## TVE-REL-009 — Installed updater E2E + stable verification
Status: BLOCKED BY REL-008

## TVE-REL-010 — Monitor / incident handoff
Status: BLOCKED BY REL-009

# PHASE 8 — LEARN — FUTURE
Final Traceability Audit → Feedback → New Requirement/Bug/Improvement → correct lifecycle loopback.

# NEXT ELIGIBLE TASK
`TVE-REL-008`: review/commit the REL-007 changes, then run the fork-only Git/tag/release side-effect guard. If no collision exists and GitHub write authority is valid, continue the repository Git workflow and create the `v1.1.0` release on `nguyenkhactang922-bot/SynthCut` only. Do not rerun REL-007 runtime/package proofs.