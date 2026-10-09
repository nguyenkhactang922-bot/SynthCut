# Tang AI Video Editor — Product Brief v1

Status: FROZEN — TVE-FRZ-001 PASS (2026-10-07)

## Raw idea
Use SynthCut as the base for a personal Windows AI-native editor where one or more local raw videos can be edited primarily from ChatGPT through MCP, while retaining a visible professional timeline for manual review/correction. The first target is long-form YouTube-style footage around 30 minutes, including rough cuts assembled from hundreds of shots.

## Primary user workflow
1. Put source footage in a local folder.
2. Open/import it into the editor without modifying source files.
3. Analyze transcript, silence, scenes, media structure and selected visual frames locally.
4. ChatGPT produces an edit plan from the user's brief using bounded project/chapter/range evidence rather than repeatedly loading the whole long-form state.
5. The plan is validated against the current project revision and, for coherent/risky batches, dry-run/checkpointed before mutation.
6. ChatGPT executes edits through MCP against the same authoritative timeline shown in the desktop UI.
7. The system renders previews, verifies results, iterates, then exports the final file locally.

## Product boundaries for v1
- Windows first.
- Personal/non-commercial use.
- Local media remains the source of truth.
- CapCut/Premiere are optional interchange/finishing targets, not runtime dependencies.
- Long-form target: at least one 30-minute 1080p source and projects assembled from 200–300 clips.
- AI is the primary operator; human timeline editing remains available.
- Vietnamese talking-head footage is an explicit target language path.
- Speaker diarization is not required for v1 unless later spike/design evidence proves it necessary.

## Acceptance criteria — product
AC-01: Import one local raw MP4 and create a non-destructive project without changing the source.
AC-02: ChatGPT-compatible MCP can inspect the current project/timeline and perform edits on the exact same state visible in the UI.
AC-03: Transcript indexing provides word-level timing adequate for transcript-driven cuts.
AC-04: Silence and scene analysis can be used to produce deterministic candidate cut points.
AC-05: The editor supports multi-track video/audio, trim/split/ripple/move, transitions, transforms/keyframes, captions/text, music, B-roll overlays and export.
AC-06: A 30-minute timeline can use proxy media for preview while final export uses full-resolution sources.
AC-07: Long renders are observable/cancelable and do not require a synchronous chat turn to remain blocked.
AC-08: Small edits after an initial preview can reuse cached render segments rather than re-rendering the entire timeline where technically applicable.
AC-09: AI can verify edits with rendered frames/preview artifacts before final export.
AC-10: Project save/load and crash recovery preserve the edit state.
AC-11: The workflow supports 200–300 ordered source clips or an already assembled rough-cut source without forcing early destructive flattening.
AC-12: Final output can be exported locally as a standard MP4 suitable for YouTube.
AC-13: Every production implementation requirement is traceable to tests and evidence before MAIN VERIFIED.
AC-14: Long-form AI navigation uses bounded overview/chapter/range/transcript-window reads by default; spike target is <=64 KiB serialized JSON per default read call and representative edits must not require repeatedly fetching the full transcript.
AC-15: An AI edit plan created against an older project revision fails closed or is explicitly re-resolved/revalidated; it must never silently mutate a newer project state.
AC-16: A coherent multi-operation AI batch has a recoverable boundary (checkpoint/snapshot/transaction-equivalent), an auditable operation record, and an explicit rollback/recovery path.
AC-17: A 200–300-clip project meets the UI responsiveness gates frozen from `TVE-SPIKE-UI-300`; current audit thresholds are first paint <=5 s, interaction p95 <=100 ms, no normal-interaction main-thread task >500 ms, and ordinary drag/trim state reflection <=250 ms.
AC-18: Vietnamese transcription uses a multilingual Whisper model with language explicitly `vi` and must PASS the automated `TVE-SPIKE-VI-STT` gate before becoming the default Vietnamese edit surface: at least 10 minutes of reference-backed Vietnamese speech; normalized WER <=20%; deterministic frozen rare/key-token recall >=75%; p95 utterance-end timing error <=1.5 s with finite/in-range timing samples; and 20/20 deterministic cut-boundary samples must resolve fail-closed under the frozen breathing-room policy, retaining at least 120 ms guard on each side when a cut is made and otherwise returning NOOP/review-needed rather than forcing an unsafe cut. Throughput/memory are recorded. Human listening is optional spot-check evidence, not a DESIGN Freeze prerequisite.
AC-19: The baseline local edit workflow has **no required CapCut runtime dependency**: import, timeline mutation, preview/verification and final MP4 export must complete using SynthCut/Tang local components only. CapCut/Premiere/Resolve may remain optional interchange or finishing destinations.

## Acceptance criteria — architecture/process
AC-A01: Existing SynthCut strengths are reused unless a measured limitation justifies replacement.
AC-A02: Core timeline remains a single source of truth shared by UI and MCP.
AC-A03: All timing semantics remain deterministic and frame-based at the project boundary unless an ADR explicitly changes this.
AC-A04: License obligations for GPL-3.0-or-later, FFmpeg, Whisper/CLIP/ONNX assets and Remotion are documented before freeze.
AC-A05: No production feature coding begins before architecture + acceptance criteria are FROZEN.
AC-A06: Unknown high-risk assumptions are resolved by bounded spikes with pass/fail evidence.
AC-A07: Derived PROJECT→CHAPTER→SCENE/BEAT metadata is a rebuildable revision-aware read/orchestration model only; it never becomes independent render/edit truth.
AC-A08: Before freeze there are zero unreviewed critical production dependency findings; each remaining high production finding is fixed or explicitly classified/mitigated with rationale and regression evidence.
AC-A09: Spike/prototype code is disposable evidence and cannot be promoted into production silently; any promoted code requires a later frozen implementation task with normal tests/evidence/review.

## Pre-freeze measurable spike gates
The conditional audit owns the exact thresholds for:
- 30-minute / ~300-clip runtime/cache/export;
- 300-clip UI responsiveness;
- bounded MCP context;
- Vietnamese STT/edit timing;
- dependency integrity.

These gates must PASS before architecture/acceptance criteria can become FROZEN.

## Non-goals for initial freeze
- Rebuilding the NLE timeline UI from zero.
- Cloud-first media upload.
- Commercial redistribution strategy.
- Replacing FFmpeg without evidence of a blocker.
- Generative-video creation as a required dependency for baseline editing.
- Making speaker diarization a mandatory v1 dependency without evidence.
