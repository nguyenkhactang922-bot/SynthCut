# TVE-REL-009 — Updater Identity Preflight

Status: **FAIL / BOUNDED LOOPBACK TO REL-002 UPDATER IDENTITY**
Date: 2026-10-11
Dependency: `TVE-REL-008=PASS`

## Input
- Published personal-fork Release `v1.1.0` from REL-008.
- Installed older fork build `1.0.6` retained from REL-006 at `.tmp/rel006-installed4`.
- REL-009 contract from `docs/plan/PHASE7_RELEASE_PLAN_V1.md` requiring no upstream feed access **or identity collision**.

## Entry Gate
Published update metadata is valid: PASS from REL-008.
A true updater transition is available from installed `1.0.6` to published `1.1.0`.

## Work
Preflighted the installed updater configuration before launching any updater/install side effect.

Observed older installed fork:
- version: `1.0.6`;
- feed owner/repo: `nguyenkhactang922-bot/SynthCut` — correct personal fork;
- `updaterCacheDirName: synthcut-by-relo-updater`.

Observed current build/release source:
- `apps/desktop/package.json.name = synthcut-by-relo`;
- current generated `apps/desktop/build/dist/win-unpacked/resources/app-update.yml` also reports `updaterCacheDirName: synthcut-by-relo-updater`.

Observed upstream source:
- `origin=https://github.com/Relo-video/SynthCut.git`;
- upstream `apps/desktop/package.json.name = synthcut-by-relo`;
- upstream app id/product are `com.relo.synthcut` / `SynthCut by Relo`.

Installed `electron-builder` source confirms the cache identity is derived from the package name:
- `node_modules/app-builder-lib/out/appInfo.js`: `updaterCacheDirName = sanitizedName.toLowerCase() + "-updater"`;
- NSIS target uses that updater cache identity for installer/package store files.

## Output
REL-009 updater E2E is **not authorized to PASS** on `v1.1.0` because the fork and upstream share the same updater cache namespace `synthcut-by-relo-updater`.

No updater download/install/relaunch side effect was started after this finding.

## Exit Gate
**FAIL at identity preflight.**
The REL-009 condition `no upstream feed access or identity collision` is not met even though the feed owner/repo itself is correct.

## Artifact
This evidence record.

## Evidence
- `.tmp/rel006-installed4/resources/app-update.yml` → personal fork feed + colliding cache name.
- `.tmp/rel006-installed4/resources/app/package.json` → version `1.0.6`, package name `synthcut-by-relo`.
- `apps/desktop/package.json` → current package name `synthcut-by-relo`.
- current generated `apps/desktop/build/dist/win-unpacked/resources/app-update.yml` → same cache name.
- `origin/main:apps/desktop/package.json` → upstream package name also `synthcut-by-relo`.
- `node_modules/app-builder-lib/out/appInfo.js` + NSIS target → cache name derives from package name and is used by updater installer storage.

## Owner / Authority
ChatGPT Web/FileMCP-E may repair the implementation because the existing REL-009 acceptance criterion already forbids identity collision; no new product decision is required.

## Risks / Open Questions
- Published `v1.1.0` remains a valid REL-008 artifact but is not eligible to close REL-009 stable verification.
- Because `v1.1.0` is already publicly released, the fix must release-forward under a higher version. Do not overwrite or silently replace the shipped release.
- Renaming the private desktop workspace package requires synchronized root workspace selectors, lockfile identity, workflow/validator commands and current release docs; historical evidence must remain unchanged.

## Loopback
Reopen only the affected REL-002 updater-identity implementation plus REL-005 version/release metadata needed for a release-forward build.

Repair target:
1. give the private desktop workspace a fork-owned unique npm/package identity, proposed `tang-ai-video-editor`;
2. update live workspace selectors/workflow/validator/current docs and lockfile consistently;
3. verify generated `app-update.yml` uses a unique updater cache namespace and still points only to `nguyenkhactang922-bot/SynthCut`;
4. bump release forward from `1.1.0` to `1.1.1` because `1.1.0` is already shipped;
5. test/CI/review/merge, publish `v1.1.1` under normal guards, then rerun only the REL-009 updater transition and remaining verification.

Do not rerun REL-001..008 from scratch and do not mutate the already published `v1.1.0` release.
