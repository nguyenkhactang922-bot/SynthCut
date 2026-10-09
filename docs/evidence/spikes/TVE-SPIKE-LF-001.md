# TVE-SPIKE-LF-001 — Corrected Long-Form POC Evidence

Status: ACTIVE — BOUNDED COMMAND SUB-GATE PASS; REMAINING LF GATES OPEN
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Nature: DESIGN-only disposable POC; no production source mutation.

## Failure checkpoint inherited
The earlier 30-minute/~301-clip attempt failed with Windows `ENAMETOOLONG` because local segment rendering forwarded the full staged clip list into FFmpeg.

## Corrected bounded-command hypothesis
A disposable runtime wrapper filtered the staged list passed to one segment renderer to clips intersecting the requested segment. Project-local `AIVE_FFMPEG/AIVE_FFPROBE` were set before dynamic import so the POC used the copied binaries without changing system PATH or production code.

## Result
Fixture/project:
- 300 sequential clips;
- 30-minute authoritative timeline extent;
- 1920x1080 @ 30 fps source shape;
- source includes audio;
- production `EditorEngine` and render graph beneath a disposable wrapper.

Measured result marker: `BOUND_COMMAND_PROOF_RESULT`.
- process exit code: 0;
- frame exists: PASS;
- elapsed frame proof: 4309.19 ms;
- staged clips entering segment boundary: 300;
- clips forwarded to render graph for segment 0–6s: **1**;
- segment renders: 1;
- segment cache hits: 0;
- single-pass fallback: 0.

## Sub-gate verdict
**PASS — bounded segment/window command construction is feasible without changing the authoritative timeline or replacing FFmpeg.**

This does not yet PASS `TVE-SPIKE-LF-001` as a whole. Remaining fixed gates still require whole 30-minute preview/export behavior, cache reuse, remote-frame cache, 20 edit/verify cycles, memory bound, background job progress/cancel and final ffprobe verification.

## Next architecture risk
Current `renderPreviewSegmented()` still performs one whole-timeline audio render after video segments. A 300-clip project may therefore still build an O(project clips) audio command and hit the same Windows command-size limit. Final export is also not yet proven command-size-safe. The next disposable POC must prove a bounded whole-preview strategy (e.g. segment-local A/V renders + concat or another exact bounded graph) before running the full LF acceptance sequence.

## Whole-preview corrected mux sub-gate PASS
`whole-preview-v2.ts` resumed from persisted `lf300.aive` and used bounded video-only TS segments plus bounded PCM WAV audio segments, concatenated separately, then encoded AAC exactly once during final mux.

Result:
- exit 0 / `WHOLE_PREVIEW_V2_RESULT` PASS;
- exact duration: 1800 s;
- video stream before mux: 1800 s;
- PCM audio stream before mux: 1800 s;
- final preview: 1280x720, 30 fps, H.264 + AAC;
- max input count per segment command: 3;
- max approximated command chars: 1,577;
- execution: 112,497.59 ms (~16.0x source-duration throughput);
- cached units: 588 hits / 12 renders during this resumed POC.

This closes the whole-preview command-size + AAC-padding risks for the DESIGN hypothesis. Remaining LF gates are cache reuse/remote frame, 20 edit/verify memory bound, background job cancel/progress, and final 30-minute 1080p export/ffprobe.

## Cache-locality / remote-frame / 20-cycle memory gates PASS
Disposable `cache-memory-gates.ts` resumed from the persisted 30-minute project and used the already-proven bounded segment wrapper; production source remained untouched.

Measured result marker: `CACHE_MEMORY_GATES_RESULT`.
- exit code: 0;
- segment count: 300;
- localized visual edit changed 1 segment key; 299 stayed reusable;
- unrelated segment reuse ratio: **99.67%** (gate >=90%);
- remote unchanged frame after local edit: **0 new segment renders**, **1 cache hit**;
- 20 localized edit/verify cycles completed without crash;
- post-warm RSS baseline: 106,225,664 bytes;
- cycle-20 RSS: 111,013,888 bytes;
- RSS ratio: **1.0451x** (gate <=1.25x);
- max observed RSS: 111,013,888 bytes;
- single-pass fallbacks: 0.

Verdict: **PASS** for cache reuse, remote-frame cache, repeated edit/verify and memory-bound sub-gates. Remaining LF gates: bounded background export control/progress/cancel and one complete 30-minute 1080p MP4 export with ffprobe verification.

## Background-control + final 1080p export gates PASS
Disposable `bounded-export-gates.ts` used the same persisted 30-minute project and the bounded A/V segment architecture. No production source was modified.

Measured result marker: `BOUNDED_EXPORT_GATES_RESULT`.

Background control/cancel:
- job start/control return: **1.71 ms** (gate <=5 s);
- real progress observed before cancel;
- cancel request accepted;
- final job state: `canceled`;
- partial final output absent after cancel.

Complete final export:
- background control return: **0.59 ms**;
- elapsed wall time: **277,714.47 ms**;
- 300 planned segments;
- 6 video segment renders + 6 audio segment renders + 588 cache hits;
- max inputs per generated segment command: **3**;
- max approximated command chars: **1,583**;
- final job state: `done`, progress 1.0;
- independent ffprobe verification: **1800.000000 s**, **1920x1080**, **30/1 fps**, H.264 video + AAC audio;
- final artifact size: **1,776,056,926 bytes**.

## Final TVE-SPIKE-LF-001 verdict
**PASS FOR SPIKE HYPOTHESIS.** Every fixed LF gate from `DESIGN_AUDIT_001` is now evidenced: assemble/save/load, exact preview, cache locality, unchanged remote-frame cache, 20 edit/verify cycles with bounded RSS, background progress/cancel, and complete 30-minute 1080p export + ffprobe. The evidence proves a viable bounded long-form architecture path; it does not authorize production implementation before Freeze + PLAN IMPLEMENTATION PASS.
