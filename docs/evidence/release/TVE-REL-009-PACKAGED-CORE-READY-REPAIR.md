# TVE-REL-009 — Packaged Core Readiness Repair

Status: **LOCAL REPAIR VERIFIED / v1.1.3 REVIEW + RELEASE-FORWARD PENDING**
Date: 2026-10-12
Task: `TVE-REL-009 — Installed updater E2E + stable verification`

## Input
- `TVE-REL-001..008=PASS` retained.
- Published `v1.1.0`, `v1.1.1`, and `v1.1.2` remain immutable historical evidence.
- `docs/evidence/release/TVE-REL-009-PACKAGED-CORE-READY-FAIL.md` records the packaged runtime readiness failure after the v1.1.2 updater-coordination release-forward.

## Failure reproduced
A fresh controlled lower-version install at `.tmp/rel009-fixed-e2e-install` was launched with project-local userData/APPDATA/LOCALAPPDATA/TEMP/AIVE_DATA_DIR and dedicated `AIVE_PORT=48712`.

The core became healthy and published authoritative `server.json` state (`pid=136700`, port `48712`), but the desktop never logged `[aive] started core on port 48712` and then quit. No updater download/install side effect occurred in that failed attempt.

## Root Cause
`apps/desktop/electron/core-launcher.cjs` previously resolved a newly spawned core only when the child stdout pipe delivered JSON `{event:"ready"}`. In packaged Electron runtime, the child can become healthy and write authoritative `server.json` even when that stdout ready line does not reach the launcher. The launcher then times out despite a live healthy core.

## Repair
`startCore()` retains stdout JSON as the fast path and adds a fail-closed readiness fallback:
- poll the same `AIVE_DATA_DIR/server.json` during the existing startup window;
- accept only when `Number(server.pid) === child.pid`;
- require a valid port and `/health` HTTP 200 before resolving;
- use the token from the same authoritative server record;
- never accept a mismatched PID;
- preserve child exit/error/timeout failure behavior;
- on failed startup, best-effort kill the spawned child to avoid orphan cores.

Test-only options (`cliPath`, `readyTimeoutMs`, `pollIntervalMs`) allow deterministic launcher smoke coverage without changing production defaults.

## Deterministic Smoke
New `scripts/release/smoke-core-launcher-ready-fallback.cjs` covers:
1. a fake child core that serves `/health` and writes matching `server.json` but intentionally emits no stdout ready JSON — launcher must resolve;
2. a healthy fake core that writes a deliberately mismatched PID — launcher must time out/reject and the spawned child must be cleaned up.

Marker: `REL009_CORE_READY_FALLBACK_SMOKE=PASS`.

CI `.github/workflows/ci.yml` now runs this smoke after the existing updater-coordination smoke.

## Packaged Runtime Proof
The already-installed controlled 1.1.1 fixture was patched **only inside `.tmp` test evidence** with the repaired `core-launcher.cjs`; public artifacts were not modified.

Runtime under `.tmp/rel009-ready-runtime-smoke` / dedicated port `48713` proved:
- core wrote `server.json` with PID `98564`, port `48713`;
- desktop logged `[aive] started core on port 48713`;
- harness marker `READY_SMOKE=PASS port=48713 corePid=98564`;
- `/health` returned `200`;
- app remained alive through readiness proof;
- cleanup completed with `READY_SMOKE_CORE_EXIT=PASS`.

This directly closes the failure mode recorded in `TVE-REL-009-PACKAGED-CORE-READY-FAIL.md`.

## Release-Forward
Canonical release line is advanced from `1.1.2` to `1.1.3` across:
- root package manifest;
- core manifest;
- MCP manifest;
- skill-installer manifest;
- desktop manifest;
- only the corresponding workspace-version fields in `package-lock.json`.

Already-published `v1.1.2` is not modified.

## Local Verification
PASS:
- `node --check apps/desktop/electron/core-launcher.cjs`;
- `node --check scripts/release/smoke-core-launcher-ready-fallback.cjs`;
- `node scripts/release/smoke-core-launcher-ready-fallback.cjs` -> `REL009_CORE_READY_FALLBACK_SMOKE=PASS`;
- CI YAML parse -> `CI_YAML_PARSE=PASS`;
- canonical manifest/lock versions all `1.1.3`;
- release validator tag simulation -> `REL005_RELEASE_VALIDATION_PASS version=1.1.3 tag=v1.1.3 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`;
- root `npm run typecheck` PASS / exit 0;
- root `npm run build` PASS / exit 0;
- `git diff --check` PASS before build/review.

## Exit Gate
**Not yet PASS for REL-009.** Remaining work:
- scoped commit + personal-fork PR;
- CI/review/merge + merged-tree verification;
- guarded immutable `v1.1.3` publication and artifact/provenance verification;
- controlled lower-version fixture containing both updater-coordination and readiness fixes;
- owned-core updater E2E to public v1.1.3 with core-exit-before-NSIS proof, complete installed module tree, `electron-updater`, fork feed/cache identity, `NotSigned`, encrypted-license revalidation and unchanged project/user-state hashes;
- shared-core runtime path must defer install without mutation.

## Loopback
Any further failure loops only inside REL-009 packaged startup/updater runtime behavior. Never rerun REL-001..008 and never mutate prior published releases in place.
