# TVE-REL-008 — Package Argument Failure / Narrow Repair Evidence

Status: **FAIL STAGE REPAIRED LOCALLY — hotfix PR/merge + guarded tag move pending**
Date: 2026-10-11
Target repository: `nguyenkhactang922-bot/SynthCut`
Release tag: `v1.1.0`
Failed workflow run: `38128610356`
Failed source: `14912c71d3ff2f43a036de1a31909e3c2882f21c`

## Input
- `personal/main@14912c71d3ff2f43a036de1a31909e3c2882f21c` after PR #4 merged.
- Remote annotated tag `v1.1.0` peels to the same commit `14912c71`.
- GitHub Release `v1.1.0` is absent.
- Release run `38128610356` is completed/failure.

## Entry Gate
Retained PASS checkpoints from run `38128610356`:
- checkout;
- Node setup;
- release identity/version/source validation;
- lockfile dependency install;
- core + MCP + renderer build;
- pinned FFmpeg staging source install;
- `Stage verified FFmpeg, Whisper, YuNet, font and provenance`;
- commercial release gates.

These stages are not rerun locally for this repair.

## Work
The failed stage was isolated from the GitHub log:

`Package intentionally unsigned Windows NSIS + ZIP for current commercial lane`

Workflow command:

`npm run dist --workspace synthcut-by-relo -- --publish never`

Observed lifecycle resolution:

`electron-builder --win never`

`electron-builder` then failed with:

`Unknown target: never`

Root cause: npm consumed/interpreted the `--publish` option instead of forwarding the intended `--publish never` pair to the workspace lifecycle command, leaving the bare token `never` as a Windows build target.

Narrow fail-safe repair:
- `apps/desktop/package.json`
  - `dist` now contains `electron-builder --win --publish never`.
  - `dist:commercial` now contains `electron-builder --win --config electron-builder.commercial.cjs --publish never`.
- `.github/workflows/release.yml`
  - package steps now call only `npm run dist --workspace synthcut-by-relo` or `npm run dist:commercial --workspace synthcut-by-relo`.
  - no package step forwards `--publish` through npm.

This also removes electron-builder's implicit tag-publish path from both unsigned and future trusted-signing package scripts. GitHub Release publication remains exclusively the separate `publish-release` job.

## Output
A package-command repair that keeps publication disabled inside electron-builder while preserving the existing NSIS/ZIP build configuration and separate GitHub Release publication job.

## Exit Gate
Before release publication can be retried:
1. diff/static validation PASS;
2. hotfix commit and PR CI PASS;
3. merge to personal `main` and verify merged-tree parity;
4. verify GitHub Release `v1.1.0` is still absent and no release workflow is running;
5. guarded move of existing `v1.1.0` to the repaired merged main;
6. monitor only the newly triggered Release workflow.

`TVE-REL-008` remains FAIL until the corrected Release workflow and GitHub Release publication PASS.

## Artifact
- `.github/workflows/release.yml`
- `apps/desktop/package.json`
- this evidence file
- canonical state files

## Evidence
- GitHub run `38128610356`: completed/failure on `14912c71`.
- Failed log proves `npm ... -- --publish never` resolved to `electron-builder --win never`, followed by `Unknown target: never`.
- `gh release view v1.1.0`: `release not found` before repair.
- Remote tag peel: `v1.1.0^{}` -> `14912c71`.
- PR #4 is MERGED at `14912c71`; head `75f08e6`.
- `git diff --check`: PASS after repair.
- Static package/workflow check: `REL008_PACKAGE_COMMAND_STATIC=PASS`.
- Installed electron-builder `26.15.3` source (`node_modules/electron-builder/out/builder.js`) declares `publish` as a build option with allowed choice `never`.
- Two optional local CLI/parser probes timed out with no output; process scan afterward showed no remaining SynthCut/electron-builder process. They are **not** counted as PASS evidence and were not retried.

## Owner / Authority
- Publication target authority: personal fork `nguyenkhactang922-bot/SynthCut` only.
- No upstream publication is authorized.
- Existing tag may be moved only under the side-effect guard above because no GitHub Release has been published.

## Risks / Open Questions
- Correct command plumbing still requires CI proof on the hotfix because local full package rerun is intentionally avoided.
- `TVE-REL-009` and `TVE-REL-010` remain blocked by REL-008.

## Loopback
If hotfix CI fails, repair only the failing CI stage.
If the corrected tag-triggered Release workflow fails later, retain every earlier PASS stage and repair only the newly failing stage.
Never rerun REL-001..007 solely because REL-008 failed.
