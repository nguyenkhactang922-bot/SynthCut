# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL (PR CI run 38125686293) / FAILED STAGE REPAIRED LOCALLY — PR CI RERUN PENDING`
- CURRENT_STAGE: `PR #2 verification. Original head db00c89 failed only Smoke — jobs because bounded export stayed fraction=0 during first segment; source repair + exact local smoke + core compile now PASS and await commit/push/new CI.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from Git; current committed head before repair commit is `db00c8972671c758dce7eba97966315279efa2b2`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-008 failed-stage local repair PASS` — exact `smoke-jobs` rerun observed running fraction `0.005` and marker `JOBS SMOKE TEST PASSED`; `tsc -b packages/core` PASS. Evidence: `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`.
- PROCESS_PID: `NONE` — targeted local smoke exited 0
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `pty_b2dccf8893811eb5f43045502b23a3ffd390` exited 0 for targeted jobs smoke
- LATEST_LOG: `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`
- LAST_EXIT_CODE: `0` targeted jobs smoke after repair; prior GitHub CI run `38125686293` concluded failure only at jobs-progress assertion
- ARTIFACTS:
  - PR `nguyenkhactang922-bot/SynthCut#2`
  - CI run `38125686293` failed head `db00c89` with all preceding CI stages PASS
  - `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`
  - retained REL-007 1.1.0 installer/ZIP artifacts and evidence; do not rebuild them for this CI repair
- BLOCKERS: `REL-008 cannot merge/publish until repaired commit is pushed and a new PR CI run PASSes.` No tag/release collision existed at the last REL-008 side-effect guard; recheck immediately before tagging/publishing.
- NEXT_EXACT_ACTION: review/stage only the bounded-export progress repair + REL-008 evidence/state, commit, verify remote feature branch still points to `db00c89`, push only to `personal`, then monitor the newly triggered PR #2 CI run. If it PASSes, review/merge PR #2 to personal main; do not tag or publish before merged-main and collision checks.
- DO_NOT_REPEAT:
  - TVE-REL-001..007, including full 1.1.0 package/license activation/restart proofs;
  - CI stages already PASS in run 38125686293 except normal GitHub CI will rerun automatically after the repair push;
  - unrelated `.spike-temp/`, `.tmp/`, historical build directories, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` for the owner-approved unsigned commercial lane.
- PR #2 exists on personal fork only; upstream `origin` must not be modified.
- Current release line is `1.1.0`; unsigned/SmartScreen acceptance and Supabase entitlement gates remain PASS.
- `TVE-REL-008` remains NOT PASS until PR CI/review/merge plus GitHub Release publication are verified.
- REL-009 remains blocked by REL-008.
