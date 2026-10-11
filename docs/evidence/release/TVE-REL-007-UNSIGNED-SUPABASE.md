# TVE-REL-007 — Unsigned Commercial + Supabase Entitlement Evidence

Status: **PASS — REL-007 unsigned commercial authorization + Supabase entitlement gate verified**
Date: 2026-10-11
Branch: `chatgpt/phase7-commercial-release`
Baseline before this amendment: `1b28fd47c8354e9061e502eb0af350edc2ae4b80`
Dependency retained: `TVE-REL-006=PASS`

## Input
- Explicit product-owner approval on 2026-10-11 for: `Unsigned commercial release + Supabase licensing -> accept SmartScreen -> GitHub Release -> updater E2E -> commercial`.
- `REMOTION_LICENSE_GATE=PASS`.
- `SUPABASE_LICENSE_BACKEND=PASS` with durable backend evidence in `TVE-SUPABASE-LICENSE-BACKEND.md`.
- Previously prepared trusted-signing integration retained only as optional future hardening.

## Entry Gate
PASS for a bounded DEFINE/ADR/PLAN loopback and REL-007 entitlement implementation. Prior REL-001..006 and Remotion evidence remain valid and are not rerun.

## Owner Risk Acceptance
The owner explicitly accepts the current Windows distribution being unsigned. Release evidence and GitHub release notes must state:
- installer/application are intentionally `NotSigned`;
- Windows may display `Unknown publisher`;
- Microsoft Defender SmartScreen may warn or add friction;
- Supabase licensing controls entitlement only and does not provide Authenticode publisher identity or SmartScreen reputation.

Current GitHub repository variables are intended to be:
- `REMOTION_COMMERCIAL_BASIS_APPROVED=true`
- `SUPABASE_LICENSE_BACKEND_APPROVED=true`
- `UNSIGNED_COMMERCIAL_RELEASE_APPROVED=true`
- `WINDOWS_SIGNING_APPROVED=false`
- `WINDOWS_SIGNING_PROVIDER=deferred`

## Governance Amendment
Updated:
- `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- `docs/plan/PHASE7_RELEASE_PLAN_V1.md`

Current lane completion label is `COMMERCIAL_READY_UNSIGNED=true`; `COMMERCIAL_READY_SIGNED=true` is reserved for a future trusted-signing lane.

## Desktop Entitlement Integration
Added `apps/desktop/electron/license.cjs`:
- hard-coded HTTPS authority endpoint only: `tve-license-authority`;
- stable per-install `deviceId` generated with `crypto.randomUUID()`;
- customer key normalized in-memory and sent from Electron main to the authority;
- customer key persisted only via Electron `safeStorage` encrypted bytes under the app user-data directory;
- no Supabase secret/service-role key exists in renderer or repository client code;
- online startup validation is fail-closed (`LICENSE_REQUIRED`, network errors/timeouts, inactive/expired/device-limit responses remain locked);
- forgetting the local key preserves the device ID, avoiding accidental consumption of a new device slot on the same install.

IPC/preload:
- `license:status`
- `license:activate`
- `license:forget`

Renderer:
- `LicenseGate` blocks mounting/connecting the editor until a valid entitlement response is returned;
- plain-browser developer rendering bypasses the commercial gate only when the Electron bridge is absent; packaged Electron does not use this bypass.

## Security Boundary
This is an entitlement/business-control gate, not an anti-tamper or DRM guarantee. The application is locally installed software derived from a GPL codebase; a technically capable recipient with source rights may modify local enforcement. The official distributed build nevertheless requires a valid hosted entitlement before its editor UI connects to the local core. No evidence may claim the Supabase gate is unbypassable.

## Release Workflow Amendment
`.github/workflows/release.yml` now supports the explicitly approved unsigned lane:
- release tag requires Remotion approval + Supabase backend approval + unsigned-release approval;
- when `WINDOWS_SIGNING_APPROVED != true`, tag packaging uses the normal unsigned `dist` path;
- installer + packaged app must both verify Authenticode status exactly `NotSigned`;
- workflow emits `UNSIGNED_WINDOWS_RELEASE_GATE=PASS`;
- artifacts include `UNSIGNED_RELEASE_NOTICE.txt`;
- GitHub release notes explicitly warn about Unknown publisher / SmartScreen and distinguish Supabase entitlement from Authenticode;
- old SSL.com/eSigner implementation is retained but runs only if the optional signed lane is explicitly re-enabled later.

## Verification Completed So Far
PASS / exit 0:
- `node --check apps/desktop/electron/license.cjs`
- `node --check apps/desktop/electron/main.cjs`
- `node --check apps/desktop/electron/preload.cjs`
- `npm --workspace apps/desktop run typecheck`
- `npm --workspace apps/desktop run build:renderer`
- `node scripts/release/validate-release.mjs`
- YAML parse of `.github/workflows/release.yml`
- `git diff --check`

GitHub variable readback PASS with `UNSIGNED_COMMERCIAL_RELEASE_APPROVED=true` while `WINDOWS_SIGNING_APPROVED=false` and `WINDOWS_SIGNING_PROVIDER=deferred`.

A source Electron DEV runtime attempt was deliberately stopped after it never reached renderer creation because the process remained before `createWindow` in the existing core-startup path. No license conclusion is drawn from that dev-harness limitation. A packaged candidate verification is the required runtime proof instead.

## Final REL-007 Verification
All REL-007 exit conditions are now evidenced:
- current-source packaged entitlement runtime PASS;
- encrypted key persistence + restart revalidation PASS without consuming a second device slot;
- exact test device cleanup PASS; founder/admin key returned to `activeDevices=0`;
- full `1.1.0` NSIS + ZIP build PASS / exit 0;
- packaged license main/preload/renderer gate present;
- installer and packaged application Authenticode status both exactly `NotSigned`;
- `SHA256SUMS.txt` matches the independently recomputed SHA-256 values;
- release validator reports `tag=v1.1.0` and current workflow variables preserve the unsigned lane.

Final 1.1.0 artifact proof:
- installer: `Tang-AI-Video-Editor-1.1.0.exe` — 397,651,986 bytes — SHA-256 `867fb75aceecab263ad0a5b3914f55ce71772dfa6aa923749b689dc1ecad6451`;
- ZIP: `Tang-AI-Video-Editor-1.1.0.zip` — 505,858,328 bytes — SHA-256 `2ff621e45d4c7d78211282beec983fecc66ea6f2f635f074aa8ece53d2d004f2`;
- blockmap + `latest.yml` + `SHA256SUMS.txt` present;
- `latest.yml` version/path/size reports `1.1.0` / `Tang-AI-Video-Editor-1.1.0.exe` / `397651986`;
- packaged app product version reports `1.1.0.0`.

## Exit Gate
**PASS.** `TVE-REL-007=PASS` for the owner-approved unsigned commercial lane. REL-008 is now eligible subject to reviewed release commit, collision/auth checks, and the normal side-effect guard. No public release side effect occurred during REL-007.

## Packaged Entitlement Runtime Proof
Targeted current-source `electron-builder --dir` candidate completed PASS / exit 0 before the version-only 1.1.0 bump.

Static packaged proof:
- `resources/app/electron/license.cjs` present;
- `resources/app/electron/preload.cjs` present;
- packaged renderer contains `Commercial license verification` and `Activate license` markers;
- packaged application Authenticode status observed `NotSigned`.

Runtime proof used project-local Chromium user data at `.tmp/rel007-packaged-license-user2` and the already-running packaged core at port 4789. The second packaged instance attached to that existing core rather than duplicating/restarting it.

Activation through the real packaged renderer/preload/main IPC bridge returned:
- `ok=true`
- `code=VALID`
- `plan=commercial`
- `maxDevices=3`
- `activeDevices=1`
- `stored=true`

Local persistence proof:
- state path was under `E:\SynthCut\.tmp\rel007-packaged-license-user2\license.json`;
- stable device ID length 36;
- encrypted key field present;
- exact plaintext founder license string absent from the persisted file.

Restart proof:
- stopped the attached packaged UI instance without restarting/killing the already-running core;
- relaunched a packaged instance using the same project-local user-data directory;
- instance attached to the same existing core on port 4789;
- `window.aive.licenseStatus()` returned `VALID`, `stored=true`, `activeDevices=1`.

This proves restart validation did not consume a second device slot.

The exact test device hash was then deleted from `tve_license_events` and `tve_license_devices`; post-cleanup readback for founder key prefix `TAIVE-F3E3Y` returned `active_devices=0`, `max_devices=3`, `status=active`, no expiry.

The first packaged instance used to own the shared core was subsequently stopped after the attached-instance persistence proof completed. No project runtime was intentionally left running.

## Version Line
After the packaged entitlement runtime proof, all five release manifests and the root/workspace lock metadata were advanced from 1.0.6 to the frozen first-commercial target `1.1.0` using npm's workspace-aware version command with `--no-git-tag-version`. Release validator PASS reports `tag=v1.1.0`. The full 1.1.0 NSIS/ZIP build subsequently completed PASS and its hashes/signature state are recorded above.
