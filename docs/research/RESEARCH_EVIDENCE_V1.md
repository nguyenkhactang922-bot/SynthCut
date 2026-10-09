# Research Evidence v1

Status: COMPLETE for pre-ADR research
Baseline: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Date: 2026-10-06

## Purpose
Record concrete code/runtime evidence for the long-form personal-use target before any architecture decision. Unknowns are not treated as PASS; they are transferred into bounded spikes.

## E-01 — Shared UI/MCP source of truth: VERIFIED
Evidence:
- `packages/core/src/rpc.ts`: every editor command is defined once as a validated RPC method.
- `packages/mcp/src/index.ts`: MCP is stateless and forwards each tool call to the live core; it imports the exact same RPC registry.
- Desktop UI talks to the same core project state.

Conclusion: preserve this architecture. Do not introduce a second AI-only timeline.

## E-02 — Deterministic non-destructive frame timeline: VERIFIED
Evidence:
- `packages/core/src/types.ts`: project timing is integer project frames; clips reference immutable media source ranges; tracks/clips form the EDL.
- Preview/export resolve the same model to FFmpeg.
- `apps/desktop/scripts/smoke-composite.ts` executed on this machine and PASSed all checks for z-order, gaps, transitions, fades, transforms, keyframes, mute/hide and duration.

Runtime result:
`PASS — all checks green`.

## E-03 — Segment-cache invalidation design: VERIFIED at code + existing smoke scale
Evidence:
- `packages/core/src/ffmpeg/segments.ts`: boundaries are planned from clip starts/ends and greedily merged to roughly 2–10 second preview segments.
- `segmentKey()` hashes canvas/profile + only intersecting resolved clips + referenced source/graphic mtimes.
- `packages/core/src/engine.ts`: missing segments render independently; unchanged segments are cache hits; preview then losslessly concatenates video segments and performs one full audio pass.
- `packages/core/scripts/smoke-cache.ts` explicitly verifies a tail edit re-renders fewer segments and unchanged head segments hit cache.

Research conclusion: cache invalidation is local by content dependency, not revision-wide. The existing 12-second smoke does not prove 30-minute behavior, so long-form performance remains a spike.

## E-04 — 30-minute / 300-clip algorithmic planning cost: SYNTHETIC CORE EVIDENCE
One-off, non-production benchmark executed through repo code on this machine:
- 300 sequential clips
- 6 seconds each
- total timeline = 1,800 seconds (30 minutes)
- `planSegments()` produced 300 planned segments in ~2.253 ms.
- desktop `buildSegments()` produced 300 UI segment models in ~0.49 ms.

Conclusion: basic data-model/segment-planning computation is not itself a blocker at 300 clips. This does NOT prove DOM/UI interactivity, decode, preview, memory, or render throughput.

## E-05 — UI 300-clip scalability risk: OPEN -> SPIKE
Evidence:
- `apps/desktop/src/timeline.tsx` builds every track's segments and renders every clip with `segs.map(<ClipBlock ...>)`.
- Text/graphics/caption lanes also map all elements.
- Snap target collection walks all clips.
- No viewport virtualization/windowing was found in the timeline implementation.

Conclusion: 300 clips may still be acceptable, but it is not proven. A real UI responsiveness spike is mandatory.

## E-06 — MCP/context pressure: OPEN -> SPIKE
Evidence:
- `timeline_summary` returns all tracks and all clips in one response.
- `get_transcript` returns all transcript segments and all numbered words in one response.
- No pagination/range/chapter query exists for these two primary reasoning surfaces.

Synthetic payload measurement executed on this machine:
- representative 6,000-word + 900-segment transcript JSON: ~425,900 bytes.
- representative 300-clip timeline-summary JSON: ~46,758 bytes.

Conclusion: a 30-minute long-form transcript can consume substantial model context if fetched whole repeatedly. Long-form orchestration needs bounded context/query surfaces or a chapter/index layer; exact client behavior is a spike.

## E-07 — Vietnamese STT default is NOT safe: OPEN -> SPIKE
Evidence:
- `packages/core/src/whisper/setup.ts` exposes multilingual models (`tiny`, `base`, `small`, `medium`, `large-v3-turbo`) but `DEFAULT_MODEL` is `base.en`.
- `packages/core/src/whisper/transcribe.ts` defaults language to `en` when no language is supplied.
- RPC accepts `language` and `model`, so Vietnamese can be requested, but the existing defaults do not automatically switch away from an English-only model.

Conclusion: Vietnamese long-form must have an explicit multilingual model/language policy and measured WER/edit-boundary quality before freeze.

## E-08 — Long-running work primitives: VERIFIED
Evidence:
- `export_video` supports background jobs for long timelines.
- `list_jobs` and `cancel_job` expose progress/cancel.
- preview/cache jobs and crash recovery are already part of the engine.

Conclusion: long-form orchestration should reuse jobs rather than invent a second background-work subsystem.

## E-09 — Flat core timeline vs chapter hierarchy: RESEARCH ANSWER
Evidence:
- `Project` is intentionally a single flat source of truth: assets + tracks + clips + markers.
- Algorithmic 300-clip segment planning is cheap in synthetic evidence.
- The major scale risk is reasoning/UI context, not a demonstrated core EDL limit.

Pre-ADR recommendation: keep the flat core timeline authoritative; add PROJECT -> CHAPTER -> SCENE/BEAT indexing as an orchestration/read model above it. Do not split the project into independent timeline files unless a later spike proves a core limitation.

## E-10 — Remotion boundary: RESEARCH ANSWER
Evidence:
- `THIRD_PARTY_LICENSES.md` states Remotion is source-available, not OSI open-source, and is isolated to `packages/core/src/motion/render.ts`.
- Current target is personal/non-commercial use, so this is not an immediate blocker.
- Alternative projects also commonly use Remotion, while WeftCut demonstrates a browser/Motif approach.

Pre-ADR recommendation: retain motion graphics as an optional provider boundary; do not rewrite it before measured need. Keep the core usable when motion graphics are disabled/unavailable.

## E-11 — Dependency security baseline: OPEN -> SPIKE/HARDENING
Repo-local `npm ci --ignore-scripts` completed successfully. `npm audit` found:
- all deps: 32 vulnerabilities = 5 moderate, 25 high, 2 critical.
- production dependency view (`--omit=dev`): 15 vulnerable packages = 5 moderate, 9 high, 1 critical.
- critical runtime package reported: `proxy-addr`, reached through `express` -> `@modelcontextprotocol/sdk` -> `@aive/mcp`.
- high runtime packages included `adm-zip`, `browserslist`, `fast-uri`, `ip-address`, `js-yaml`, `nanoid`, `onnxruntime-node`, `postcss`, `source-map-js`.

Conclusion: no blind `npm audit fix --force`. A bounded dependency-security spike must classify reachable vs build-only findings, identify non-breaking upgrades, then define a hardening task before MAIN VERIFIED.

## E-12 — Environment limitation for render benchmark
Current Windows host evidence:
- Node: `v24.15.0` (meets repo >=22.12 requirement).
- npm CLI: `11.12.1` available through its installed JS entrypoint.
- system FFmpeg is NOT currently on PATH.
- packaged FFmpeg staging directory in this source checkout is empty.

Impact: actual 30-minute FFmpeg preview/export throughput cannot be honestly measured in this research pass. It is transferred to the long-form spike with an explicit prerequisite to provide a known FFmpeg binary/bundle.

## Existing baseline tests executed in this pass
1. `apps/desktop/scripts/smoke-composite.ts` — PASS.
2. `packages/core/scripts/smoke-clip-tokenizer.ts` — PASS.

These are baseline evidence only; they do not satisfy the later long-form spikes.

## Research stop-condition mapping
- R-01 actual 30-minute performance -> `TVE-SPIKE-LF-001`.
- R-02 200–300 clip UI responsiveness -> `TVE-SPIKE-UI-300`.
- R-03 cache invalidation -> design verified; 30-minute scale portion included in `TVE-SPIKE-LF-001`.
- R-04 MCP/context pressure -> `TVE-SPIKE-MCP-CONTEXT`.
- R-05 Vietnamese transcript quality -> `TVE-SPIKE-VI-STT`.
- R-06 chapter model location -> answered for ADR: orchestration/read model above authoritative flat timeline unless a spike disproves.
- R-07 Remotion -> answered for ADR: optional provider boundary; retain for personal use unless reliability evidence says otherwise.
- R-08 alternatives -> completed in `REPO_TECH_COMPARISON_V1.md`.
- New R-09 dependency security -> `TVE-SPIKE-DEPSEC-001`.

Research phase may now proceed to ADR. Architecture is still NOT frozen.
