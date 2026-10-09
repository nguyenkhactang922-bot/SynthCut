# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-003 — Third-party provenance + corresponding-source compliance`
- STATUS: `ACTIVE / CLAIMED`
- CURRENT_STAGE: `ANALYZE / PLAN`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-002 PASS` — fork distributed identity/updater ownership now uses `Tang AI Video Editor`, distinct app id, personal fork GitHub feed; upstream visible logo/name removed from renderer bundle; typecheck/build/static identity scans PASS. Evidence: `docs/evidence/release/TVE-REL-002.md`.
- PROCESS_PID: `NONE` for SynthCut
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` for SynthCut release work; do not touch unrelated project PTYs
- LATEST_LOG: `NONE` for REL-003 yet
- LAST_EXIT_CODE: `0 — REL-002 final renderer build/scan PASS`
- ARTIFACTS:
  - `docs/evidence/e2e/TVE-MAIN-VERIFICATION.md`
  - `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
  - `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
  - `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
  - `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
  - `docs/evidence/release/TVE-REL-002.md`
- BLOCKERS:
  - `NONE` for REL-003..006 dependency-ready technical work.
  - Public/stable `COMMERCIAL_READY` release remains blocked at REL-007 until an explicit valid Remotion commercial/redistribution basis is recorded and a trusted Windows signing path is configured/verified.
- NEXT_EXACT_ACTION: Implement REL-003 only: make bundled FFmpeg provenance deterministic/recorded, emit release compliance metadata, and verify the exact staged binary version/hash/source mapping. Preserve third-party notices. Do not package/publish yet.
- DO_NOT_REPEAT:
  - DISCOVER / original DEFINE / original RESEARCH;
  - completed DESIGN spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - TVE-IMP-001..011;
  - TVE-E2E-001 feature/main verification;
  - PR #1 push/review/merge/main verification;
  - TVE-REL-001;
  - TVE-REL-002;
  - unrelated `.spike-temp/`, `.tmp/`, dataset scratch, or other project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gates
- Prior product/runtime baseline remains `MAIN_VERIFIED=true` at `personal/main@af92f20`.
- `RELEASE_IMPLEMENTATION_ALLOWED=true` for dependency-ready REL-003..006 tasks.
- `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until REL-007 PASS.
