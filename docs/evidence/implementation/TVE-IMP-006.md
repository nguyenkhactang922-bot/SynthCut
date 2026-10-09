# TVE-IMP-006 — Bounded long-form preview/export execution

Status: PASS / VERIFIED FOR TASK SCOPE
Date: 2026-10-08
Baseline HEAD before task commit: `840bacdff910d319bbbdad2af784f1a415007f3d`
Depends on: `TVE-IMP-005` committed at `840bacd`
Frozen basis: `docs/adr/ADR-001_BASE_ARCHITECTURE.md` A-002, `docs/evidence/spikes/TVE-SPIKE-LF-001.md`, `docs/plan/TASK_DECOMPOSITION_V1.md`.

## Implemented production behavior

- Production preview and H.264/H.265 MP4/MOV export now use bounded timeline windows rather than one FFmpeg command proportional to the full project clip count.
- Video segments are cached independently for preview/export; export keys include export settings so incompatible output profiles cannot collide.
- Dialogue/audio is rendered as bounded 48 kHz stereo PCM WAV segments, concatenated losslessly, then encoded once during final mux to avoid per-segment AAC priming/padding accumulation.
- Background music, ducking and optional loudness normalization are applied once at final mux so segment boundaries do not reset fades/compressor state.
- Existing WebM/VP9 export remains on the existing single-pass path; bounded MPEG-TS concatenation is intentionally limited to H.264/H.265 MP4/MOV in v1.
- Segment command instrumentation records maximum input count and approximate argv size for Windows command-size verification.
- JobManager progress/cancel semantics are preserved; cancel/failure removes partial final output and bounded transient render directories.
- Cache keys separate video/audio dependency modes and include only intersecting dependencies.

## Independent review defect and repair

Focused VERIFY review constructed a synthetic 300-clip continuous-transition chain and found that the first implementation still grouped the entire transition chain into one render run for a 6-second window:

- before repair: `300` FFmpeg inputs / approximately `100742` argv characters;
- this violated the frozen exit gate that commands remain bounded by content intersecting the local window.

The repair slices transition runs to the contiguous members that can contribute to the requested window while preserving the prior audio-offset semantics for true single-clip runs.

Post-repair targeted probe:
- video window: `2` inputs / `1047` chars;
- audio window: `3` inputs / `697` chars.

The dedicated production smoke also contains a permanent transition-chain regression gate and measured `2` inputs / `1112` chars.

## Runtime verification

### Core build
Command:
`npm.cmd run build --workspace @aive/core`

Result: PASS / exit `0` after the transition-window repair.

### Root typecheck
Command:
`npm.cmd run typecheck`

Result: PASS / exit `0` across core + MCP + desktop after the repair.

### Cache regression smoke
Command executed with repo-local FFmpeg/FFprobe and `AIVE_HWENC=off`:
`node.exe node_modules/tsx/dist/cli.mjs packages/core/scripts/smoke-cache.ts`

Result: PASS / exit `0`.
Verified:
- first preview renders all expected segments;
- localized tail edit rerenders only the tail segment;
- unchanged head frame uses cache with zero new segment render;
- `AIVE_SEGMENT_CACHE=off` still uses the existing single-pass fallback.

Marker: `CACHE SMOKE TEST PASSED`.

### Export regression smoke
Command executed with repo-local FFmpeg/FFprobe and `AIVE_HWENC=off`:
`node.exe node_modules/tsx/dist/cli.mjs packages/core/scripts/smoke-export.ts`

Result: PASS / exit `0`.
Verified:
- default MP4/H.264;
- explicit MP4/H.265/HEVC;
- WebM/VP9/Opus fallback path.

Marker: `EXPORT SMOKE TEST PASSED`.

### Dedicated repaired-source 30-minute production smoke
Command executed with repo-local FFmpeg/FFprobe and `AIVE_HWENC=off`:
`node.exe node_modules/tsx/dist/cli.mjs packages/core/scripts/smoke-long-form-bounded.ts`

Durable evidence:
- `.tmp/TVE-IMP-006-runtime.log`
- `.tmp/TVE-IMP-006-runtime.json`

Result marker: `TVE_IMP_006_RESULT = PASS`.

Fixture:
- clips: `310`;
- timeline duration: exactly `1800 s`;
- load: `165.44 ms`.

Transition command bound:
- inputs: `2`;
- approximate argv chars: `1112`.

Preview:
- exact duration: `1800 s`;
- `1280x720`, `30 fps`;
- H.264 + AAC;
- bounded segmented path; `singlePassRenders=0`;
- maximum command inputs: `3`;
- maximum command chars: `1601`.

Localized cache behavior:
- one localized edit: `1` video segment render + `299` cache hits;
- denominator is `hits + renders = 300`;
- unrelated cache reuse: `299/300 = 99.6667%` >= frozen `90%` gate;
- unchanged remote frame: `0` new renders + `1` cache hit.

Memory gate:
- baseline RSS: `109752320` bytes;
- after 20 edit/verify cycles: `115040256` bytes;
- ratio: `1.04818x` <= frozen `1.25x` gate.

Background cancel gate:
- control return: `0.5673 ms`;
- progress observed before cancel: yes;
- final job status: `canceled`;
- partial output exists: no;
- bounded transient directories left: none;
- clean cancel: PASS.

Final 1080p delivery:
- control return: `0.1895 ms`;
- job status: `done`;
- reported duration: `1800 s`;
- FFprobe-backed measured duration: `1800 s`;
- `1920x1080`, `30 fps`;
- H.264 + AAC;
- video present: yes;
- audio present: yes;
- maximum bounded command inputs: `3`;
- maximum command chars: `1615`;
- video segment renders/cache hits: `16 / 906`;
- audio segment renders/cache hits: `14 / 886`;
- verified output size before cleanup: `1775895551` bytes.

The smoke probes the produced final file with FFprobe-backed `probeAsset` independently of the JobManager's reported metadata, then intentionally deletes the approximately 1.78 GB ephemeral run directory after all assertions. The durable JSON/log remain the canonical runtime evidence; the large final file is not retained after successful verification.

### Diff hygiene and review
`git diff --check -- packages/core/src/engine.ts packages/core/src/ffmpeg/graph.ts packages/core/src/ffmpeg/segments.ts packages/core/scripts/smoke-long-form-bounded.ts`

Result: PASS / exit `0` (only local LF/CRLF conversion warning, no whitespace errors).

Focused review verified:
- no full-project command growth remains for a continuous transition chain;
- preview/export video segment caches are profile/settings-aware;
- audio segments are lossless PCM and final lossy encode occurs once;
- music/duck/loudness execute once at final mux;
- cancellation removes partial output and transient bounded directories;
- WebM/VP9 remains on the legacy compatible path;
- no production change was made to unrelated `packages/skill-installer/bin/synthcut.mjs` WIP.

## Acceptance mapping

- exact 1800s preview/final behavior: PASS;
- window/intersection bounded command size: PASS;
- continuous-transition edge case bounded: PASS;
- localized unrelated cache reuse >=90%: PASS at `99.6667%`;
- unchanged remote frame cache hit / zero new render: PASS;
- 20 edit/verify RSS <=125% baseline: PASS at `104.818%`;
- observable background progress: PASS;
- cancel leaves no partial output/transient bounded dir: PASS;
- final 1080p H.264+AAC FFprobe-backed verification: PASS;
- PCM segment audio concat + one final lossy encode: PASS;
- H.264/H.265 export regressions and WebM/VP9 fallback: PASS.

## Known bounded v1 behavior

- Bounded segmented export is intentionally limited to H.264/H.265 MP4/MOV. WebM/VP9 keeps the pre-existing single-pass route.
- Segment caches are retained under the engine data directory and remain subject to the existing cache-pruning policy.
- The successful production smoke deletes its large ephemeral final MP4 after FFprobe-backed assertions; durable metrics/logs are retained in `.tmp`.

## Verdict

`TVE-IMP-006 = PASS / VERIFIED FOR TASK SCOPE`

The production implementation satisfies the frozen A-002 long-form execution contract and the Phase-5 task exit gates, including the transition-chain command-bound edge case discovered during independent VERIFY review.
