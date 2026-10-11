# TVE-REL-008 — Release Validator Contract Repair

Status: **FAIL STAGE REPAIRED LOCALLY — validator hotfix PR/merge + guarded tag move pending**
Date: 2026-10-11
Target repository: `nguyenkhactang922-bot/SynthCut`
Release tag: `v1.1.0`
Failed workflow run: `38131284821`
Failed source: `f79ef1096ea0282f3dfe6617825ca147136b4dbc`

## Input
- PR #5 merged to personal `main` at `f79ef1096ea0282f3dfe6617825ca147136b4dbc` with merged-tree parity PASS against hotfix head `bc45331a76f6a43f02fe05901fc5d127b40e1a94`.
- Remote annotated tag `v1.1.0` was guarded-moved to peel to `f79ef109` only after auth PASS, GitHub Release absence, and no active Release workflow were verified.
- New tag-triggered Release run `38131284821` completed FAILURE.

## Entry Gate
The run reached and passed only:
- job setup;
- checkout;
- Node setup.

The first functional gate, `Validate release identity, versions and source state`, failed. All later install/build/provenance/commercial/package/artifact/publish stages were skipped in this run.

Previously valid REL-001..007 evidence and earlier REL-008 PASS checkpoints remain retained and are not rerun solely because this validator contract failed.

## Work
Exact failed log:

`RELEASE_VALIDATION_FAIL: release workflow is missing required token: npm run dist --workspace synthcut-by-relo -- --publish never`

Root cause: `scripts/release/validate-release.mjs` still encoded the old npm-forwarding syntax that the immediately preceding package-argument hotfix intentionally removed. The validator also required the old exact `dist:commercial` script value without `--publish never`.

This was a stale validation contract, not a regression in packaging logic.

Narrow repair in `scripts/release/validate-release.mjs`:
- required workflow token changed to the current non-forwarding form `npm run dist --workspace synthcut-by-relo`;
- validator explicitly rejects any workflow containing `-- --publish never`;
- validator now requires desktop `dist` to be exactly `electron-builder --win --publish never`;
- validator now requires desktop `dist:commercial` to be exactly `electron-builder --win --config electron-builder.commercial.cjs --publish never`.

The validator therefore checks the stronger invariant introduced by the previous hotfix: electron-builder publishing is disabled inside package scripts, while workflow steps do not forward publishing arguments through npm.

## Output
A validator aligned with the reviewed non-publishing packaging contract, without changing release artifacts, package version, licensing policy, signing policy, or publication target.

## Exit Gate
Before another tag-triggered Release workflow is allowed:
1. validator hotfix diff/static verification PASS;
2. commit/push only to the personal feature branch;
3. PR CI PASS and merge to personal `main`;
4. merged-tree parity verification;
5. verify GitHub Release `v1.1.0` remains absent, current tag target is known, GitHub auth is valid, and no Release workflow is active;
6. only then guarded-force-move the existing `v1.1.0` tag to the repaired reviewed main commit;
7. monitor only the newly triggered Release workflow.

`TVE-REL-008` remains FAIL until the corrected Release workflow and GitHub Release publication PASS.

## Artifact
- `scripts/release/validate-release.mjs`
- this evidence file
- canonical state files

## Evidence
- GitHub Release run `38131284821`: completed/failure on exact source `f79ef109`.
- Failed stage: `Validate release identity, versions and source state`.
- All steps after validation were skipped, including `publish-release`; no duplicate release side effect occurred.
- Local tag-mode validator simulation after repair PASS / exit 0:
  `REL005_RELEASE_VALIDATION_PASS version=1.1.0 tag=v1.1.0 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`.
- The repair changes validation only; no package/release pipeline was rerun locally.

## Owner / Authority
- Authorized publication repository: `nguyenkhactang922-bot/SynthCut` only.
- Upstream `Relo-video/SynthCut` remains forbidden for publication/mutation.
- Tag movement remains a guarded corrective side effect only while GitHub Release is absent.

## Risks / Open Questions
- CI must prove the validator repair on committed source before another tag move.
- Later Release stages remain unverified in run `38131284821` because validation failed before them; earlier PASS evidence is retained where applicable, but a newly triggered workflow must execute them after this validator repair.
- REL-009 and REL-010 remain blocked by REL-008.

## Loopback
If validator hotfix PR CI fails, repair only the failing CI stage.
If the next tag-triggered Release workflow fails at a later stage, retain all earlier PASS stages and repair only the newly failing stage.
Never rerun REL-001..007 solely because REL-008 failed.
