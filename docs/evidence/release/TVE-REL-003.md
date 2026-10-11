# TVE-REL-003 — Third-party provenance + corresponding-source compliance

Status: PASS / VERIFIED
Date: 2026-10-09
Branch: `chatgpt/phase7-commercial-release`
Baseline before task: `81ce1fb30ddb76a7d74b2317787566135a32ef75`
Prior product baseline retained: `personal/main@af92f20` MAIN VERIFIED

## Input
- Phase-7 plan: `docs/plan/PHASE7_RELEASE_PLAN_V1.md`.
- Commercial redistribution audit: `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`.
- Existing bundle staging: `apps/desktop/scripts/prepare-bundle.ts`.
- Existing package resources: `apps/desktop/package.json`.
- Existing third-party notices: `THIRD_PARTY_LICENSES.md`.
- Retained project-local Gyan FFmpeg/ffprobe 6.1.1 binaries from prior verified evidence.

## Entry Gate
PASS:
- REL-001 PASS.
- REL-002 PASS with fork package/update identity verified.
- Git root verified as `E:/SynthCut` before writes/tests.
- No package publication or external release side effect was authorized for this task.

## Work
1. Added tracked Windows FFmpeg release pin `release/compliance/ffmpeg-windows.json` with provider/build/version, archive SHA-256, exact `ffmpeg.exe`/`ffprobe.exe` SHA-256, upstream FFmpeg tag/source, provider release/build references, and Chocolatey package record.
2. Added `release/compliance/SOURCE_OFFER.md` mapping the fork source, FFmpeg corresponding source/build information, whisper.cpp/model, YuNet, Noto Sans, and third-party notice boundary.
3. Hardened `prepare-bundle.ts` so Windows release staging:
   - fails closed unless the FFmpeg/ffprobe version banner matches `6.1.1-essentials_build-www.gyan.dev`;
   - fails closed unless both executable SHA-256 values match the tracked pin;
   - compares exact bytes when reusing staged resources;
   - hashes every redistributed staged file;
   - records the exact dependency lock hash;
   - records distribution-document hashes;
   - records Git commit plus whether tracked source is dirty;
   - records explicit Remotion/signing release gates.
4. Added package `extraResources` for the root GPL `LICENSE`, `THIRD_PARTY_LICENSES.md`, and `SOURCE_OFFER.md` in addition to the generated `aive` resource tree.
5. Updated `THIRD_PARTY_LICENSES.md` so FFmpeg redistribution points to the exact pinned Gyan build and FFmpeg `n6.1.1` source rather than a generic build family.
6. Ran positive live staging, negative fail-closed validation, repaired source-state provenance, and reran only the affected staging stage.

## Output
Release-resource staging now produces `apps/desktop/build/resources/aive/bundle-manifest.json` with deterministic binary/model/document provenance. The package configuration is prepared to ship GPL/license/source-offer documentation, while public release remains blocked by later Phase-7 gates.

## Exit Gate
PASS:
- Exact FFmpeg/ffprobe provider/version and byte hashes are pinned and verified.
- Incorrect FFmpeg (`n7.1` from the Remotion compositor package) is rejected before resource staging.
- Every staged file represented in the manifest has an independently verified size + SHA-256 match.
- `package-lock.json` is hashed in the manifest.
- `LICENSE`, `THIRD_PARTY_LICENSES.md`, and `SOURCE_OFFER.md` are hashed in the manifest and included as package resources.
- Exact source/build URLs are recorded for redistributed FFmpeg, whisper.cpp/model, YuNet, and Noto Sans.
- Root typecheck PASS.
- Focused `git diff --check` PASS.
- No NSIS/ZIP package or GitHub Release was produced by REL-003.

## Artifact
Tracked:
- `release/compliance/ffmpeg-windows.json`
- `release/compliance/SOURCE_OFFER.md`
- `THIRD_PARTY_LICENSES.md`
- `apps/desktop/scripts/prepare-bundle.ts`
- `apps/desktop/package.json`
- this evidence record

Generated/runtime evidence:
- `apps/desktop/build/resources/aive/bundle-manifest.json`
- project-local staged resource tree under `apps/desktop/build/resources/aive/`
- project-local cache under `.tmp/rel003-*`

## Evidence
### Exact retained FFmpeg identity
- `ffmpeg.exe` size: `82,797,568` bytes.
- `ffmpeg.exe` SHA-256: `04e1307997530f9cf2fe35cba2ca7e8875ca91da02f89d6c7243df819c94ad00`.
- `ffprobe.exe` size: `82,668,032` bytes.
- `ffprobe.exe` SHA-256: `3a7e2dc003dc2cd1472827e4c7c4f056ae1ae0ae7c5bbc580c99b49827351ba4`.
- version token for both: `6.1.1-essentials_build-www.gyan.dev`.
- pinned Gyan archive SHA-256: `9e1ddfab8eb16c30690eb769fab1301380139dd00026c8da5c667c7aad7e5cc9`.
- corresponding upstream source tag: `n6.1.1`.

### Positive staging
Final staging PTY: `pty_e158b7e3a3e331fd9ad093147850b7d3e812`.
Result: PASS / exit `0`.
Marker: `REL003_FINAL_STAGE_EXIT=0`.
Observed output included:
- `verified + staged 6.1.1-essentials_build-www.gyan.dev`;
- staged whisper-cli runtime files + `ggml-base.en.bin`;
- staged YuNet model;
- staged Noto Sans + license;
- manifest emitted with exact hashes/source mapping;
- staged bundle approximately `313.0 MB`.

### Fail-closed negative test
The same staging script was invoked with Remotion compositor FFmpeg (`n7.1`) instead of the pinned Gyan build.
Expected task-test result: staging process exits nonzero.
Observed inner exit: `REL003_NEGATIVE_EXIT=1`.
Observed error: provenance mismatch, expected `6.1.1-essentials_build-www.gyan.dev`, observed `ffmpeg version n7.1`.
The test wrapper returned success because rejection was the required behavior.

### Independent manifest verification
Verifier PTY: `pty_bb3161cd59e557848ec933770ea742a670c5`.
Result: PASS / exit `0`.
Marker:
`REL003_MANIFEST_VERIFY_PASS files=36 bytes=328141128 sourceCommit=81ce1fb30ddb76a7d74b2317787566135a32ef75 trackedDirty=True`

The verifier independently recomputed SHA-256 from disk for all 36 staged records, the dependency lock, and each distribution source document; it also verified package `extraResources`, FFmpeg expected/observed hash equality, release gates, and current Git source state.

`trackedDirty=True` is intentional evidence for this task-stage build: REL-003 source changes had not yet been committed when the staging proof ran. This prevents falsely presenting the baseline commit as a clean release source. REL-005/REL-006 must require a clean reviewed release commit for a release candidate.

### Typecheck / diff
- Root `npm run typecheck`: PASS / exit `0` using the explicit system npm executable.
- Focused `git diff --check`: PASS / exit `0`.

## Owner / Authority
ChatGPT Web owns verification judgment; FileMCP-E executed local staging, hashing, negative-path, typecheck and Git checks. Third-party license authority remains external and is not inferred from this task.

## Risks / Open Questions
- REL-003 solves provenance/source traceability but does not authorize public commercial publication.
- Remotion commercial/redistribution basis remains a hard gate at REL-007.
- Trusted Windows signing remains a hard gate at REL-007.
- Release packaging tool vulnerabilities carried from TVE-IMP-009 are deliberately handled next by REL-004.
- Final release provenance must be generated from a clean reviewed release commit; `trackedDirty=True` is unacceptable for REL-006/REL-008 release-candidate closure.

## Loopback
- FFmpeg pin/hash/source contradiction → REL-003 only.
- New third-party license contradiction → commercial License/Security RESEARCH re-entry.
- Packaging tool vulnerability/toolchain issue → REL-004.
- Package resource omission discovered during NSIS/ZIP acceptance → REL-003 or REL-005 depending on ownership.
- Product runtime contradiction → reopen only the owning IMP task; do not invalidate unrelated Build & Verify evidence.
