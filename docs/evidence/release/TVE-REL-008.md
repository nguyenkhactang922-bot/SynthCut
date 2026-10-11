# TVE-REL-008 — GitHub Release Publication

Status: **PASS / VERIFIED**
Date: 2026-10-11
Target repository: `nguyenkhactang922-bot/SynthCut`
Published release: `v1.1.0`
Reviewed release source: `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`
GitHub Actions run: `38137052906`

## Input
- `TVE-REL-001..007=PASS` retained.
- PR #8 reviewed source merged to personal `main@ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb` with merge-tree parity PASS.
- Existing `v1.1.0` tag was a known corrective side effect from prior failed runs; GitHub Release was absent before the final guarded move.

## Entry Gate
PASS. Immediately before the final tag move:
- GitHub auth/write authority: PASS;
- GitHub Release `v1.1.0`: ABSENT / API 404;
- personal `main`: `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`;
- prior tag peel: `f9ea9ab3278c2158593508feec21fbf92f7e1ce7`;
- no active Release run existed.

## Work
- Guarded-moved the existing annotated `v1.1.0` tag once to reviewed personal `main@ce31bfdd`.
- Monitored only the newly triggered GitHub Actions Release run `38137052906`.
- Verified the published Release, release metadata, bundle provenance, update metadata, asset set and hashes.
- Downloaded the public EXE and ZIP into the project-local verification directory `.tmp/rel008-public-download` and independently recomputed SHA-256.

## Output
GitHub Release `v1.1.0` is published on the authorized personal fork only.

Release run `38137052906` completed `SUCCESS`:
- `windows` job: SUCCESS;
- `publish-release` job: SUCCESS;
- release publication step: SUCCESS.

## Exit Gate
**PASS.** All REL-008 exit conditions are evidenced:
- Release is visible and non-draft/non-prerelease;
- remote `v1.1.0^{}` peels to `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`;
- personal `main` is the same SHA;
- `BUNDLE_MANIFEST.json.sourceCommit=ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`;
- `BUNDLE_MANIFEST.json.sourceTrackedDirty=false`;
- `RELEASE_METADATA.json.status=PASS`, version `1.1.0`, tag `v1.1.0`, repository `nguyenkhactang922-bot/SynthCut`, sourceCommit `ce31bfdd...`;
- `latest.yml` version/path/size = `1.1.0` / `Tang-AI-Video-Editor-1.1.0.exe` / `397652429`;
- published asset set contains EXE, ZIP, blockmap, `latest.yml`, `SHA256SUMS.txt`, bundle/release metadata, GPL/source/license notices, and unsigned-release notice;
- public download EXE size `397652429`, SHA-256 `6c7c0691505413c3c793d231e570f3ab8cd96a2691eeadcf2ae25b4088c04da5`;
- public download ZIP size `505859296`, SHA-256 `ace00154ce63479a93d3838c382e57ad449373888afdaf0d0e9200a5d25891fa`;
- both independently downloaded SHA-256 values exactly match `SHA256SUMS.txt` and GitHub asset digests;
- release workflow/release URL are under `nguyenkhactang922-bot/SynthCut`; upstream `origin` remains `Relo-video/SynthCut` and was not a publication target.

## Artifact
- GitHub Release: `https://github.com/nguyenkhactang922-bot/SynthCut/releases/tag/v1.1.0`
- GitHub Actions run: `https://github.com/nguyenkhactang922-bot/SynthCut/actions/runs/38137052906`
- Public-download verification copies: `.tmp/rel008-public-download/`
- This evidence record.

## Evidence
- Git refs: personal main + tag peel both `ce31bfdd...`.
- GitHub Release API release id `409639821`, published at `2026-10-11T11:59:06Z`.
- 11 release assets with GitHub-provided SHA-256 digests.
- Independent project-local public download and SHA-256 recomputation for EXE + ZIP.
- Release workflow run `38137052906` SUCCESS.

## Owner / Authority
ChatGPT Web + FileMCP-E under the user's authorized personal-fork write scope. No upstream publication authority was used.

## Risks / Open Questions
- This release is intentionally unsigned under the owner-approved REL-007 lane; Windows may show Unknown publisher / SmartScreen warnings.
- REL-009 updater E2E is a separate gate and may still discover updater-specific defects.

## Loopback
- Publication/artifact defect: REL-008, but shipped artifacts must not be silently overwritten; release forward with a higher version.
- Updater/feed/identity defect discovered by REL-009: loop back only to the affected REL-002/005 release configuration and release forward; retain this REL-008 publication proof as historical PASS evidence.
