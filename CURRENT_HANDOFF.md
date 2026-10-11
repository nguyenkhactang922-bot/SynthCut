# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL / PACKAGE ARGUMENT STAGE REPAIRED LOCALLY — HOTFIX PR PENDING`
- CURRENT_STAGE: `Release run 38128610356 on v1.1.0 / personal main 14912c71 completed FAILURE only at Package intentionally unsigned Windows NSIS + ZIP for current commercial lane. Earlier identity/install/build/FFmpeg/provenance/commercial-gate stages PASS and are retained. Root cause is npm argument forwarding turning --publish never into electron-builder --win never. Narrow package-command repair is applied locally; no GitHub Release exists.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: `14912c71d3ff2f43a036de1a31909e3c2882f21c` before the uncommitted package-command repair; Git is authoritative
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 package-command static repair PASS` — `git diff --check` PASS; package/workflow semantic check emitted `REL008_PACKAGE_COMMAND_STATIC=PASS`; installed electron-builder 26.15.3 source declares `publish` with allowed `never`. Evidence: `docs/evidence/release/TVE-REL-008-PACKAGE-ARG-REPAIR.md`.
- PROCESS_PID: `NONE` for SynthCut release/package/electron-builder after post-timeout scans
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` active in current FileMCP workspace
- LATEST_LOG: `docs/evidence/release/TVE-REL-008-PACKAGE-ARG-REPAIR.md`
- LAST_EXIT_CODE: `GitHub Release workflow 38128610356 = FAILURE`; static repair checks = `0/PASS`; two optional CLI/parser probes timed out and are not PASS evidence
- ARTIFACTS:
  - PR #4 — MERGED to personal main at `14912c71d3ff2f43a036de1a31909e3c2882f21c`
  - remote annotated tag `v1.1.0` peels to `14912c71`
  - failed Release run `38128610356` on `14912c71`
  - prior failed Release run `38127692348` on `beeb815`
  - `docs/evidence/release/TVE-REL-008-PACKAGE-ARG-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-RELEASE-WORKFLOW-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`
  - GitHub Release `v1.1.0`: ABSENT
- BLOCKERS:
  - `REL-008` cannot PASS until this second hotfix is reviewed/merged and the corrected tag-triggered Release workflow publishes successfully.
  - Existing remote `v1.1.0` tag is a durable side effect. Do not blindly recreate/re-push it; move it only after hotfix merge and a fresh guard proves Release is still absent and no release workflow is running.
- NEXT_EXACT_ACTION: review only `.github/workflows/release.yml`, `apps/desktop/package.json`, `docs/evidence/release/TVE-REL-008-PACKAGE-ARG-REPAIR.md`, and canonical state changes; verify no unrelated tracked diff; commit; push only to `personal`; open hotfix PR; monitor its automatic CI without rerunning REL-001..007 or prior PASS release stages; merge if PASS; verify merged-tree parity + GitHub Release absence + no active Release run; then guarded-move `v1.1.0` to repaired personal main and monitor only the newly triggered Release workflow. Never publish upstream and never manually create a duplicate Release while workflow is RUNNING.
- DO_NOT_REPEAT:
  - TVE-REL-001..007;
  - PR #2/#3/#4 already-PASS CI/merges;
  - REL-007 full 1.1.0 package/license activation/restart proofs;
  - PASS stages through commercial gates in Release run `38128610356`;
  - first provenance launcher repair and PR #4;
  - optional timed-out local electron-builder parser/help probes;
  - unrelated `.spike-temp/`, `.tmp/`, historical build dirs, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` retained.
- PR #2, PR #3 and PR #4 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance, Remotion basis and Supabase entitlement gates remain PASS.
- Remote tag `v1.1.0` exists and currently peels to `14912c71`; GitHub Release remains absent.
- `TVE-REL-008` is FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
