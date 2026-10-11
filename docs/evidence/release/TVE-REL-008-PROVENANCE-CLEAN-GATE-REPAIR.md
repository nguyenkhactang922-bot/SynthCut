# TVE-REL-008 — Provenance clean-gate timing failure / narrow repair evidence

Status: **FAIL STAGE REPAIRED — PR #8 CI + MERGE + TREE PARITY PASS; guarded tag retry pending**
Date: 2026-10-11
Target repository: `nguyenkhactang922-bot/SynthCut`
Release tag: `v1.1.0`
Failed Release run: `38134667267`
Failed source: `f9ea9ab3278c2158593508feec21fbf92f7e1ce7`

## Classification
`TVE-REL-008` remains **FAIL**. `TVE-REL-001..007` remain PASS. PR #7 CI/merge/tree-parity, the guarded tag move to `f9ea9ab`, and all PASS stages in run `38134667267` remain retained.

## Side-effect state verified before repair
- Local feature HEAD: `ee10c86aa93ee35112da6dfe93356881e05f3a7c`.
- Personal feature branch remote: same `ee10c86`.
- PR #7: MERGED; automatic CI `build-and-smoke` PASS.
- Personal `main`: `f9ea9ab3278c2158593508feec21fbf92f7e1ce7`.
- Remote annotated `v1.1.0` peels to `f9ea9ab`.
- GitHub Release `v1.1.0`: absent (`GET /releases/tags/v1.1.0` returned 404).
- Release run `38134667267`: completed `failure`; `publish-release` skipped.

## Retained PASS stages from run 38134667267
The following completed successfully and must not be manually rerun as failed work:
- checkout;
- Node 22.12 setup;
- initial clean release identity/version/source validation;
- lockfile dependency install;
- core + MCP + renderer build;
- pinned FFmpeg 6.1.1 staging source installation;
- FFmpeg/Whisper/YuNet/font/provenance staging command execution;
- commercial release gates;
- intentionally unsigned Windows NSIS + ZIP packaging;
- `Restore known workspace-bin mutation before post-package clean gate`.

The post-package clean repair itself is proven effective by the same run: the restore step PASSed and the subsequent `validate-release.mjs --require-clean` emitted `REL005_RELEASE_VALIDATION_PASS ... cleanRequired=true`.

## Exact failed stage
Only `Assemble and validate release artifact set` failed.

The release validator inside that stage PASSed. The following artifact validation then failed with:

`RELEASE_ARTIFACT_VALIDATION_FAIL: release bundle manifest must come from a clean tracked source state`

`validate-artifacts.mjs` requires `BUNDLE_MANIFEST.json.sourceTrackedDirty === false`.

## Root cause
`apps/desktop/scripts/prepare-bundle.ts` records `sourceTrackedDirty` when the provenance manifest is generated. The known workspace-bin mutation can already exist after dependency/build setup, before `prepare:bundle` writes `bundle-manifest.json`.

The previous repair restored the known mutation only **after packaging**. That made the live Git worktree clean for the post-package validator, but it was too late to change the already-written provenance fact. Therefore the manifest correctly preserved `sourceTrackedDirty=true`, and artifact validation rejected it.

This is a provenance-timing defect, not a regression in packaging, commercial gates, or the post-package clean check.

## Narrow fail-closed repair
The workflow now brackets provenance/package processing with two clean gates using the same exact allowlist:

1. **Before provenance manifest generation**: `Restore known workspace-bin mutation before provenance manifest`.
   - allowed tracked dirty path: only `packages/skill-installer/bin/synthcut.mjs`;
   - more than one dirty tracked entry: FAIL;
   - any other dirty tracked path: FAIL;
   - restore only the known path from `HEAD`;
   - re-check zero tracked dirt;
   - emit `PRE_PROVENANCE_TRACKED_CLEAN_GATE=PASS`.
2. Run existing `Stage verified FFmpeg, Whisper, YuNet, font and provenance` so `sourceTrackedDirty` is sampled only after the tracked-clean gate.
3. Keep the existing **post-package** clean gate unchanged before artifact assembly to catch the known mutation if packaging recreates it.
4. Keep existing `validate-release --require-clean` and artifact provenance validator unchanged.

`scripts/release/validate-release.mjs` now also requires both clean-gate markers and verifies ordering:

`pre-provenance clean gate < provenance staging < post-package clean gate < artifact assembly`.

This does not ignore arbitrary tracked changes and does not rewrite provenance after the fact.

## Targeted verification
No full build/package/release pipeline was manually rerun locally.

A disposable Git repo under `.tmp/rel008-provenance-clean-smoke` produced:
- `REL008_PRE_PROVENANCE_CLEAN=PASS`;
- `REL008_MANIFEST_DIRTY_FLAG_FALSE=PASS`;
- `REL008_POST_PACKAGE_CLEAN=PASS`;
- `REL008_UNEXPECTED_MUTATION_REJECT=PASS`.

Tag-mode static release validator PASSed against the repaired workflow contract:

`REL005_RELEASE_VALIDATION_PASS version=1.1.0 tag=v1.1.0 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`

`git diff --check` PASSed; only CRLF conversion warnings were emitted.

## Repair publication checkpoint
- Repair implementation/evidence/state commit: `9ec5ccd4065ec9949152f513d6ac6bc747bafeec`.
- Push to `personal/chatgpt/phase7-commercial-release`: PASS; remote branch advanced from `ee10c86` to `9ec5ccd`.
- No open hotfix PR existed at the push checkpoint.
- Canonical state sync is committed/pushed before PR creation so automatic PR CI runs only on the final reviewed head.
- State checkpoint commit `5a543150172aa5c7ddd7f7b1c2ffcf857c80f968` was pushed before PR creation.
- PR #8 automatic CI run `38136588599`: SUCCESS.
- PR #8 MERGED to personal `main` at `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`.
- Merge-tree parity PASS: `ce31bfdd^{tree}` equals reviewed head `5a54315^{tree}` (`115bcfc87809544fda213a8b62866a56dcf20236`).

## Exit gate for this repair
Before another tag-triggered Release run:
1. review only workflow + release validator + this evidence/state delta;
2. commit and push only to personal feature branch;
3. open exactly one hotfix PR and monitor its automatic CI;
4. if CI PASSes, merge to personal `main` and verify merge-tree parity;
5. re-check GitHub Release absence, exact current tag target, GitHub auth, and absence of any active Release run;
6. only then guarded-move existing `v1.1.0` to the reviewed repaired main;
7. monitor only the new Release run;
8. never publish upstream and never manually create a duplicate Release.
