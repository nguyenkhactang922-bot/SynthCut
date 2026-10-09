# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-003 — Third-party provenance + corresponding-source compliance`
- STATUS: `PASS / VERIFIED — COMMIT PENDING`
- CURRENT_STAGE: `REVIEW / COMMIT`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: `81ce1fb30ddb76a7d74b2317787566135a32ef75`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-003 PASS / VERIFIED` — exact FFmpeg pin + source offer + distribution-document/package-lock provenance; positive staging PASS; wrong-FFmpeg fail-closed PASS; 36 staged files independently re-hashed PASS; root typecheck + diff check PASS. Evidence: `docs/evidence/release/TVE-REL-003.md`.
- PROCESS_PID: `NONE`
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `pty_bb3161cd59e557848ec933770ea742a670c5 — EXITED 0`
- LATEST_LOG: `PTY pty_bb3161cd59e557848ec933770ea742a670c5`; marker `REL003_MANIFEST_VERIFY_PASS files=36 bytes=328141128 ... trackedDirty=True`
- LAST_EXIT_CODE: `0 — independent REL-003 manifest/hash verification PASS`
- ARTIFACTS:
  - `docs/evidence/e2e/TVE-MAIN-VERIFICATION.md`
  - `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
  - `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
  - `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
  - `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
  - `docs/evidence/release/TVE-REL-002.md`
  - `docs/evidence/release/TVE-REL-003.md`
  - `release/compliance/ffmpeg-windows.json`
  - `release/compliance/SOURCE_OFFER.md`
  - `apps/desktop/build/resources/aive/bundle-manifest.json` (generated runtime evidence)
- BLOCKERS:
  - `NONE` for REL-003..006 dependency-ready technical work.
  - Public/stable `COMMERCIAL_READY` release remains blocked at REL-007 until an explicit valid Remotion commercial/redistribution basis is recorded and a trusted Windows signing path is configured/verified.
- NEXT_EXACT_ACTION: Review/stage only REL-003 tracked changes and create the task-scoped commit. Verify HEAD/status, then CLAIM `TVE-REL-004 — Release-tool dependency security hardening`. Do not package or publish.
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
