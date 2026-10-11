# TVE-REL-008 — Post-package clean-gate failure / narrow repair evidence

Status: **FAIL STAGE REPAIRED LOCALLY — hotfix PR/merge + guarded tag retry pending**
Date: 2026-10-11
Target repository: `nguyenkhactang922-bot/SynthCut`
Release tag: `v1.1.0`
Failed Release run: `38133316488`
Failed source: `bbab9a06a09d5f5ed6ccc4742e2de421a6849523`

## Classification
`TVE-REL-008` remains **FAIL**. `TVE-REL-001..007` remain PASS. PR #6 CI/merge/tree-parity and the guarded tag move to `bbab9a06` remain valid checkpoints.

## Retained PASS stages from run 38133316488
The following stages completed PASS and must not be treated as failed:
- checkout;
- Node 22.12 setup;
- release identity/version/source validation;
- lockfile dependency install;
- core + MCP + renderer build;
- pinned FFmpeg 6.1.1 staging source installation;
- verified FFmpeg/Whisper/YuNet/font/provenance staging;
- commercial release gates;
- intentionally unsigned Windows NSIS + ZIP packaging.

The packaging repair from the previous hotfix is therefore verified in the real tag workflow: the command resolved to `electron-builder --win --publish never` and the package stage completed PASS.

## Exact failed stage
Only `Assemble and validate release artifact set` failed.

The first post-package validator invocation reported:

`RELEASE_VALIDATION_FAIL: tracked worktree must be clean for release candidate:`

with exactly one tracked dirty path:

`M packages/skill-installer/bin/synthcut.mjs`

Because the validator exited before writing metadata, the subsequent artifact validator also reported missing/empty `RELEASE_METADATA.json`. That second message is downstream fallout, not an independent root failure.

`publish-release` was skipped and no GitHub Release was created by this failed run.

## Scope analysis
`packages/skill-installer/bin/synthcut.mjs` is the legacy private workspace skill-installer bin entry. The Windows desktop electron-builder `files` set contains desktop Electron files, renderer output and desktop package metadata; this workspace bin is not part of the distributed desktop payload.

The initial pre-build `--require-clean` release validation already passed on exact source `bbab9a06`. The mutation appears only after the install/build/package sequence on the hosted Windows runner. The repair does **not** waive tracked-source cleanliness generally.

## Narrow fail-closed repair
A workflow step is inserted immediately after packaging and before assemble/post-package validation:

`Restore known workspace-bin mutation before post-package clean gate`

Behavior:
1. Read tracked-only porcelain status.
2. Reject immediately if any dirty tracked path is not exactly `packages/skill-installer/bin/synthcut.mjs`.
3. Reject if more than one tracked dirty entry exists.
4. If the one known workspace-bin path is dirty, restore only that path from `HEAD`.
5. Re-check tracked status and fail if anything remains dirty.
6. Emit `POST_PACKAGE_TRACKED_CLEAN_GATE=PASS` only after the worktree is tracked-clean.
7. Existing `validate-release.mjs --require-clean` then remains in force during assemble.

This deliberately avoids weakening the global clean gate or ignoring arbitrary source mutations.

The release validator was also hardened to require the workflow step name, exact allowed path and PASS marker, so future workflow edits cannot silently remove this guard while still passing release validation.

## Targeted verification
No package/build stage was rerun locally.

A disposable Git repository under `.tmp/rel008-clean-gate-smoke` verified the exact guard semantics:
- allowed path only dirty → restore to HEAD + clean result: `REL008_ALLOWED_DIRTY_RESTORE=PASS`;
- unrelated tracked path dirty → fail-closed rejection: `REL008_UNEXPECTED_DIRTY_REJECT=PASS`.

Tag-mode static release validator verification also PASSed with repository/tag/source environment matching the current release line:

`REL005_RELEASE_VALIDATION_PASS version=1.1.0 tag=v1.1.0 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`

## Side-effect guard
At repair time:
- failed run `38133316488` is completed/failure;
- its package stage is PASS and retained;
- `publish-release` was skipped;
- no GitHub Release was published by the run;
- remote `v1.1.0` is already a durable side effect and must not be moved again until this hotfix is reviewed/merged and a fresh Release/tag/auth/no-active-run guard passes;
- upstream `Relo-video/SynthCut` remains out of scope.

## Exit gate for this repair
Before retrying the tag-triggered Release workflow:
1. review only workflow + validator + this evidence/state delta;
2. `git diff --check` PASS;
3. commit/push only to personal feature branch;
4. create one hotfix PR and obtain automatic CI PASS;
5. merge to personal `main` and verify reviewed-head/merge tree parity;
6. re-check GitHub Release `v1.1.0` absence, exact current tag target, GitHub write auth and absence of active Release runs;
7. only then guarded-move existing `v1.1.0` to repaired reviewed main;
8. monitor only the newly triggered Release workflow.

No previous PASS release stage should be manually restarted or duplicated.
