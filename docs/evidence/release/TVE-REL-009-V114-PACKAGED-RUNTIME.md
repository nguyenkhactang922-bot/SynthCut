# TVE-REL-009 — v1.1.4 Fresh Package and Packaged Runtime Proof

Status: **PASS for fresh source-to-package and packaged core readiness; REL-009 remains ACTIVE**
Date: 2026-10-13
Branch: `chatgpt/phase7-commercial-release`
Source HEAD at verification: `47dd8247ba9394999b5a3b4cc2259755ef673b7b`
Candidate version: `1.1.4` (local candidate only; not tagged or published)

## Fresh package build

- Command: electron-builder `--win --dir --config E:\SynthCut\.tmp\rel009-afterpack-test-v2.config.cjs`
- Process PID: `144880`; start `2026-10-13T16:20:21+07:00`; exit marker `EXIT=0 AT=2026-10-13T16:23:37.0352739+07:00`.
- Logs: `.tmp/rel009-afterpack-build-v2.stdout.log`, `.tmp/rel009-afterpack-build-v2.stderr.log`.
- Output: `.tmp/rel009-afterpack-test-output-v2/win-unpacked`.
- Packaged `resources/app/package.json` version: `1.1.4`.
- afterPack result marker: `REMOTION_DEPENDENCY_PACKAGING_PASS execa=5.1.1`.
- Packaged nested `resources/app/node_modules/@remotion/renderer/node_modules/execa/package.json` version: `5.1.1`.
- Source and packaged `apps/desktop/electron/core-launcher.cjs` SHA-256 both: `D63B42C4487D6AC9C0E60B2D50A01321A12DD3DDCF67F0D6DEBEF7046FE8F316`.
- Packaged desktop EXE SHA-256 (unpacked test artifact only): `936BEDB1BAA3642D6F4EF26066E45782C6D91E13AADF5FE5016ABBF6FE37BB0C`.

## Focused runtime evidence

- `node scripts/release/smoke-remotion-dependency-packaging.cjs`: PASS — `REMOTION_DEPENDENCY_PACKAGING_SMOKE_PASS execa=5.1.1 siblings=7`.
- `node scripts/release/smoke-core-launcher-ready-fallback.cjs`: PASS — `REL009_CORE_READY_FALLBACK_SMOKE=PASS`.
- `node scripts/release/smoke-packaged-core-launcher.cjs .tmp/rel009-afterpack-test-output-v2/win-unpacked`: PASS — `REL009_PACKAGED_CORE_LAUNCH_SMOKE=PASS pid=148880 port=62740`; authoritative `server.json` PID matched child PID and `/health` returned 200.
- Fresh packaged desktop launch: app PID `141244`, owned core PID `146976`, `server.json` port `48749`, `/health=200`; log contains `[aive] started core on port 48749`. The app and core were confirmed stopped after cleanup. Logs: `.tmp/rel009-v114-packaged-desktop-runtime/logs/stdout.log` and `stderr.log`; marker: `REL009_PACKAGED_DESKTOP_RUNTIME_PASS`.
- `node scripts/release/validate-release.mjs`: PASS — `REL005_RELEASE_VALIDATION_PASS version=1.1.4 tag=v1.1.4 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`.
- `node --check apps/desktop/electron/core-launcher.cjs`: PASS.
- `git diff --check`: previously returned exit 0; rerun before commit.

## Scope and safety

- This proves the new local candidate's fresh package contains the source launcher and locked renderer dependency closure, and the packaged desktop can start its owned core and reach health.
- It does **not** prove the installed updater transition, post-update encrypted-license revalidation, updater-feed/cache acceptance, or shared-core defer-without-mutation. Do not mark REL-009 DONE.
- Published `v1.1.0`–`v1.1.3` remain immutable. No tag, release, install/updater transition, commit, push, PR, merge, or deployment was performed in this checkpoint.
- Disposable build output remains under `.tmp/`; it is not the distributable NSIS/ZIP release artifact.

## Next exact action

Review the scoped production diff, repository release gates, existing Git/remote state, and v1.1.4 tag/release absence. Commit only the REL-009 source, focused smoke, release workflow/validator, version manifests/lock, evidence, and required state files. Follow the repository PR/CI/review/merge gates before creating a new immutable v1.1.4 release. Only after the new release artifact is verified should the remaining owned-core updater E2E and separate shared-core defer proof run; do not repeat the prior transition against v1.1.3.
