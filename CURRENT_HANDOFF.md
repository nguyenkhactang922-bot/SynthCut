# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-006 — Local packaged acceptance`
- STATUS: `REPAIR COMMITTED / AFFECTED REL-006 RERUN PENDING`
- CURRENT_STAGE: `PRE-PACKAGE CLEAN CHECKPOINT — rerun affected REL-006 stages only`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: `fe6e27b`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `REL-006 repair COMMITTED fe6e27b` — prior package/artifact stages remain PASS; bundled asset env helper exports only approved AIVE paths; packaged MCP config merges them; `node --check` on both CJS files PASS; marker `REL006_PACKAGED_MCP_ENV_CONTRACT_PASS`. Affected staging/build/package/runtime rerun pending.
- PROCESS_PID: `NONE`
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `pty_25a88433303bae79a0a4dea96c2420454896 — EXITED 0`
- LATEST_LOG: `.tmp/rel006-packaged-mcp-gap.mjs`; marker `REL006_PACKAGED_MCP_BUNDLED_ENV_GAP_CONFIRMED`; package PTY `pty_b0521cf3b3b9cac9d9dc75bd27767ace077c` exited 0
- LAST_EXIT_CODE: `0 — REL-006 focused repair verification PASS`
- ARTIFACTS:
  - `docs/evidence/e2e/TVE-MAIN-VERIFICATION.md`
  - `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
  - `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
  - `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
  - `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
  - `docs/evidence/release/TVE-REL-002.md`
  - `docs/evidence/release/TVE-REL-003.md`
  - `docs/evidence/release/TVE-REL-004.md`
  - `docs/evidence/release/TVE-REL-005.md`
  - `.github/workflows/release.yml`
  - `scripts/release/validate-release.mjs`
  - `scripts/release/validate-artifacts.mjs`
  - `.tmp/rel004-audit-before.json` / `.tmp/rel004-audit-after.json` (runtime evidence)
  - `apps/desktop/build/rel004-smoke/win-unpacked` (runtime package-smoke evidence)
  - `release/compliance/ffmpeg-windows.json`
  - `release/compliance/SOURCE_OFFER.md`
  - `apps/desktop/build/resources/aive/bundle-manifest.json` (generated runtime evidence)
- BLOCKERS:
  - `NONE` for REL-003..006 dependency-ready technical work.
  - Public/stable `COMMERCIAL_READY` release remains blocked at REL-007 until an explicit valid Remotion commercial/redistribution basis is recorded and a trusted Windows signing path is configured/verified.
- NEXT_EXACT_ACTION: Commit this post-repair state checkpoint, verify tracked source clean, then rerun only affected REL-006 staging/build/package/runtime acceptance from the resulting clean commit. Do not publish.
- DO_NOT_REPEAT:
  - DISCOVER / original DEFINE / original RESEARCH;
  - completed DESIGN spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - TVE-IMP-001..011;
  - TVE-E2E-001 feature/main verification;
  - PR #1 push/review/merge/main verification;
  - TVE-REL-001;
  - TVE-REL-002;
  - TVE-REL-003;
  - TVE-REL-004;
  - TVE-REL-005;
  - unrelated `.spike-temp/`, `.tmp/`, dataset scratch, or other project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gates
- Prior product/runtime baseline remains `MAIN_VERIFIED=true` at `personal/main@af92f20`.
- `RELEASE_IMPLEMENTATION_ALLOWED=true` for dependency-ready REL-003..006 tasks.
- `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until REL-007 PASS.
