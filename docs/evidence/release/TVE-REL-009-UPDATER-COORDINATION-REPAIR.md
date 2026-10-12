# TVE-REL-009 — Updater Core-Coordination Repair

Status: **LOCAL REPAIR VERIFIED / PR + RELEASE-FORWARD PENDING**
Date: 2026-10-12
Task: `TVE-REL-009 — Installed updater E2E + stable verification`

## Input
- `TVE-REL-001..008=PASS` retained.
- Published `v1.1.0` and `v1.1.1` remain immutable historical evidence.
- `docs/evidence/release/TVE-REL-009-UPDATER-INSTALL-INTEGRITY-FAIL.md` records the first incomplete in-place update.
- Existing project-local isolated runtime evidence under `.tmp/rel009-isolated-rerun/probe2`.

## Entry Gate
PASS for a bounded REL-009 product repair because newer runtime evidence disproved the narrower hypothesis that only an externally shared core caused the corrupt update.

No earlier release stage is reopened and no published release is modified in place.

## Contradictory Runtime Evidence
The retained `probe2` evidence proves the old `1.0.6` app started and owned a dedicated core on port `48643`, discovered `v1.1.1`, downloaded the personal-fork installer, and called explicit `quitAndInstall`.

Observed updater log sequence:
1. `started core on port 48643`;
2. `Found version 1.1.1`;
3. `New version 1.1.1 has been downloaded`;
4. `Install on explicit quitAndInstall`;
5. updater executes the NSIS installer;
6. only then reports `Update installer has already been triggered. Quitting application.`

The resulting controlled install became `1.1.1.0` and retained the correct personal-fork update feed/cache identity, but had only 8 top-level production module directories and no `electron-updater`. Therefore an owned-core transition can also corrupt the unpacked `asar=false` install tree.

## Root Cause
The installed `electron-updater` implementation confirms the ordering:
- `BaseUpdater.quitAndInstall()` invokes `install(...)` first;
- on success it schedules `app.quit()` with `setImmediate(...)`;
- `NsisUpdater.doInstall()` immediately spawns the downloaded NSIS installer.

The existing desktop used `app.on("quit")` to terminate an app-owned core. That cleanup happens after NSIS is already launched, so the core can still hold files under `resources/app` while NSIS begins replacement.

This is an update-install sequencing defect, not a defect in the published `v1.1.1` artifact contents.

## Repair
Release-forward version is advanced to `1.1.2`; `v1.1.1` is not mutated.

Desktop updater coordination now:
- sets `autoUpdater.autoInstallOnAppQuit = false`;
- never installs while attached to a shared core; instead it defers with a user-visible message;
- for an app-owned core, explicitly requests core shutdown and waits for the child `exit` event;
- fails closed on shutdown timeout/error;
- only after confirmed core exit sets the controlled quit flag and calls `quitAndInstall(false, true)`.

The coordination logic is isolated in `apps/desktop/electron/update-coordinator.cjs` so ordering can be tested without launching Electron.

## Deterministic Smoke
`scripts/release/smoke-updater-coordination.cjs` verifies:
1. shared core -> update deferred; installer is never invoked;
2. owned core -> strict ordering `child.kill -> child.exit -> clearCoreState -> forceQuit -> quitAndInstall`;
3. already-stopped owned core -> safe install path;
4. core-stop timeout -> fail closed with no installer invocation.

Marker: `REL009_UPDATER_COORDINATION_SMOKE=PASS`.

The smoke is added to `.github/workflows/ci.yml` so PR CI must preserve this ordering.

## Local Verification
PASS / exit 0 on repaired source:
- `node --check apps/desktop/electron/main.cjs`;
- `node --check apps/desktop/electron/update-coordinator.cjs`;
- `node scripts/release/smoke-updater-coordination.cjs` -> `REL009_UPDATER_COORDINATION_SMOKE=PASS`;
- root `npm run typecheck` at version `1.1.2`;
- root `npm run build` at version `1.1.2`;
- `node scripts/release/validate-release.mjs` -> `REL005_RELEASE_VALIDATION_PASS version=1.1.2 tag=v1.1.2 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`;
- `.github/workflows/ci.yml` PyYAML parse -> `CI_YAML_PARSE=PASS`;
- `git diff --check` PASS.

## Exit Gate
**Not yet PASS for REL-009.** Local repair is verified, but completion still requires:
- scoped commit + personal-fork PR;
- CI/review/merge + merged-tree verification;
- guarded publication of a new immutable `v1.1.2` release;
- runtime updater E2E using a fixed lower-version test package initiating an update to public `v1.1.2`;
- proof that the core is gone before installer start, resulting module tree is complete, `electron-updater` remains present, feed/cache identity remains fork-owned, Authenticode remains intentionally `NotSigned`, encrypted license revalidates on the same device, and project/user-state hashes remain unchanged;
- shared-core runtime path proves install is deferred without mutation.

## Owner / Authority
Repository/product owner already authorized the unsigned commercial release lane. No new commercial-policy decision is required for this bounded correctness repair.

## Risks / Open Questions
An already-published `v1.1.1` binary contains the old updater sequencing behavior. The new coordination code cannot retroactively change how that binary initiates its next update. Therefore the fixed runtime E2E must be driven by a controlled lower-version package containing the new coordinator; do not falsely claim the public `v1.1.1 -> v1.1.2` transition exercises the new code.

## Loopback
If deterministic coordination or fixed-package runtime E2E fails, loop back only within REL-009 updater coordination/install behavior. Do not rerun REL-001..008 or mutate prior published releases.
