# TVE-REL-008 — PR CI Jobs-Progress Repair Evidence

Status: **LOCAL REPAIR PASS / PR CI RERUN PENDING**
Date: 2026-10-11
PR: `nguyenkhactang922-bot/SynthCut#2`
Failed CI run: `38125686293`
Failed head: `db00c8972671c758dce7eba97966315279efa2b2`

## Failure classification
`FAIL` was isolated to one CI stage: `Smoke — jobs (background export, progress, cancel)`.

The same run had already PASSed setup, dependency install, typecheck, build, compositor smoke, CLIP tokenizer smoke, and security smoke. Those checkpoints are retained and were not blindly rerun.

Observed failing assertion:
- background export returned a job id immediately: PASS;
- job was observable as `running`: PASS;
- progress fraction after the smoke observation window: **FAIL, `0.000`**;
- cancellation, canceled status, partial-file cleanup, blocking export, and crash recovery: PASS.

## Root cause
The bounded H.264/H.265 export path only published job progress after `ensureExportVideoSegmentRendered(...)` completed the first full video segment. On a slower CI runner, that first segment could exceed the 60-second smoke observation window while the job remained legitimately running, leaving the public job fraction at zero.

This is an implementation observability gap, not a reason to weaken the smoke timeout.

## Repair
`packages/core/src/engine.ts` now:
- accepts an optional FFmpeg progress callback in `ensureExportVideoSegmentRendered(...)`;
- forwards it to both primary and software-fallback `runFfmpeg(...)` executions;
- maps first-segment FFmpeg fraction into bounded-job progress via the existing `publish(...)` unit model;
- clamps aggregate published fraction monotonically so a hardware-to-software fallback cannot move visible progress backward.

## Targeted verification
The first local attempt failed before product logic because FileMCP's minimal process PATH did not contain `ffmpeg`; no conclusion was drawn from that harness failure.

The exact failed smoke was then rerun using the already-bundled candidate FFmpeg/ffprobe through process-local `AIVE_FFMPEG` / `AIVE_FFPROBE` values.

Result: **PASS / exit 0**.

Key repaired observation:
- job observable while running: PASS;
- `fraction rose above 0`: PASS, observed `0.005`;
- cancel running job: PASS;
- final status `canceled`: PASS;
- no partial output: PASS;
- unknown-job teaching path: PASS;
- blocking export + completed fraction 1: PASS;
- crash-recovery snapshot/load: PASS;
- marker: `JOBS SMOKE TEST PASSED`.

Narrow compile verification after source repair:
- `tsc -b packages/core`: **PASS / exit 0**.

## Exit / next action
The locally repaired failed stage is PASS. REL-008 itself is not PASS yet. Commit this repair and state evidence, push the existing personal-fork feature branch, then monitor the new PR #2 CI run. Do not rerun REL-007 package/license proofs and do not publish/tag until PR CI/review/merge and side-effect guards PASS.

## Remote CI and merge completion
The repaired commit was created as `a27c78f9404024eb45638512c2e513a82d188f5b` and is present on `personal/chatgpt/phase7-commercial-release`.

GitHub PR #2 automatic CI rerun:
- run: `38126601288`;
- exact head: `a27c78f9404024eb45638512c2e513a82d188f5b`;
- `build-and-smoke`: **SUCCESS** / 2m42s;
- no local rerun of already-PASS package/license stages was performed.

Merge verification:
- PR #2 state: `MERGED`;
- merged at: `2026-10-11T09:04:04Z`;
- personal-main merge commit: `622af29029d53c2724af6f5789c54b43688d25da`;
- merged-main tree hash equals repaired feature-head tree hash: `5afbdddc0741db5daff64f9d743b0d5feecacd32`;
- `git diff --exit-code a27c78f personal/main`: PASS;
- upstream `origin/main` remained `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0` and was not modified.

Pre-publication side-effect guard after merge:
- `v1.1.0` tag on personal fork: ABSENT;
- GitHub Release `v1.1.0`: ABSENT;
- no active SynthCut process.

REL-008 is therefore past PR verification/merge and may proceed only after durable state sync and one final tag/release/auth collision check. GitHub Release publication itself remains pending.
