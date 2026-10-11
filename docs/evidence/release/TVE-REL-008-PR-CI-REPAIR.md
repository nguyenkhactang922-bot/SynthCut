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
