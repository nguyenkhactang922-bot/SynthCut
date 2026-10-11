# TVE-REL-005 — Release workflow + version metadata hardening

Status: PASS / VERIFIED
Date: 2026-10-09
Branch: `chatgpt/phase7-commercial-release`
Baseline task HEAD: `20c8ff9`
Prior product baseline retained: `personal/main@af92f20` MAIN VERIFIED

## Input
- Fork identity/updater baseline from REL-002.
- Provenance/source compliance from REL-003.
- Packaging-tool security baseline from REL-004 committed at `20c8ff9`.
- Existing `.github/workflows/release.yml` and `docs/RELEASING.md`.
- Five release-version package manifests and current personal-fork tag/release state.

## Entry Gate
PASS:
- REL-002..004 are PASS; REL-004 is committed at `20c8ff9`.
- Personal fork remote is `nguyenkhactang922-bot/SynthCut`.
- Existing highest personal-fork tag is `v1.0.5`.
- Personal fork has no existing GitHub Release and no `v1.0.6` remote tag.
- No tag/push/release/npm-publication side effect was authorized for REL-005.

## Work
1. Selected the next patch release version `1.0.6`, strictly greater than existing `v1.0.5`.
2. Aligned all five release manifests to `1.0.6` without creating a Git tag:
   - root `package.json`;
   - `packages/core/package.json`;
   - `packages/mcp/package.json`;
   - `packages/skill-installer/package.json`;
   - `apps/desktop/package.json`.
3. Updated `package-lock.json` to the same workspace/root versions.
4. Kept the historical `@relo-video/synthcut` workspace name for source compatibility but made it `private: true` and removed `publishConfig`, preventing publication under the upstream npm namespace.
5. Added `scripts/release/validate-release.mjs` to fail closed on:
   - version drift;
   - wrong product/app id;
   - updater/publish provider outside the personal fork;
   - upstream npm-publication guard loss;
   - wrong repository/tag identity;
   - reused release tag on non-tag preparation;
   - dirty tracked source when `--require-clean` is requested;
   - required workflow safety tokens disappearing.
6. Added `scripts/release/validate-artifacts.mjs` to verify the complete update/integrity/compliance artifact set, release/bundle source-commit convergence, clean source marker, release gates, and SHA256SUMS coverage.
7. Hardened `.github/workflows/release.yml` into two permission-separated jobs:
   - Windows build job: `contents: read`, never publishes;
   - publication job: `contents: write`, runs only for a `v*` tag on `nguyenkhactang922-bot/SynthCut` after both commercial variables are true.
8. Pinned CI FFmpeg installation to Chocolatey `6.1.1`; REL-003's exact version/SHA-256 staging gate remains the authoritative byte check.
9. Required complete release artifacts before upload: installer, blockmap, `latest.yml`, ZIP, checksums, bundle manifest, GPL/license/source-offer documents and release metadata.
10. Added trusted installer signature verification before any commercially enabled tag can publish.
11. Rewrote `docs/RELEASING.md` for the personal fork and removed the old upstream-npm publication instruction from `README.md`.
12. Added root commands `release:validate` and `release:validate-artifacts`.

## Output
A deterministic, fork-only release workflow/configuration for `v1.0.6` where:
- manual workflow runs are non-publishing;
- publication permissions exist only in the tag publication job;
- public publication remains fail-closed on REL-007 Remotion/signing gates;
- version/tag/repository/npm-namespace drift is automatically rejected;
- all update/integrity/compliance artifacts are validated before they can be published.

## Exit Gate
PASS:
- manual/non-publishing workflow safety validated;
- tag publication path statically verified as personal-fork-only and commercial-gate-protected;
- all five package versions and package-lock workspace versions equal `1.0.6`;
- local and remote `v1.0.6` release tag does not exist;
- personal fork has no existing GitHub Release;
- upstream npm namespace publication is disabled;
- lockfile consistency dry-run PASS;
- workflow YAML parse PASS;
- positive and negative release-validator cases behave fail-closed;
- artifact-set validator positive and missing-`latest.yml` negative cases behave fail-closed;
- no tag, push, GitHub Release or npm package was created.

Full NSIS/ZIP generation and packaged-runtime acceptance are deliberately deferred to REL-006 and were not duplicated here.

## Artifact
Tracked:
- `.github/workflows/release.yml`
- `scripts/release/validate-release.mjs`
- `scripts/release/validate-artifacts.mjs`
- `docs/RELEASING.md`
- `README.md`
- five version manifests
- `package-lock.json`
- this evidence record
- synchronized project state/queue/handoff

Local test evidence:
- `.tmp/rel005-wrong-repo.log`
- `.tmp/rel005-artifact-fixture/`

## Evidence
### Remote side-effect preflight
Read-only checks found:
- local/personal highest existing tag: `v1.0.5`;
- personal remote tags: `v0.1.2`, `v0.1.3`, `v0.1.4`, `v1.0.5`;
- personal `v1.0.6`: absent;
- personal GitHub Releases: none;
- upstream GitHub Releases exist separately and were not modified.

### Version/lock validation
`npm version 1.0.6 --workspaces --include-workspace-root --no-git-tag-version` completed without creating a tag.
Reported versions:
- root: `1.0.6`;
- `@aive/core`: `1.0.6`;
- `@aive/mcp`: `1.0.6`;
- legacy `@relo-video/synthcut`: `1.0.6`;
- desktop: `1.0.6`.

`npm ci --dry-run --ignore-scripts`: PASS / exit `0`, proving manifest/lock consistency without materializing a new install.

### Release validator
`npm run release:validate`: PASS / exit `0`.
Marker:
`REL005_RELEASE_VALIDATION_PASS version=1.0.6 tag=v1.0.6 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`

Authorized tag simulation with:
- `GITHUB_REPOSITORY=nguyenkhactang922-bot/SynthCut`;
- `GITHUB_REF=refs/tags/v1.0.6`;
PASS.

Wrong-repository simulation using `Relo-video/SynthCut` was rejected with:
`RELEASE_VALIDATION_FAIL: workflow repository Relo-video/SynthCut is not authorized; expected nguyenkhactang922-bot/SynthCut`.
The wrapper returned nonzero because the tested command correctly failed; no release side effect occurred.

Wrong-tag simulation `v1.0.7` against manifest version `1.0.6`: expected rejection PASS, marker:
`REL005_WRONG_TAG_REJECTED=PASS`.

### Artifact-set validator
Synthetic project-local fixture containing one installer, blockmap, ZIP, latest.yml, matching SHA256SUMS, bundle manifest, license/notices/source offer and release metadata:
PASS / marker:
`REL005_ARTIFACT_VALIDATION_PASS files=10 installers=1 blockmaps=1 zips=1 version=1.0.6`.

After removing `latest.yml`, the validator correctly rejected the set; marker:
`REL005_MISSING_LATEST_REJECTED=PASS`.

The fixture proves validator logic only; it is not claimed as a real package. Real package acceptance remains REL-006.

### Workflow syntax / semantic verification
PyYAML parse: PASS / marker `REL005_WORKFLOW_YAML_PARSE=PASS`.

Independent semantic verification marker:
`REL005_SEMANTIC_VERIFY_PASS version=1.0.6 manualPermission=read publishPermission=write personalTagAbsent=true personalReleaseAbsent=true npmUpstreamPublishDisabled=true`

Verified semantics include:
- Windows/manual build section has `contents: read` and no `contents: write`;
- publication section has `contents: write`;
- only publication section contains `softprops/action-gh-release@v2`;
- publication requires personal fork identity plus both `REMOTION_COMMERCIAL_BASIS_APPROVED` and `WINDOWS_SIGNING_APPROVED` variables;
- build section uses pinned `choco install ffmpeg --version=6.1.1`;
- upload/download Actions artifact handoff is present;
- workflow contains no `npm publish` command;
- package-lock root and every workspace version is exactly `1.0.6`.

## Owner / Authority
ChatGPT Web owns release workflow/version verification judgment; FileMCP-E executed local Git/npm/workflow/validator checks. GitHub remote tags/releases were inspected read-only. REL-005 does not grant commercial license or code-signing authority.

## Risks / Open Questions
- GitHub Actions manual execution cannot be proven remotely until the hardened workflow exists on an accessible branch/default-branch context; local validators and static workflow proof close REL-005's non-publishing logic gate without pretending remote CI ran.
- Full NSIS/ZIP artifact generation is REL-006.
- `asar=false` remains a packaging-hardening observation carried from REL-004 and must be assessed during local packaged acceptance; it is not silently treated as resolved here.
- Remotion commercial/redistribution authorization and trusted Windows signing remain hard REL-007 blockers.
- The workflow cannot publish while those variables are absent/false; even if enabled later, trusted Authenticode verification must still pass.

## Loopback
- Version/tag/provider/workflow defect → REL-005.
- Real package artifact/runtime defect → REL-006 or the owning earlier REL/IMP task.
- Remotion/signing authorization failure → REL-007.
- GitHub publication/update failure after release → REL-008/009.
