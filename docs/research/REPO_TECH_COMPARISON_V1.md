# Repository & Technology Comparison v1

Status: COMPLETE — input to ADR
Date: 2026-10-06
Target: personal/non-commercial Windows-first AI-native long-form editor, local footage, shared UI/MCP timeline, 30-minute / 200–300-clip projects.

## Decision criteria
Weighted qualitatively for this project:
1. Shared live timeline between human UI and external AI/MCP.
2. Mature multi-track NLE execution surface.
3. Deterministic/non-destructive editing model.
4. Long-form performance primitives: proxy/cache/jobs.
5. Transcript/media intelligence.
6. Agent safety: checkpoint/dry-run/audit/recovery.
7. Windows readiness.
8. License fit for personal use and future optional redistribution awareness.
9. Reuse cost: prefer extension over rewrite.

## Comparison matrix

| Candidate | License | Strongest fit | Material gaps for our target | Role recommendation |
|---|---|---|---|---|
| **SynthCut** | GPL-3.0-or-later; Remotion has separate source-available terms | Shared core for UI+MCP, multi-track frame EDL, FFmpeg, Whisper word timing, proxy, segment cache, jobs, recovery, OTIO, visual verification | UI scale at 300 clips unproven; whole transcript/summary MCP surfaces can be large; Vietnamese defaults are English-only; dependency audit needs hardening | **BASE** |
| **WeftCut** | MIT; separate FFmpeg lane notices | Full NLE + external-agent ergonomics: same watched timeline, visible action log, checkpoints, `dry_run`, history lock, agent sessions; strong preview architecture | Active/pre-1.0 project; replacing SynthCut would discard an already suitable TS/FFmpeg/MCP execution base | **Reference/candidate modules**, especially agent safety/UX and possible preview-performance ideas |
| **dawn-cut** | MIT | Pure deterministic core, command bus, invariants, dry-run plan, hash-chained audit log, text editing | v0.1; MCP is experimental; live app↔MCP bridge, full MCP render features, transitions/beat-sync and multitrack remain open | **Reference patterns** for command/invariant/audit design, not base |
| **tjameswilliams/ai-video-editor** | PolyForm Noncommercial 1.0.0 | 50+ AI tools, multi-track NLE, scene intelligence, speaker/semantic capabilities, provider/plugin model, vision-review loop | Current packaged focus is Mac; Windows planned; noncommercial license requires provenance discipline if code is borrowed | **Reference/candidate intelligence modules** for personal use, not Windows base |
| **MakeMyClip/editor** | MIT; bundled FFmpeg has own GPL boundary | Small deterministic FFmpeg tool surface, MCP/CLI/browser UI, op-log, snapshots/undo; easy to understand | Upstream explicitly says not tuned for >30 min/hundreds of clips; no full multi-track audio-effects NLE | **Reference** for inspectable op-log and simple tool contracts |
| **OpenTimelineIO** | Apache-2.0 | Mature stable editorial interchange model/API; external media refs; broad NLE ecosystem | Not a renderer, AI editor, playback engine, or desktop NLE | **Interop standard only**; keep SynthCut OTIO bridge |

## Candidate notes and evidence

### 1. SynthCut — retain as base
Local code audit proves:
- one persistent core owns authoritative project state;
- the same validated RPC registry drives UI and MCP;
- non-destructive integer-frame multi-track EDL;
- proxy preview path and segment cache;
- background jobs/progress/cancel and recovery;
- transcript word timing, scene/silence analysis, visual search;
- rendered-frame verification and OTIO roundtrip.

This is already the exact execution substrate the product needs. No alternative demonstrated enough additional value to justify throwing away these capabilities.

### 2. WeftCut — strongest external reference
Upstream README states the agent edits the same project the user is watching; every tool call is visible in the Agent panel; batches can be checkpointed/restored; `dry_run` applies a multi-step edit against a throwaway clone; history can be locked during an agent batch. It also presents itself as a full NLE with A/B-roll, keyframes/curve editor, effects, captions, role-based mixer and hardware export.

The data model further exposes checkpoint/restore, history lock and dry-run operations. Its licensing documentation keeps app code MIT and documents FFmpeg lanes separately.

Design ideas worth carrying into our ADR/design:
- `checkpoint(label)` around coherent AI batches;
- `dry_run(operations)` before risky/multi-step mutation;
- history lock during an atomic agent batch;
- visible append-only agent operation log;
- session identity for multi-agent safety;
- investigate its GPU/WebCodecs preview approach only if SynthCut UI/performance spikes fail.

References:
- https://github.com/WeftCut/WeftCut
- https://github.com/WeftCut/WeftCut/blob/main/README.md
- https://github.com/WeftCut/WeftCut/blob/main/docs/data-model.md
- https://github.com/WeftCut/WeftCut/blob/main/docs/licensing.md

### 3. dawn-cut — deterministic command discipline
Upstream describes a pure TypeScript editing core with integer time, validated transcript↔timeline and EDL invariants, pure commands returning before/after effects, a dry-run plan path and hash-chained audit log. This is architecturally useful for an AI-operated editor because it makes mutations reviewable and reproducible.

However upstream explicitly labels natural-language/MCP paths experimental and lists a live-app↔MCP bridge, MCP subtitle/overlay render completeness, transitions/beat-sync and multitrack as open work. Therefore it is not a stronger base than SynthCut for our target.

Patterns to consider:
- validated command-plan envelope above existing SynthCut RPC;
- precondition/invariant checks before applying an AI batch;
- deterministic plan hash / append-only audit record;
- explicit dry-run diff.

Reference: https://github.com/kwakseongjae/dawn-cut

### 4. tjameswilliams/ai-video-editor — intelligence reference
Upstream exposes 50+ tool-calling operations, multi-track editing, motion graphics, generator plugins and external MCP integrations. Its strongest delta is the broader intelligence/provider layer, including scene/vision-oriented workflows and reusable generated components.

The repo is PolyForm Noncommercial 1.0.0. The current personal/noncommercial target permits study/modify/use, but code provenance must remain explicit and a future commercial path cannot silently inherit those modules. Current README says packaged Mac today, Linux via CI, Windows planned.

Patterns to consider:
- scene intelligence / speaker-aware indexing;
- provider registry for optional generators;
- vision-review loop around generated graphics;
- keep noncommercial-derived code isolated/identified if ever copied rather than merely reimplemented from ideas.

Reference: https://github.com/tjameswilliams/ai-video-editor

### 5. MakeMyClip/editor — simple agent surface, not long-form base
Upstream offers 19 deterministic FFmpeg tools, browser UI/CLI/MCP, snapshots/undo and an inspectable operation log. It explicitly states the release is not tuned for projects with hundreds of clips or runtime above 30 minutes and recommends CLI for those workloads; it also is not a heavy multi-track NLE.

Useful ideas:
- concise operation log that can be diffed/replayed;
- minimal deterministic tool contracts;
- snapshot boundaries.

Reference: https://github.com/MakeMyClip/editor

### 6. OpenTimelineIO — retain as interchange, not core replacement
OTIO is a mature, stable editorial interchange API/model representing timing, tracks, clips, transitions, markers and references to external media. It does not contain media or render it. SynthCut already has import/export OTIO and stores SynthCut-specific data in metadata for roundtrip.

Decision implication: preserve this bridge. Do not replace SynthCut's live project model with OTIO merely for standards compliance.

References:
- https://github.com/AcademySoftwareFoundation/OpenTimelineIO
- https://opentimeline.io/

## Technology boundary comparison

### Timeline state
**Preferred:** SynthCut frame-based `Project` remains authoritative.
Reason: already shared live by UI and MCP; no measured core-model failure at 300 clips.

### Long-form hierarchy
**Preferred:** orchestration/read model above the flat timeline:
`PROJECT -> CHAPTER -> SCENE/BEAT -> timeline ranges/clip IDs`.
Reason: solves AI context/navigation without creating multiple competing edit states.

### Execution/render
**Preferred:** keep FFmpeg as deterministic local execution/render engine.
Reason: all existing core features and tests already compile to it; alternatives also depend heavily on FFmpeg.

### Preview
**Preferred initially:** keep SynthCut proxy + Canvas preview + segment-render verification.
Conditional alternative: if `TVE-SPIKE-UI-300` / `TVE-SPIKE-LF-001` fail, investigate WeftCut-style GPU/WebCodecs/native-decode path behind an adapter; do not pre-emptively rewrite.

### Motion graphics
**Preferred:** optional provider boundary. Retain current Remotion provider for personal use, with the editor functional without it.
Conditional alternative: browser/Motif-style or another renderer only if license/reliability spike justifies migration.

### AI control
**Preferred:** external ChatGPT-compatible MCP remains control boundary. Add orchestration/safety tools above existing RPC rather than bypassing core.

### Agent safety
**Preferred improvement direction:** checkpoint + dry-run + operation audit inspired by WeftCut/dawn-cut, implemented against SynthCut's existing undo/recovery/project state after design/spike validation.

### Interchange
**Preferred:** OpenTimelineIO remains export/import boundary for finishing elsewhere.

## Comparative conclusion
**Select SynthCut as the architectural base candidate for ADR.**

This is not a claim that every SynthCut subsystem is already production-ready for 30-minute/300-clip use. It means research found no alternative whose benefits exceed the migration/rewrite cost while preserving all required capabilities. Material unknowns are now bounded spikes:
- real 30-minute render/cache/memory;
- 300-clip UI responsiveness;
- large MCP transcript/context behavior;
- Vietnamese STT/edit timing;
- dependency-security hardening.

If one of those spikes demonstrates a structural failure, the ADR/design must be revised before freeze. Until then, extension-over-rewrite is the evidence-backed path.
