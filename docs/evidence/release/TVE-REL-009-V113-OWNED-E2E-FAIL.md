# TVE-REL-009 — v1.1.3 Owned-Core Updater E2E Attempt Failure

Status: **FAIL — packaged lower app core did not become ready; updater transition did not begin**
Date: 2026-10-13
Task: `TVE-REL-009 — Installed updater E2E + stable verification`
Branch: `chatgpt/phase7-commercial-release`
Observed HEAD before evidence/state sync: `ae938c3`

## Input
- REL-001..008 remain PASS; published v1.1.0..v1.1.3 are immutable and were not republished or retagged.
- v1.1.3 public installer SHA-256: `82e603edb796d1251d99c6f537110ff2a19fb2b3c34a130dbe0438d3cb3d26f4`.
- Lower fixture install result: `.tmp/rel009-v113-lower-install-result.json`.

## Entry Gate
PASS. The retained 1.1.1 installer SHA-256 was verified as `0474e36d6a3d563b151e7015d7b1ebaf881c6cf8767e3b929306d9fe7721315e`; install exit code 0; installed version `1.1.1.0`; 224 top-level production modules; `electron-updater` present; personal-fork feed and cache identity verified. The readiness launcher copied into the test install exactly matches `apps/desktop/electron/core-launcher.cjs` SHA-256 `c04888b151a34e2659a422b2874c919d66835802dffa06373c2757379720c94d`.

## Work
Created a separate project-local v1.1.3 harness `.tmp/rel009-v113-owned-e2e.ps1` from the retained owned-core harness, retargeting only the test run root/install root, public v1.1.3 installer name and expected hash. Started exactly one run on dedicated port 48712 with isolated userData/APPDATA/LOCALAPPDATA/TEMP/core data. Monitored that same run; no duplicate updater E2E was launched.

## Output
- Lower app process PID `142440` remained responsive but displayed an actual error dialog: `Could not start the editor core` / `Timed out waiting for editor core to start`.
- `.tmp/rel009-v113-owned-e2e/logs/lower-stderr.log` contains only `[aive] using bundled assets (...)`; no `[core] ... listening` line.
- `.tmp/rel009-v113-owned-e2e/core-data/server.json` was absent.
- No update-available marker, updater download, installer process, version transition, or result.json was produced.
- Independent packaged-CLI diagnostic using the system Node runtime did start the same packaged `@aive/core/dist/cli.js` on port 48715 and emitted `{"event":"ready"}`; diagnostic process was stopped afterward.
- A direct invocation of the installed Electron executable with the CLI path did not emit Node/CLI readiness output. This suggests a packaged Electron Node-mode/fuse or launch-mode discrepancy, but that is a hypothesis pending binary/fuse comparison.
- The failed test app process tree was cleaned up. No SynthCut E2E process remains active. No public release/tag/push side effect occurred.

## Exit Gate
**FAIL for the owned-core runtime startup prerequisite.** The updater E2E cannot safely proceed until the packaged Electron child can launch the core and publish authoritative readiness. This failure does not invalidate the v1.1.3 release-forward PASS or any REL-001..008 checkpoint.

## Artifact
- `.tmp/rel009-v113-lower-install-result.json`
- `.tmp/rel009-v113-owned-e2e.ps1`
- `.tmp/rel009-v113-owned-e2e/logs/lower-stderr.log`
- `.tmp/rel009-v113-owned-e2e/logs/lower-stdout.log`
- `.tmp/rel009-v113-owned-e2e/userData/`
- This evidence file.

## Evidence
- Lower-install result JSON reports `status=PASS`, installer exit 0, 224 modules, updater present, and launcher hash parity true.
- Runtime window text was collected via UI Automation and contained the exact core-start timeout.
- Core data directory had no `server.json`; dedicated port 48712 had no listener.
- Node-runtime control emitted core listening/ready on port 48715.
- Relevant accepted prior evidence remains `TVE-REL-009-PACKAGED-CORE-READY-REPAIR.md` and `TVE-REL-009-V113-RELEASE-FORWARD.md`.

## Owner / Authority
The existing frozen release scope and owner-approved unsigned lane remain unchanged. No release publication or architecture override was performed.

## Risks / Open Questions
Why does the new controlled 1.1.1 package fail to start its core through the packaged Electron executable while the system Node runtime starts the same core CLI? Verify Electron binary identity/version and the effective `ELECTRON_RUN_AS_NODE`/RunAsNode fuse behavior; compare the earlier accepted runtime-smoke binary and invocation. Do not assume the hypothesis is proven.

## Loopback
Stay inside REL-009. Diagnose the Electron-to-Node child-launch discrepancy with a bounded diagnostic, repair only the demonstrated cause, add/execute focused packaged-launch proof, then retry only the owned-core updater transition in a fresh test root. Do not rerun REL-001..008, the v1.1.3 release workflow, or any already-PASSed deterministic smoke. After owned-core proof passes, run the separate shared-core defer-without-mutation proof.

## Follow-up diagnostics — 2026-10-13

- Electron Fuses read on the lower installed EXE with @electron/fuses 1.8.0: RunAsNode Enabled; EnableNodeOptionsEnvironmentVariable Enabled.
- Node child_process spawnSync of the exact installed Electron EXE with ELECTRON_RUN_AS_NODE=1 and the packaged core CLI emitted ready JSON and wrote server.json on port 48716; the diagnostic child was terminated afterward.
- The installed core-launcher.cjs invoked under system Node with the packaged Electron EXE as its child passed readiness and /health on port 48717; child PID matched server.json PID. The same test passed with all five bundled asset environment paths set, on port 48719. Diagnostic children were cleaned up.
- Bundled ffmpeg.exe and ffprobe.exe both returned their version banners when invoked directly.
- Therefore the core CLI, Electron RunAsNode fuse, and bundled FFmpeg paths each pass isolated controls. The original full desktop launch failure remains real, but its root cause has not been proven. A later test-only main/launcher instrumentation launch produced no logs and no server.json, so that run is inconclusive and is not treated as PASS evidence.
- Updated next action: instrument the actual desktop main at module load and immediately before ensureCore; capture effective process.execPath, AIVE_DATA_DIR, AIVE_PORT, and whether applyBundledAssetEnv completes; compare actual main-process startup/environment with the passing Node-driven launcher control. Do not rerun updater E2E until this discrepancy is explained.