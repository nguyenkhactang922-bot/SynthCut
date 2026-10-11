# TVE-REL-008 — Release Workflow Failure / Narrow Repair Evidence

Status: **FAIL STAGE REPAIRED LOCALLY — hotfix PR/merge + guarded tag move pending**
Date: 2026-10-11
Target repository: `nguyenkhactang922-bot/SynthCut`
Release tag: `v1.1.0`
Failed workflow run: `38127692348`
Failed source: `beeb8152331c172b728b96c34f3b4df22b472351`

## Classification
`TVE-REL-008` is not PASS. The release workflow completed **FAIL**. Prior REL-001..007 and PR #2/#3 verification remain PASS and are retained.

## Failed stage
Only the release workflow stage `Stage verified FFmpeg, Whisper, YuNet, font and provenance` failed.

The stages before it passed:
- checkout;
- setup Node 22.12.0;
- release identity/version/source validation;
- lockfile dependency install;
- core + MCP + renderer build;
- pinned FFmpeg 6.1.1 source installation.

All later commercial gate/package/artifact/publish steps were skipped. `publish-release` was skipped. No GitHub Release was created.

## Failure evidence
GitHub Actions reported:
- `npm run prepare:bundle --workspace synthcut-by-relo`;
- package script resolved to `node scripts/prepare-bundle.ts`;
- Node `v22.12.0` threw `ERR_UNKNOWN_FILE_EXTENSION` for `apps/desktop/scripts/prepare-bundle.ts`;
- stage exit code `1`.

Workflow run status is `completed/failure`; head branch `v1.1.0`; head SHA `beeb8152331c172b728b96c34f3b4df22b472351`.

## Root cause
The TypeScript release-staging script was invoked by plain Node without enabling Node 22's TypeScript type stripping. This is a launcher defect; the provenance/staging logic itself did not execute in the failed workflow.

Node.js 22.12 documentation confirms `--experimental-strip-types` is available (introduced in 22.6) for erasable TypeScript syntax. `prepare-bundle.ts` uses erasable type syntax and imports compiled core JavaScript for its runtime dependencies.

## Narrow repair
Changed only `apps/desktop/package.json`:

`prepare:bundle`: `node scripts/prepare-bundle.ts`
→ `node --experimental-strip-types scripts/prepare-bundle.ts`

No provenance logic, release gates, package version, artifact naming, signing policy, license policy, or updater configuration changed.

A temporary `tsx`-launcher experiment was rejected because the local existing `node_modules` tree had an unrelated `unicorn-magic` export failure. The experiment was fully reverted; `package-lock.json` returned to its original bytes and no new dependency remains.

## Targeted verification
The exact failed staging logic was rerun locally with the repaired Node launcher and the already-verified project-local FFmpeg/ffprobe bundle. It completed PASS / exit 0:
- FFmpeg `6.1.1-essentials_build-www.gyan.dev` verified + staged;
- `whisper-cli.exe` + runtime libraries + `ggml-base.en.bin` staged;
- YuNet model staged;
- Noto Sans font + license staged;
- `bundle-manifest.json` written with exact hashes + source mapping;
- final bundle size `313.0 MB`.

This test did **not** rerun the full package/release pipeline.

## Side-effect guard
At the time of repair:
- remote `v1.1.0` tag exists and still references the failed release source lineage;
- GitHub Release `v1.1.0` is **ABSENT**;
- failed workflow never reached artifact upload or publication;
- upstream `Relo-video/SynthCut` remains out of scope and must not be modified.

Do not blindly re-push/recreate the tag. First merge the hotfix to personal `main`; then re-check release/tag/auth state. Only because no Release was published may the existing `v1.1.0` tag be deliberately moved to the repaired reviewed main commit, with the move recorded as a guarded corrective side effect.

## Exit gate for this repair
Before retrying release publication:
1. review/commit the single launcher change + this evidence/state;
2. push only to `personal` and obtain CI PASS on the hotfix PR;
3. merge to personal `main` and verify tree parity;
4. re-check GitHub auth, `v1.1.0` Release absence, and exact current tag target;
5. guarded move of `v1.1.0` to repaired main only if release remains absent;
6. monitor the newly triggered Release workflow; never manually create a duplicate Release while that workflow is running.

## Pre-commit review note
`git diff --check` PASS. `package-lock.json` has no tracked diff after the rejected temporary `tsx` experiment. Running `node scripts/release/validate-release.mjs` on this hotfix branch stops at the existing-tag collision (`release tag v1.1.0 already exists`); this is expected and confirms the durable tag side effect is being guarded rather than silently bypassed. Version bump/tag deletion is not authorized as part of the launcher repair.
