# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL / ASSEMBLE CLEAN-GATE STAGE REPAIRED LOCALLY — HOTFIX PR PENDING`
- CURRENT_STAGE: `Release run 38133316488 on reviewed personal main bbab9a06 completed FAILURE only at Assemble and validate release artifact set. All earlier steps including the intentionally unsigned Windows NSIS + ZIP package stage PASS and are retained. Exact failure: post-package validate-release --require-clean observed only packages/skill-installer/bin/synthcut.mjs dirty, so RELEASE_METADATA.json was not written and artifact validation then failed downstream. A narrow fail-closed workspace-bin restore gate is repaired locally and targeted smoke PASSes.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: `868cde99d3d77e5a9662ed20c0f3bf9a519a302f` before the uncommitted post-package clean-gate repair; Git is authoritative
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 post-package clean-gate local repair PASS` — allowed-only mutation restore smoke PASS; unexpected tracked mutation rejection PASS; tag-mode release validator static PASS. Evidence: `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`.
- PROCESS_PID: `NONE` for active SynthCut release work; prior read-only watcher PID `121112` exited with run failure
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `pty_18320d8d6969c10cfda2312b4c3366f61e82` exited with code 1 after Release run failure. Workspace PTY `pty_0c64ebe3fad14a6c0f9ed61019d24fb044e4` is unrelated `uv ... pytest ... imp080` and must not be touched.
- LATEST_LOG: `https://github.com/nguyenkhactang922-bot/SynthCut/actions/runs/38133316488`
- LAST_EXIT_CODE: `Release run 38133316488 = FAILURE`; failed stage `Assemble and validate release artifact set`; targeted clean-gate repair smokes = `0/PASS`
- ARTIFACTS:
  - PR #6 — MERGED to personal main at `bbab9a06a09d5f5ed6ccc4742e2de421a6849523`
  - PR #6 CI run `38133008905` — SUCCESS
  - remote annotated tag `v1.1.0` peels to `bbab9a06`
  - Release run `38133316488` — FAILURE after package stage PASS
  - `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-VALIDATOR-CONTRACT-REPAIR.md`
  - GitHub Release `v1.1.0`: not published by failed run; `publish-release` skipped
- BLOCKERS:
  - `REL-008` cannot PASS until this clean-gate hotfix is reviewed/merged and a freshly guarded tag-triggered Release workflow publishes successfully.
  - Existing remote `v1.1.0` tag is a durable side effect. Do not move/re-push it until hotfix merge and a fresh Release-absence/tag/auth/no-active-run guard PASSes.
- NEXT_EXACT_ACTION: review only `.github/workflows/release.yml`, `scripts/release/validate-release.mjs`, `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`, and canonical state changes; verify `git diff --check` and no unrelated tracked diff; commit; push only to `personal`; open exactly one hotfix PR; monitor its automatic CI; if PASS merge to personal main and verify tree parity; then re-check GitHub Release absence + current tag target + GitHub auth + no active Release run before any guarded `v1.1.0` move. Never manually create a duplicate Release and never publish upstream.
- DO_NOT_REPEAT:
  - TVE-REL-001..007;
  - PR #2..#6 completed CI/merge work;
  - PASS stages through `Package intentionally unsigned Windows NSIS + ZIP for current commercial lane` in run `38133316488`;
  - prior failed Release runs `38131284821`, `38128610356`, `38127692348`;
  - prior validator/package/provenance hotfixes;
  - targeted clean-gate smoke already PASS;
  - unrelated `.spike-temp/`, `.tmp/`, historical build dirs, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` retained.
- PR #2..#6 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance, Remotion basis and Supabase entitlement gates remain PASS.
- `v1.1.0` currently peels to reviewed personal `main@bbab9a06`; GitHub Release was not published by run `38133316488`.
- `TVE-REL-008` remains FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
