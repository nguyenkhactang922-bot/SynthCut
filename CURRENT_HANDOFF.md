# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL / VALIDATOR CONTRACT STAGE REPAIRED LOCALLY — HOTFIX PR PENDING`
- CURRENT_STAGE: `Release run 38131284821 on v1.1.0 / personal main f79ef109 completed FAILURE only at Validate release identity, versions and source state. Checkout/setup PASS; all later stages were skipped in this run. Root cause is stale validator text requiring the old npm --publish forwarding syntax that package hotfix #5 intentionally removed. Validator contract is repaired locally and tag-mode simulation PASSes. GitHub Release remains absent.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from Git; local feature branch contained `bc45331a76f6a43f02fe05901fc5d127b40e1a94` before this uncommitted validator repair; personal main is `f79ef1096ea0282f3dfe6617825ca147136b4dbc`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 validator contract local repair PASS` — tag-mode simulation exit 0 with `REL005_RELEASE_VALIDATION_PASS version=1.1.0 tag=v1.1.0 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`. Evidence: `docs/evidence/release/TVE-REL-008-VALIDATOR-CONTRACT-REPAIR.md`.
- PROCESS_PID: `NONE` for active SynthCut Release workflow; GitHub run `38131284821` is completed/failure
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` required; no active Release run is authorized before validator hotfix merge
- LATEST_LOG: `docs/evidence/release/TVE-REL-008-VALIDATOR-CONTRACT-REPAIR.md`
- LAST_EXIT_CODE: `GitHub Release workflow 38131284821 = FAILURE`; local tag-mode validator repair simulation = `0/PASS`
- ARTIFACTS:
  - PR #5 — MERGED to personal main at `f79ef1096ea0282f3dfe6617825ca147136b4dbc`; merge tree equals CI-PASS head `bc45331`
  - remote annotated tag `v1.1.0` currently peels to `f79ef109`
  - failed Release run `38131284821` on `f79ef109`
  - prior failed Release runs `38128610356` on `14912c71` and `38127692348` on `beeb815`
  - `docs/evidence/release/TVE-REL-008-VALIDATOR-CONTRACT-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-PACKAGE-ARG-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-RELEASE-WORKFLOW-REPAIR.md`
  - GitHub Release `v1.1.0`: ABSENT at last side-effect guard
- BLOCKERS:
  - `REL-008` cannot PASS until validator hotfix is reviewed/merged and a new guarded tag-triggered Release workflow publishes successfully.
  - Existing remote `v1.1.0` tag is a durable side effect. Do not recreate/re-push it while validator hotfix is unmerged; move it only after a fresh no-Release/no-active-run/auth guard.
- NEXT_EXACT_ACTION: review only `scripts/release/validate-release.mjs`, `docs/evidence/release/TVE-REL-008-VALIDATOR-CONTRACT-REPAIR.md`, and canonical state changes; run diff/static validator checks without packaging; commit; push only to `personal`; open validator hotfix PR; monitor automatic CI; merge if PASS and verify tree parity; then re-check GitHub Release absence + current tag target + auth + no active Release run. If clean, guarded-force-move existing `v1.1.0` to repaired personal main and monitor only the newly triggered Release workflow. Never publish upstream and never manually create a Release while workflow is RUNNING.
- DO_NOT_REPEAT:
  - TVE-REL-001..007;
  - PR #2/#3/#4/#5 already-PASS CI/merges;
  - REL-007 full 1.1.0 package/license activation/restart proofs;
  - first provenance launcher repair and package-argument repair;
  - Release run `38131284821` itself or any previous failed Release run;
  - unrelated `.spike-temp/`, `.tmp/`, historical build dirs, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` retained.
- PR #2..#5 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance, Remotion basis and Supabase entitlement gates remain PASS.
- Remote tag `v1.1.0` exists and currently peels to `f79ef109`; GitHub Release remains absent.
- `TVE-REL-008` is FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
