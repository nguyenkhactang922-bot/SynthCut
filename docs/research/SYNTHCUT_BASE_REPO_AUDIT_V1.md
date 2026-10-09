# SynthCut Base Repository Audit v1

Status: COMPLETE — pre-ADR research closed by evidence/spike transfer
Upstream clone baseline: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`

## Verified architecture
- Root package: `ai-native-video-editor`, GPL-3.0-or-later, Node >=22.12.
- `packages/core`: persistent headless editing engine, non-destructive frame-based multi-track timeline, FFmpeg execution, project persistence, undo/redo, media intelligence, rendering.
- `packages/mcp`: stateless MCP transport. It imports the core RPC registry and forwards calls to the live core, so MCP and desktop UI operate the same project state.
- `apps/desktop`: Electron + React desktop editor.
- `packages/skill-installer`: installs editorial guidance for supported AI clients.

## Verified capabilities relevant to the target
### Timeline/editor core
- Frame-based canonical timing.
- Non-destructive asset references.
- Multi-track video/audio.
- add/move/trim/split/cut/ripple operations.
- link/unlink clips.
- transitions, transform, keyframes, effects, adjustment layers, markers.
- project save/load, schema migration, undo/redo.

### Long-form/performance primitives
- Proxy media for large sources; final export uses original media.
- Segment render cache for incremental preview/verification.
- Background jobs with progress/cancel for export and other long operations.
- Crash recovery/autosave.
- Hardware encoding option for previews/exports.
- Synthetic 300-clip/30-minute segment planning is cheap; real render/UI scale is not yet proven.

### Media intelligence
- Whisper transcript indexing with segment + word timestamps.
- transcript search and timeline phrase location.
- transcript-driven delete/tighten/edit operations.
- silence analysis and scene-change analysis.
- perceptual + optional CLIP semantic visual search.
- audio sync.

### AI control/verification
- Core RPC definitions are reused as MCP tools.
- `timeline_summary`, `get_frame`, `inspect_clip`, `inspect_timeline`, `inspect_color` support inspect/verify loops.
- MCP forwards image results to the model as actual image content.
- Long-running tool progress can be forwarded as MCP progress notifications.

### Output/interchange
- Preview and final export through FFmpeg.
- YouTube/social/web/master presets.
- loudness normalization options.
- SRT/VTT import/export.
- OpenTimelineIO import/export; SynthCut-specific data is retained in metadata for lossless SynthCut round-trip.

## License findings
### Main project
- GNU GPL v3.0 or later.
- Private/personal modification and use are allowed by the repository license. Distribution of derivative covered works triggers GPL obligations.

### Third-party highlights
- FFmpeg/ffprobe: bundled GPL build; separate process. Redistribution requires normal GPL source-offer obligations for that binary.
- whisper.cpp: MIT.
- Whisper model: MIT as documented by project.
- YuNet: Apache-2.0.
- ONNX Runtime: MIT.
- CLIP model/export: MIT as documented by project.
- Electron/React/runtime npm dependencies listed by upstream: permissive/MIT family.
- Noto Sans: SIL OFL 1.1.
- Remotion: source-available, not OSI open source. Upstream notes individuals and companies up to 3 people may use it free; companies of 4+ need a paid license. It is isolated to motion graphics. For this personal/non-commercial project it is not an immediate blocker, but motion graphics must remain an optional provider boundary.

## Existing verification surface
`docs/TESTING.md` defines real smoke tests for core editing, MCP path, multi-track, effects, transitions, color, transforms, captions, reframe, J/L cuts, text-based editing, media intelligence, toolsurface, export, proxy, cache, jobs, loudness, OTIO, motion graphics and bundled/offline behavior.

Executed during this research pass:
- `apps/desktop/scripts/smoke-composite.ts` — PASS.
- `packages/core/scripts/smoke-clip-tokenizer.ts` — PASS.

## Research findings beyond the original audit
### Cache invalidation
`packages/core/src/ffmpeg/segments.ts` plans preview segments at edit boundaries and hashes only content intersecting each segment plus media/graphic mtimes. Existing cache smoke proves tail edits can reuse unchanged head segments. Long-form throughput is still a spike rather than assumed.

### Timeline UI scale
`apps/desktop/src/timeline.tsx` creates/renders all clip blocks and element bars with normal React mapping and gathers snap targets across clips. No viewport virtualization/windowing was found. Therefore 200–300 clip UI responsiveness is an explicit spike.

### MCP context scale
`timeline_summary` and `get_transcript` return complete collections, not paged/ranged subsets. Synthetic representative payloads measured ~46.8 KB for 300 clips and ~425.9 KB for a 6,000-word/900-segment transcript. This supports an orchestration read model / bounded query surface rather than repeatedly injecting the entire long-form state.

### Vietnamese STT
Multilingual Whisper models exist and RPC accepts model/language, but defaults are `base.en` and language `en`. Vietnamese cannot be accepted under default behavior; a multilingual model + `vi` policy must be tested.

### Flat project model
The core project model is intentionally one authoritative flat EDL. Synthetic 300-clip segment planning took only a few milliseconds, providing no evidence that the core needs fragmentation. Chapter/scene/beat should initially be an orchestration/read index over absolute ranges and clip IDs, not multiple competing timelines.

### Dependency security
After lockfile install, `npm audit` reported 32 total findings (5 moderate, 25 high, 2 critical). Production-only view reported 15 vulnerable packages (5 moderate, 9 high, 1 critical). The critical production package was `proxy-addr` through `express -> @modelcontextprotocol/sdk -> @aive/mcp`. This must be classified and hardened; blind `npm audit fix --force` is prohibited.

## Original research questions — closure / transfer
- **R-01 actual 30-minute performance/memory/render** → transferred to `TVE-SPIKE-LF-001`; system FFmpeg is currently unavailable in the source environment, so no false PASS is claimed.
- **R-02 200–300 clip UI responsiveness** → transferred to `TVE-SPIKE-UI-300`; lack of virtualization is concrete risk evidence.
- **R-03 cache invalidation granularity** → core mechanism answered by code + existing smoke; 30-minute scale is part of `TVE-SPIKE-LF-001`.
- **R-04 MCP/client large-context behavior** → transferred to `TVE-SPIKE-MCP-CONTEXT`; payload pressure measured and no bounded transcript API exists yet.
- **R-05 Vietnamese long-form quality** → transferred to `TVE-SPIKE-VI-STT`; defaults are not Vietnamese-safe.
- **R-06 flat model vs chapter index** → research recommendation: authoritative flat core timeline + orchestration-only hierarchy/read model unless a spike disproves it.
- **R-07 Remotion** → retain as optional provider for personal use; no pre-emptive rewrite.
- **R-08 alternative bases/modules** → complete in `docs/research/REPO_TECH_COMPARISON_V1.md`; SynthCut remains strongest base candidate.
- **R-09 dependency security** (new finding) → transferred to `TVE-SPIKE-DEPSEC-001`.

## Initial fit assessment after research
SynthCut remains the strongest base because the difficult NLE execution substrate already exists. The main product delta is a long-form AI editor-brain/orchestration/safety layer plus evidence-backed scale hardening. WeftCut/dawn-cut/ai-video-editor/MakeMyClip contribute design ideas, but research found no evidence-backed reason to replace the SynthCut core before spikes.

## Audit stop condition — RESULT
**PASS for repository-research phase.**

All material unknowns are either answered by code/runtime evidence or transferred to bounded spike IDs. This PASS authorizes ADR/design work only. It does **not** authorize production feature implementation and does **not** freeze architecture.

Detailed evidence: `docs/research/RESEARCH_EVIDENCE_V1.md`.
