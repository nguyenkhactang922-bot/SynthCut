# TVE-REL-009-OPT-LOAD-001 — Lazy-load optional Remotion provider

Date: 2026-10-31 (+07)
Project root: `E:\SynthCut`
Branch at execution: `chatgpt/rel009-v114-release`
Baseline HEAD: `6e5269abf76857466e835b3b5a723dfdc5e8d61b`
Parent task: `TVE-REL-009`

## Classification

**OPT-LOAD-001 implementation and local runtime acceptance: PASS. PR / merged-main acceptance: PENDING. TVE-REL-009 overall remains FAIL / BLOCKED.**

This task closes one demonstrated startup-cost issue only. It does not prove the historical E2E6 Registry writer, installed updater transition, same-device license/feed revalidation, project/marker preservation across updater transition, or shared-core defer-without-mutation.

## Frozen-design alignment and diagnosis

Frozen design `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md §16.1` requires that the baseline editor does not depend on motion graphics to function.

Before the repair:
- `packages/core/src/engine.ts` statically imported `./motion/render.js`.
- `packages/core/src/motion/render.ts` statically imported `@remotion/bundler` and `@remotion/renderer`.
- Those dependencies were therefore part of the normal core startup import graph, even when no motion graphic was requested.
- A bounded Electron Node 24.16.0 import probe measured the motion renderer module graph at approximately 12.16 seconds on the observed run. Other engine modules also contributed startup time. A cold/cache-state disposable fixture run exceeded the existing 20,000 ms core readiness timeout.
- A warm-cache disposable fixture run did reach readiness, demonstrating that the failure was timing/cache-state sensitive; it was not sufficient cold-start acceptance.

## Implementation

Only the call site in `packages/core/src/engine.ts` was changed:
- Removed the eager top-level `renderGraphic` import.
- Added `await import("./motion/render.js")` inside `addGraphicRun`, immediately before the existing graphic render invocation.

The Remotion implementation, public graphics API, alpha/render settings, dependency versions, lockfile, product version, updater behavior, and release tags were not changed.

A new focused regression was added:
- `packages/core/scripts/smoke-optional-motion-lazy-load.cjs`
- It imports the built core entry in a fresh Node process using an ESM resolution loader.
- It checks the compiled engine keeps an on-demand dynamic import and has no static import of the motion renderer.
- It inspects the resolved module graph and fails if `./motion/render.js`, `remotion`, or `@remotion/*` is eagerly resolved.
- It is wired into both `.github/workflows/ci.yml` and `.github/workflows/release.yml`; the release validator checks the test contract and workflow wiring.

The packaged-core release smoke was tightened from 30,000 ms to the production 20,000 ms readiness budget. It records actual startup milliseconds and verifies the spawned child's PID matches `server.json`, followed by `/health=200`.

## Verification evidence

### Typecheck and build

- Root `npm run typecheck`: PASS / exit 0 (core, MCP, and desktop).
- Root `npm run build`: PASS / exit 0 (core, MCP, Vite renderer).
- npm was invoked directly through the installed Node npm CLI because the initial FileMCP `npm.cmd` resolution selected a missing project-local npm shim. No dependency reinstall or package-manager mutation was performed.

### Optional provider lazy-load regression

Command:
`node packages/core/scripts/smoke-optional-motion-lazy-load.cjs`

Result:
`CORE_OPTIONAL_MOTION_LAZY_LOAD_SMOKE=PASS resolutions=550 eagerRemotionImports=0`

The built core entry and engine/server exports loaded successfully; no Remotion provider import was resolved during ordinary core startup.

### Real motion-graphics render regression

Command:
`npx tsx packages/core/scripts/smoke-motion.ts`

The first attempt stopped before rendering because this process environment did not expose `ffmpeg` on PATH. It was rerun with process-local `AIVE_FFMPEG` and `AIVE_FFPROBE` pointing to the already-staged Windows bundle under `apps/desktop/build/resources/aive/ffmpeg`; no system PATH change or software installation was made.

Result: `MOTION GRAPHICS SMOKE TEST PASSED`.

- Remotion imported on explicit graphic request and downloaded Chrome Headless Shell (first-run cache operation).
- Rendered a 2.00-second alpha title graphic at 1280×720 and composited a 4.00-second export.
- Peak luma: before graphic = 35; during graphic = 255; after graphic = 35.
- After `clearGraphics`, peak luma during the former graphic window = 35.
- This verifies that the deferred import still reaches the existing Remotion renderer and preserves the tested overlay/clear behavior.

### Fresh disposable Windows package and packaged child startup

Fresh package output:
`.tmp/rel009-afterpack-lazyload-output-v2/win-unpacked`

The custom disposable electron-builder configuration used the existing `apps/desktop/build/after-pack.cjs` by absolute path. The captured builder log contains:
`REMOTION_DEPENDENCY_PACKAGING_PASS execa=5.1.1`.

Independent package readback:
- Packaged `engine.js` contains `import("./motion/render.js")` and does not contain the corresponding static import.
- Packaged Remotion renderer dependency closure contains nested `execa@5.1.1`.
- The package version remains 1.1.4; no installer, tag, release or updater action was run.

The packaged branded Electron executable was launched as a fresh core child three times using `scripts/release/smoke-packaged-core-launcher.cjs`, now configured with the production 20,000 ms timeout.

| Attempt | Child PID | Port | Startup |
|---|---:|---:|---:|
| 1 | 32076 | 54183 | 414 ms |
| 2 | 6328 | 54186 | 421 ms |
| 3 | 32092 | 54192 | 440 ms |

All three emitted `REL009_PACKAGED_CORE_LAUNCH_SMOKE=PASS`, had a matching-PID `server.json`, and returned `/health=200`. Each owned child was terminated by the smoke cleanup. No warming of the Remotion module graph was performed before these separate child processes.

### Safety / non-regression

Final read-only checks:
- Real installed app remains ProductVersion `1.1.4.0`.
- Installed EXE SHA-256 remains `936bedb1baa3642d6f4ef26066e45782c6d91e13aadf5fe5016abbf6fe37bb0c`.
- App-GUID Registry `InstallLocation` remains `C:\Users\Admin\AppData\Local\Programs\tang-ai-video-editor`.
- Disposable fixture `main.cjs` SHA-256 remains `2169273672ecc1418fc9f61de0933bc000789de31edf3f4de410da287585a814`.
- Disposable fixture `core-launcher.cjs` SHA-256 remains `d63b42c4487d6ac9c0e60b2d50a01321a12dd3ddcf67f0d6debef7046fe8f316`.
- No SynthCut fixture or real-install process remained; tested ports had zero listeners.
- WPR reports `WPR is not recording`.
- `git diff --check`: PASS.

## Release and lifecycle gates

- Published v1.1.4 is immutable. Local release validation correctly refuses to prepare another release while tag `v1.1.4` exists at the current package version. No version bump, retag, rebuild of published output, or release publication was attempted.
- `TVE-REL-009` remains FAIL / BLOCKED because the historical E2E6 Registry `InstallLocation` writer PID/image is still unproven. The v3 ETL only attributed its own deliberate harness override and does not close that historical question.
- Installed updater E2E, post-update same-device license/feed revalidation, project/marker integrity across update, and shared-core defer-without-mutation remain NOT PASS.
- `TVE-REL-010` remains BLOCKED by REL-009.

## Next exact action

Perform scoped diff review and task-scoped commit for OPT-LOAD-001, preserving all unrelated dirty/untracked files. Then open the PR against the personal fork's `main`, wait for latest-head CI/review, merge only after checks pass, and verify merged `personal/main`. Do not run E2E6, updater, installer, version bump, or release publication until the historical Registry-writer attribution/isolation gate is separately satisfied and the owner approves the next release-forward step.
