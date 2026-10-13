# TVE-REL-009 — Packaged Core Child-Launch Probe

Status: **Initial probe INCONCLUSIVE; later bounded control established the launch discrepancy and a focused repair was verified**
Date: 2026-10-13
Task: `TVE-REL-009 — Installed updater E2E + stable verification`
Branch: `chatgpt/phase7-commercial-release`
HEAD at probe: `47dd8247ba9394999b5a3b4cc2259755ef673b7b`

## Input and entry gate
- Dependency-packaging substage already PASS: `REMOTION_DEPENDENCY_PACKAGING_SMOKE_PASS execa=5.1.1 siblings=7`; electron-builder afterPack output contains nested `@remotion/renderer/node_modules/execa@5.1.1`.
- Earlier PASS stages and immutable releases v1.1.0–v1.1.3 are retained and were not rerun or modified.
- Existing packaged desktop smoke4 had reached `[aive] started core on port 48725`; smoke5 timed out waiting for core; smoke6 produced no useful diagnostics. Their exact launch command was not yet recovered.

## Work performed
Ran only bounded diagnostics against the already-built disposable package at `.tmp/rel009-afterpack-test-output/win-unpacked`. No release/install/updater side effects were triggered.

1. Imported packaged `@remotion/renderer/dist/esm/index.mjs` directly under system Node: PASS.
2. Imported packaged `@aive/core/dist/engine.js` directly under system Node: PASS.
3. Imported packaged `@aive/core/dist/cli.js` in the same system-Node process after setting isolated data dir, dedicated port 48737, and the five bundled asset paths: emitted the JSON `ready` marker, logged FFmpeg version/listening, and wrote `server.json`. The probe terminated the process at its 12-second bound.
4. Spawned system Node as a child with full inherited PATH and bundled asset env: one run reached readiness on port 48738 and wrote `server.json`; an immediate repeat did not reach readiness during a 7-second observation. This is inconsistent and cannot be promoted to a stable PASS.
5. Spawned the packaged branded `Tang AI Video Editor.exe` as a child with full PATH, `ELECTRON_RUN_AS_NODE=1`, the packaged CLI path, and bundled asset paths: no stdout/stderr or `server.json` within the 7-second observation window.
6. Three `spawnSync` controls with a deliberately minimal PATH (system Node, branded executable, raw Electron executable) all timed out without output. Since the system-Node control was also affected, this setup is not valid evidence for an isolated product root cause.
7. Read the packaged executable fuse wire with `@electron/fuses`: RunAsNode and EnableNodeOptionsEnvironmentVariable are enabled in the packaged output. This alone does not prove the environment variable is honored by the child invocation.

## Result
- `@remotion/renderer` and the core engine module imports pass in direct controls.
- The core CLI can reach ready in an in-process Node control, but child-process behavior is inconsistent; the branded Electron child failed to reach ready in the observed run.
- Root cause remains UNKNOWN. Do not make a production fix based on this probe alone.
- No production source file was changed. Probe scripts and their outputs are disposable diagnostics under `.tmp/`.
- No updater transition, installation, commit, push, PR, tag, or release action occurred. No matching diagnostic process/listener remained after cleanup.

## Exit gate
**REL-009 remains FAIL** because packaged core readiness is not reproducibly proven. License revalidation, updater-feed acceptance, and shared-core defer-without-mutation remain NOT PASS.

## NEXT_EXACT_ACTION
Recover the exact launch command/environment from the passing `.tmp/rel009-afterpack-runtime-smoke4` run and compare it with smoke5/6 and `.tmp/rel009-v113-owned-e2e2.ps1`. Capture the actual app `process.execPath`, inherited PATH and effective `AIVE_*` values immediately before `ensureCore`, then reproduce one bounded launch with the same invocation shape. Only after a repeatable discrepancy is established may a source fix be chosen. Do not rerun dependency smoke/build, the updater transition, or earlier PASS stages.


## Root cause established and local repair proof — 2026-10-13

The direct-script invocation spawn(packagedAppExe, [cliPath]) did not enter the expected Node CLI path: the branded EXE child stayed alive without stdout/stderr or server.json. A control invoking the same branded EXE with -e and a dynamic import of the CLI file URL emitted readiness. The launcher was repaired to use this -e bootstrap for both Electron and system Node.

Evidence after the source patch:
- node --check apps/desktop/electron/core-launcher.cjs: PASS.
- node scripts/release/smoke-core-launcher-ready-fallback.cjs: REL009_CORE_READY_FALLBACK_SMOKE=PASS.
- node scripts/release/smoke-packaged-core-launcher.cjs .tmp/rel009-afterpack-test-output/win-unpacked: REL009_PACKAGED_CORE_LAUNCH_SMOKE=PASS pid=135540 port=64065; matching PID in server.json, /health=200.
- Disposable packaged desktop smoke with the patched launcher: server.json pid=146900 port=48743, /health=200, and [aive] started core on port 48743. The package copy was test-only modified; its main module was instrumented and its launcher replaced with the source launcher.
- Added the packaged-child smoke to the release workflow after packaging and to the release validator's required workflow tokens.

This does not yet establish a fresh-build PASS. The next step is a project-local disposable electron-builder --dir build, then run only the packaged-child smoke against that newly generated package. Updater E2E must remain blocked until that source-to-package check passes.
