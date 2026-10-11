# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `PASS (PR #2 CI + merge) / PRE-TAG DURABLE STATE SYNC`
- CURRENT_STAGE: `PR #2 CI run 38126601288 PASS on head a27c78f; PR #2 merged to personal main at 622af29029d53c2724af6f5789c54b43688d25da; merged tree equals tested head tree. v1.1.0 tag/release are still absent.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from Git; local branch fast-forwarded to merged personal main `622af29029d53c2724af6f5789c54b43688d25da` before this state-sync commit
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-008 PR verification PASS` — CI `build-and-smoke` SUCCESS on exact repaired head `a27c78f`; PR #2 MERGED; `personal/main@622af29` tree hash equals `a27c78f` tree hash; no SynthCut process remains. Evidence: `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`.
- PROCESS_PID: `NONE`
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` active; prior PTYs are exited/expired
- LATEST_LOG: `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`
- LAST_EXIT_CODE: `PASS` for GitHub CI run `38126601288`; merge command exit 0; merged-tree parity PASS
- ARTIFACTS:
  - PR `nguyenkhactang922-bot/SynthCut#2` — MERGED
  - CI run `38126601288` — SUCCESS on `a27c78f9404024eb45638512c2e513a82d188f5b`
  - `personal/main@622af29029d53c2724af6f5789c54b43688d25da`
  - `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`
  - retained REL-007 1.1.0 installer/ZIP artifacts and evidence; do not rebuild them for state sync
- BLOCKERS: `NONE` technical. Before creating the public release, durable state must be committed/merged and then tag/release/auth collision checks must be repeated. `v1.1.0` tag and GitHub Release were absent at the last guard.
- NEXT_EXACT_ACTION: commit this state/evidence sync only, push only to `personal`, create a state-only follow-up PR to `personal/main`, monitor its automatic CI without rerunning local PASS stages, merge it if PASS, then recheck personal-main HEAD + `v1.1.0` local/remote tag + GitHub Release + GitHub auth. If clean, create the fork-only `v1.1.0` release path and monitor the release workflow. Never publish to upstream `Relo-video/SynthCut`.
- DO_NOT_REPEAT:
  - TVE-REL-001..007, including full 1.1.0 package/license activation/restart proofs;
  - PR #2 failed run repair, targeted jobs smoke, core compile, successful CI run `38126601288`, or PR #2 merge;
  - unrelated `.spike-temp/`, `.tmp/`, historical build directories, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` for the owner-approved unsigned commercial lane.
- PR #2 merged on personal fork only; upstream `origin` remains untouched.
- Current release line is `1.1.0`; unsigned/SmartScreen acceptance and Supabase entitlement gates remain PASS.
- `TVE-REL-008` is not DONE until GitHub Release publication is verified.
- REL-009 remains blocked until REL-008 publishes a valid release/update feed.
