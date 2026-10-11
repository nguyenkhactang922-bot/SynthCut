# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL / PR #8 CI + MERGE + TREE PARITY PASS — GUARDED TAG RETRY PENDING`
- CURRENT_STAGE: `Provenance-timing repair is reviewed. PR #8 automatic CI run 38136588599 SUCCESS on exact head 5a543150172aa5c7ddd7f7b1c2ffcf857c80f968; PR #8 MERGED to personal main at ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb; merge-tree parity PASS. REL-008 remains FAIL only because corrected tag-triggered Release publication has not yet PASSed.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from current Git HEAD; reviewed PR #8 head `5a543150172aa5c7ddd7f7b1c2ffcf857c80f968`; personal main `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 PR #8 MERGE + TREE PARITY PASS` — CI run `38136588599` SUCCESS on `5a54315`; merge commit `ce31bfdd`; `ce31bfdd^{tree} == 5a54315^{tree}`. Evidence: `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`.
- PROCESS_PID: `NONE` for active SynthCut release work
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` for active SynthCut. Current workspace PTYs observed during resume belong to other projects/processes (`Tang Super Veo Studio`, Python/uv, Rust/cargo) and must not be touched.
- LATEST_LOG: `https://github.com/nguyenkhactang922-bot/SynthCut/actions/runs/38134667267`
- LAST_EXIT_CODE: `Release run 38134667267 = FAILURE`; failed stage `Assemble and validate release artifact set`; targeted provenance clean-gate smokes = `0/PASS`
- ARTIFACTS:
  - provenance-timing repair commit `9ec5ccd4065ec9949152f513d6ac6bc747bafeec` — COMMITTED + PUSHED to personal feature branch
  - PR #8 — CI run `38136588599` SUCCESS; MERGED to personal main `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`; merge-tree parity PASS
  - hotfix commit `ee10c86aa93ee35112da6dfe93356881e05f3a7c` — prior post-package clean-gate repair
  - PR #7 — CI PASS and MERGED to personal main at `f9ea9ab3278c2158593508feec21fbf92f7e1ce7`
  - remote annotated tag `v1.1.0` peels to `f9ea9ab`
  - Release run `38134667267` — FAILURE after package + post-package clean gate PASS
  - GitHub Release `v1.1.0` — ABSENT / API 404 after failed run
  - `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`
- BLOCKERS:
  - `REL-008` cannot PASS until a freshly guarded `v1.1.0` tag retry on reviewed `personal/main@ce31bfdd` completes Release workflow + GitHub Release verification successfully.
  - Existing remote `v1.1.0` is a durable side effect. Do not move/re-push it until hotfix merge and fresh Release-absence/tag/auth/no-active-run guards PASS.
- NEXT_EXACT_ACTION: commit/push this PR #8 merge checkpoint on the release branch; then verify GitHub auth, GitHub Release `v1.1.0` absence, exact current remote tag peel, reviewed personal main `ce31bfdd`, and no active Release run. Only if every guard PASSes, guarded-move existing `v1.1.0` to `ce31bfdd` and monitor only the newly triggered Release run. Never manually create a duplicate Release and never publish upstream.
- DO_NOT_REPEAT:
  - TVE-REL-001..007;
  - PR #2..#7 completed CI/merge work;
  - PASS stages through `Restore known workspace-bin mutation before post-package clean gate` in run `38134667267`;
  - prior failed Release runs `38133316488`, `38131284821`, `38128610356`, `38127692348`;
  - prior validator/package/provenance/post-package-clean hotfixes;
  - current targeted provenance timing smokes already PASS;
  - unrelated `.spike-temp/`, `.tmp/`, historical build dirs, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` retained.
- PR #2..#7 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance, Remotion basis and Supabase entitlement gates remain PASS.
- `v1.1.0` currently peels to reviewed personal `main@f9ea9ab`; GitHub Release remains absent after run `38134667267`.
- `TVE-REL-008` remains FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
