# TVE-REL-009 — Updater Identity Repair

Status: **LOCAL PASS / COMMIT + PR PENDING**
Date: 2026-10-12
Branch: `chatgpt/phase7-commercial-release`
Baseline checkpoint: `34dd22f3238f45367e7cbb1584a25046cebeaf5f`
Dependency retained: `TVE-REL-008=PASS`

## Input
- REL-009 preflight evidence: `docs/evidence/release/TVE-REL-009-UPDATER-IDENTITY-PREFLIGHT.md`.
- Published immutable historical release `v1.1.0` on personal fork.
- Retained installed old fork build `.tmp/rel006-installed4` / version `1.0.6`.
- Exact collision: fork and upstream desktop package name `synthcut-by-relo`, yielding `updaterCacheDirName: synthcut-by-relo-updater`.

## Entry Gate
PASS. REL-008 is published/verified and updater E2E had not started after the collision was detected. Repair is bounded to updater identity plus directly dependent live release metadata/version selectors.

## Work
- Changed private desktop package identity to `tang-ai-video-editor`.
- Advanced release-forward version from shipped `1.1.0` to `1.1.1` across the five release manifests and package lock metadata.
- Replaced live desktop workspace selectors with path selector `--workspace apps/desktop` in root scripts and release workflow.
- Updated package-lock workspace link from `node_modules/synthcut-by-relo` to `node_modules/tang-ai-video-editor`.
- Hardened `scripts/release/validate-release.mjs` to require the fork-owned desktop package name, path-based workspace selectors, lockfile identity/version consistency, absence of the old desktop workspace link, and the new workspace link.
- Updated current release/operator documentation; historical evidence is retained unchanged.

## Existing package evidence recovered after stream interruption
No package rerun was required. Project-local outputs already existed:
- `apps/desktop/build/rel009-identity-smoke`
- `apps/desktop/build/rel009-identity-dist`

Full dist contents include:
- `Tang-AI-Video-Editor-1.1.1.exe` — 397,652,177 bytes
- `Tang-AI-Video-Editor-1.1.1.zip` — 505,858,966 bytes
- `.exe.blockmap`
- `latest.yml`
- `SHA256SUMS.txt`

Generated packaged identity:
- package name: `tang-ai-video-editor`
- package version: `1.1.1`
- `app-update.yml` provider: `github`
- owner: `nguyenkhactang922-bot`
- repo: `SynthCut`
- updater cache: `tang-ai-video-editor-updater`

## Verification
Recovered-artifact verification PASS:
- EXE SHA-256 `bf9e9b03ac8d2745e7b3d7a5c58c8ad24c70af50e7f53434c8f52650c74ac218`
- ZIP SHA-256 `dd5081f1ec4c0e415d99b464e0990136f93f36c90c1e76bff75e6f445b06d3e0`
- both exactly match `SHA256SUMS.txt`
- `latest.yml` reports version `1.1.1`, EXE path `Tang-AI-Video-Editor-1.1.1.exe`, size `397652177`
- installer Authenticode: `NotSigned`
- packaged app Authenticode: `NotSigned`
- all five package manifests: `1.1.1`
- live-selector scan finds `synthcut-by-relo` only inside negative validator assertions; no live workflow/root/package selector remains
- `git diff --check`: PASS

Targeted current-source verification PASS / exit 0:
- tag simulation: `REL005_RELEASE_VALIDATION_PASS version=1.1.1 tag=v1.1.1 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`
- root `npm run typecheck`: PASS
- root `npm run build`: PASS
- renderer production build: PASS

## Output
A locally verified `1.1.1` release-forward candidate with fork-owned updater cache identity and personal-fork update feed.

## Exit Gate
**LOCAL PASS.** The updater identity defect found by REL-009 preflight is repaired in source and recovered package evidence. This repair is not yet MAIN VERIFIED and `v1.1.1` is not published yet. Commit/PR/CI/review/merge and normal tag/release side-effect guards remain required.

## Artifact
`docs/evidence/release/TVE-REL-009-UPDATER-IDENTITY-REPAIR.md`

## Evidence
Source diff, existing `rel009-identity-*` package outputs, generated `app-update.yml`, hashes, Authenticode observations, release validator, root typecheck/build and `git diff --check`.

## Owner/Authority
ChatGPT Web/FileMCP-E may execute the bounded repair and verification. Publication remains authorized only to `nguyenkhactang922-bot/SynthCut` under existing release guards. Upstream remains read-only.

## Risks / Open Questions
- The retained installed `1.0.6` binary necessarily contains its historical old cache name until it updates. REL-009 runtime must prove the controlled transition uses only the personal fork feed and that the relaunched `1.1.1` build uses `tang-ai-video-editor-updater` with no upstream access/collision in the tested environment.
- Published `v1.1.0` is immutable historical evidence and must not be moved or overwritten.

## Loopback
If PR/CI fails, repair only the failing stage of this identity patch. If `v1.1.1` release fails, retain all preceding PASS evidence and repair only that release stage. If updater E2E later shows feed/cache/state/license defects, loop back only to the corresponding REL-002/005/007 contract; do not rerun REL-001..008 wholesale.
