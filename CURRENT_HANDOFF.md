# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `RUNNING / RELEASE RUN 38137052906 IN PROGRESS`
- CURRENT_STAGE: `All tag guards PASSed; existing v1.1.0 was force-moved once from prior peel f9ea9ab to reviewed personal main ce31bfdd. GitHub Actions Release run 38137052906 is IN_PROGRESS on exact head ce31bfdd. Latest observed stage: setup-node after checkout PASS; new pre-provenance and post-package clean gates are present in this run.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from current Git HEAD; reviewed PR #8 head `5a543150172aa5c7ddd7f7b1c2ffcf857c80f968`; personal main `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 PR #8 MERGE + TREE PARITY PASS` — CI run `38136588599` SUCCESS on `5a54315`; merge commit `ce31bfdd`; `ce31bfdd^{tree} == 5a54315^{tree}`. Evidence: `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`.
- PROCESS_PID: `123720` — local read-only gh run watcher; authoritative release execution is GitHub Actions run `38137052906`
- PROCESS_COMMAND: `gh run watch 38137052906 --repo nguyenkhactang922-bot/SynthCut --exit-status --interval 3`
- PTY_SESSION: `pty_478d803b5e985b72f52d31d7d198b53fff2d` monitors only Release run `38137052906`. Other workspace PTYs belong to unrelated projects/processes and must not be touched.
- LATEST_LOG: `https://github.com/nguyenkhactang922-bot/SynthCut/actions/runs/38137052906`
- LAST_EXIT_CODE: `Release run 38137052906 = IN_PROGRESS / no exit yet`; prior failed run `38134667267` retained as historical evidence only
- ARTIFACTS:
  - provenance-timing repair commit `9ec5ccd4065ec9949152f513d6ac6bc747bafeec` — COMMITTED + PUSHED to personal feature branch
  - PR #8 — CI run `38136588599` SUCCESS; MERGED to personal main `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`; merge-tree parity PASS
  - guarded `v1.1.0` tag move — auth/Release-absence/tag/main/no-active-run guards PASS; new Release run `38137052906` created on exact `ce31bfdd`
  - hotfix commit `ee10c86aa93ee35112da6dfe93356881e05f3a7c` — prior post-package clean-gate repair
  - PR #7 — CI PASS and MERGED to personal main at `f9ea9ab3278c2158593508feec21fbf92f7e1ce7`
  - remote annotated tag `v1.1.0` was guarded-moved and now peels to reviewed personal `main@ce31bfdd`
  - Release run `38137052906` — IN_PROGRESS on exact reviewed head `ce31bfdd`
  - prior Release run `38134667267` — FAILURE retained as historical evidence
  - GitHub Release `v1.1.0` — ABSENT / API 404 after failed run
  - `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`
- BLOCKERS:
  - `REL-008` cannot PASS until the existing Release run `38137052906` completes successfully and the resulting GitHub Release/artifact set/source SHA are verified.
  - Existing remote `v1.1.0` is now a durable side effect at `ce31bfdd`. Do not move/re-push it or manually create a Release while run `38137052906` is RUNNING.
- NEXT_EXACT_ACTION: monitor existing Release run `38137052906` only. If RUNNING, continue monitoring the same run without restart/tag retry/manual Release. If PASS, verify GitHub Release `v1.1.0`, exact artifact set/update metadata/source SHA, then sync REL-008 PASS and advance automatically to REL-009 updater E2E. If FAIL, retain every preceding PASS checkpoint and repair only the exact failed stage lineage. Never publish upstream.
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
- PR #2..#8 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance, Remotion basis and Supabase entitlement gates remain PASS.
- `v1.1.0` now peels to reviewed personal `main@ce31bfdd`; Release run `38137052906` is authoritative and RUNNING; no GitHub Release existed immediately before the guarded tag move.
- `TVE-REL-008` remains FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
