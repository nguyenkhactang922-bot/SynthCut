# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL / RELEASE WORKFLOW FAILED STAGE REPAIRED LOCALLY — HOTFIX PR PENDING`
- CURRENT_STAGE: `Release run 38127692348 on tag v1.1.0 completed FAILURE at only Stage verified FFmpeg, Whisper, YuNet, font and provenance. Root cause was Node 22.12 invoking prepare-bundle.ts without TypeScript stripping. Launcher is repaired locally and the exact failed staging logic now PASSes; no release was published.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: `beeb8152331c172b728b96c34f3b4df22b472351` before the uncommitted REL-008 launcher repair; Git is authoritative
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 failed-stage local repair PASS` — `node --experimental-strip-types apps/desktop/scripts/prepare-bundle.ts` completed exit 0 with verified FFmpeg 6.1.1, Whisper, YuNet, Noto Sans, bundle manifest, 313.0 MB bundle. Evidence: `docs/evidence/release/TVE-REL-008-RELEASE-WORKFLOW-REPAIR.md`.
- PROCESS_PID: `NONE` for active SynthCut release/staging task
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: release watcher and local targeted staging PTYs completed/expired; no active release retry is authorized
- LATEST_LOG: `docs/evidence/release/TVE-REL-008-RELEASE-WORKFLOW-REPAIR.md`
- LAST_EXIT_CODE: `GitHub Release workflow 38127692348 = FAILURE`; targeted failed-stage repair verification = `0/PASS`
- ARTIFACTS:
  - failed Release run `38127692348` on `v1.1.0` / `beeb8152331c172b728b96c34f3b4df22b472351`
  - `docs/evidence/release/TVE-REL-008-RELEASE-WORKFLOW-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`
  - remote tag `v1.1.0` exists; GitHub Release `v1.1.0` is absent
  - retained REL-007 local 1.1.0 artifact evidence; do not rebuild it for this launcher hotfix
- BLOCKERS:
  - `REL-008` cannot PASS until the launcher hotfix is reviewed/merged and a corrected tag-triggered Release workflow PASSes.
  - Existing remote `v1.1.0` tag is a durable side effect and must not be blindly recreated/re-pushed. It may be moved only after hotfix merge and a fresh guard proves GitHub Release is still absent.
- NEXT_EXACT_ACTION: review/stage only `apps/desktop/package.json` + REL-008 release-workflow repair evidence/state, run diff/static validation without rerunning REL-007/package stages, commit, push only to `personal`, open hotfix PR, monitor its automatic CI, merge if PASS, then repeat auth/tag/release guard. If Release remains absent, deliberately move `v1.1.0` to repaired personal main and monitor the newly triggered Release workflow. Never publish upstream and never manually create a duplicate Release while a release workflow is RUNNING.
- DO_NOT_REPEAT:
  - TVE-REL-001..007;
  - PR #2/#3 CI and merges;
  - REL-007 full 1.1.0 package/license activation/restart proofs;
  - successful stages 1–7 of failed Release run 38127692348;
  - full release/package workflow until the hotfix is merged and tag move is guarded;
  - unrelated `.spike-temp/`, `.tmp/`, historical build dirs, datasets, or other project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` retained.
- PR #2 and PR #3 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance and Supabase entitlement gates remain PASS.
- Remote tag `v1.1.0` exists but its first Release workflow failed before publication; GitHub Release remains absent.
- `TVE-REL-008` is FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
