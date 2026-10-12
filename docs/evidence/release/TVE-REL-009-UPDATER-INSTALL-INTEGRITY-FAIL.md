# TVE-REL-009 — Updater Install Integrity Failure

Status: **FAIL — bounded updater-transition rerun required**
Date: 2026-10-12
Task: `TVE-REL-009 — Installed updater E2E + stable verification`

## Retained PASS checkpoints
- TVE-REL-001..008 remain PASS.
- `v1.1.0` remains immutable published historical evidence.
- updater identity repair is reviewed/merged.
- `v1.1.1` is published on `nguyenkhactang922-bot/SynthCut`, tag peel `452dd263163faa2b48ca91006c4f8ff65cffbb7d`.
- Release workflow run `38161855081` is SUCCESS.
- published v1.1.1 EXE SHA-256 is `acb0c62b703c5cf29b05b19fe15045c2d4b7fc67c166130b20a6d5e12d0753a6`.
- the first updater attempt discovered/downloaded the personal-fork v1.1.1 release and changed the controlled install executable to `1.1.1.0`.

## Failure classification
The updater E2E is **FAIL**, not PASS and not RUNNING.

The updated process from the first attempt is no longer alive, and final post-install markers were not completed. Durable inspection then found that the resulting in-place install tree is incomplete:
- updated executable version: `1.1.1.0`;
- updated `app-update.yml`: personal fork + `tang-ai-video-editor-updater`;
- updated Authenticode: `NotSigned` as intended;
- but `resources/app/node_modules` contains only `@aive`;
- `resources/app/node_modules/electron-updater` is absent;
- relaunch log records `electron-updater unavailable: Cannot find module 'electron-updater'`.

That result cannot satisfy REL-009 because the installed updated application must remain capable of querying the fork update feed on future launches.

## Isolation evidence
This is not a published v1.1.1 package-content defect:
- existing fresh v1.1.1 install under `.tmp/rel009-fresh111-install` is `1.1.1.0`, `NotSigned`, contains `224` top-level production module directories, and contains `electron-updater`;
- existing local `rel009-identity-dist` / `rel009-identity-smoke` package trees also contain `electron-updater`.

The failed transition was not isolated from a pre-existing core. Its updater log states the old 1.0.6 app **attached to existing core on port 4789** before downloading/installing v1.1.1. The desktop contract intentionally leaves an attached/shared core alive on app quit. That external core can keep files under the install tree in use while NSIS replaces the application directory. The observed post-update tree — retained `@aive` only while the newly packaged production modules are absent — is consistent with this invalid test precondition.

## Narrow repair / rerun rule
Do not rerun REL-001..008, do not rebuild 1.0.6, and do not republish v1.1.1.

Rerun only the failed updater transition using:
1. the already accepted `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe`;
2. a new project-local install directory;
3. a new project-local `AIVE_DATA_DIR` with no `server.json` / existing core;
4. a dedicated `AIVE_PORT` so the old app must own the core;
5. project-local APPDATA / LOCALAPPDATA / TEMP / userData;
6. the existing encrypted `license.json` copied under the same Windows user (no plaintext key exposure);
7. preserved test project/marker hashes captured before update;
8. explicit proof that the owned core is gone before the NSIS update replaces the tree.

The rerun may repeat only the failed updater-transition stage because the prior transition produced an invalid/corrupted installed tree. Published release side effects must not be recreated.

## Exit conditions for repaired REL-009 E2E
The controlled 1.0.6 → 1.1.1 transition must prove:
- old app reads only `nguyenkhactang922-bot/SynthCut` and discovers v1.1.1;
- downloaded installer hash equals the published SHA-256;
- old app owns its dedicated core and that core exits before install replacement;
- resulting installed app is `1.1.1.0` and `NotSigned`;
- resulting installed tree still contains `electron-updater` and the expected production dependency tree;
- `app-update.yml` uses personal fork + `tang-ai-video-editor-updater`;
- relaunch of the updated app can load `electron-updater` and performs its normal feed check without upstream access;
- stored encrypted license revalidates using the same deviceId;
- project and user-state markers/hashes remain unchanged.

## Loopback
REL-009 updater-transition harness/isolation only. Product packaging changes are not authorized unless the isolated rerun proves the public installer itself is defective.
