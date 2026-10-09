# ADR-001 — Base Architecture and Technology Boundaries

Status: FROZEN — TVE-FRZ-001 PASS (2026-10-07)
Date: 2026-10-06
Decision owner: project lifecycle / evidence-backed design process
Baseline: SynthCut `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`

## Context
The target is a personal, Windows-first, AI-native long-form editor where local footage remains local, ChatGPT-compatible MCP is the primary control surface, and the user can simultaneously inspect/correct the same professional timeline in the desktop app. Initial scale target is a 30-minute 1080p project and/or roughly 200–300 ordered clips.

Research established that SynthCut already implements the core NLE execution substrate: a persistent shared core, frame-based non-destructive multi-track EDL, FFmpeg rendering, proxy media, segment preview cache, jobs, Whisper word timing, media analysis/search, project persistence/recovery, rendered-frame verification and OTIO interchange.

Alternatives contribute useful patterns but none justified a base replacement:
- WeftCut: stronger agent checkpoint/dry-run/history/session ergonomics.
- dawn-cut: stronger explicit command/invariant/audit discipline.
- ai-video-editor: broader intelligence/provider patterns, but noncommercial license and weaker Windows packaging fit.
- MakeMyClip: simple deterministic operation log/tool surface, but explicitly not tuned for >30-minute/hundreds-of-clips projects.
- OpenTimelineIO: interchange standard, not editor/render core.

Research also exposed unresolved risks requiring spikes: 30-minute runtime, 300-clip UI, MCP context size, Vietnamese STT quality, and dependency security.

## Decision summary
**Keep SynthCut as the authoritative editor base and extend it with a Tang long-form orchestration/safety layer. Do not rewrite the timeline, renderer, MCP transport, or desktop NLE before a spike proves a structural failure.**

The architecture is layered:

```text
ChatGPT / MCP client
        |
        v
Tang Long-Form Editor Brain / Orchestrator
  - brief -> plan
  - project/chapter/scene/beat read index
  - bounded context/query surfaces
  - deterministic edit plan / batch safety
  - QA / evidence loop
        |
        v
SynthCut MCP/RPC boundary
        |
        v
SynthCut Core — SINGLE SOURCE OF TRUTH
  - assets / tracks / clips / markers
  - frame-based non-destructive EDL
  - undo/recovery/jobs/cache
        |
        +-------> Electron/React timeline UI
        |
        +-------> FFmpeg preview/export
        |
        +-------> optional motion-graphics provider
        |
        +-------> OTIO interchange
```

## D-001 — Base repository
**Decision:** SynthCut remains the base repository and execution core.

Rationale:
- already meets the hardest state-sharing requirement: UI and AI mutate the same project;
- has the required NLE/edit/render primitives;
- has Windows desktop architecture and existing smoke surface;
- extension cost is lower and safer than replacing a working core.

Rejected for now:
- migrating base to WeftCut;
- migrating base to dawn-cut;
- assembling a new editor from FFmpeg/Remotion/OpenTimelineIO primitives;
- using MakeMyClip as long-form core.

Revisit trigger: a required spike demonstrates an unfixable or disproportionately expensive structural limitation in SynthCut.

## D-002 — Authoritative timeline/data model
**Decision:** preserve SynthCut's single flat frame-based `Project`/EDL as authoritative edit state.

The long-form hierarchy is a **derived orchestration/read model**, not a second timeline:

```text
Project
  Chapter[]
    Scene/Beat[]
      refs -> absolute frame ranges / clip IDs / asset transcript spans / markers
```

Rules:
- hierarchy never owns independent clip timing;
- it is rebuildable from or reconciled against authoritative project revision;
- edits always resolve back to core clip IDs/frame ranges and execute through existing RPC;
- hierarchy entries carry source project revision/hash so stale plans fail closed or re-resolve.

Rationale: research found context/navigation pressure, not a demonstrated flat-core EDL performance failure.

Rejected: splitting a 30-minute project into separate independent timeline JSON files as the primary source of truth.

## D-003 — Timing semantics
**Decision:** project/editor boundary remains integer project frames.

Seconds may be used only for media-analysis results and external/UI convenience; operations crossing into the edit core must resolve to deterministic frames using project FPS.

Rationale: preserves existing core semantics, repeatability and exact edit traceability.

## D-004 — Render/execution engine
**Decision:** keep FFmpeg as local deterministic render/export engine.

Use existing:
- filtergraph compilation;
- proxy path;
- segmented preview cache;
- hardware preview encoding where available;
- background export jobs;
- platform/loudness presets.

Do not introduce a second general render engine for baseline editing.

Revisit trigger: long-form runtime spike fails due to a limitation that cannot be addressed by cache/proxy/filtergraph/job improvements.

## D-005 — Preview architecture
**Decision:** retain current preview stack initially and harden only based on evidence.

Existing path:
- proxy media for interactive preview;
- Canvas/UI approximation;
- exact `get_frame` / `inspect_timeline` / `render_preview` via FFmpeg as ground truth;
- segment cache for iterative verification.

Conditional path if UI/runtime spike fails:
- add viewport virtualization to timeline first;
- then evaluate GPU/WebCodecs/native-decode approaches inspired by WeftCut behind a defined preview adapter.

No pre-emptive rewrite is authorized.

## D-006 — ChatGPT/MCP integration boundary
**Decision:** ChatGPT talks through MCP; MCP/RPC remains the only mutation gateway for AI editing.

The Tang orchestration layer may add higher-level tools, but they must ultimately call validated core RPC operations. It must not write `.aive` project JSON behind the core's back.

Two tool classes:
1. **Read/orchestration tools** — bounded project/chapter/transcript/scene queries, planning, QA/evidence.
2. **Mutation batch tools** — validated/dry-runnable operation plans resolved to existing core RPC.

Rationale: prevents AI-only state and preserves live UI synchronization.

## D-007 — Long-form context strategy
**Decision:** never make full transcript or full project JSON the default recurring context surface for long-form work.

Add bounded read concepts after spike validation:
- `project_overview` — compact counts/duration/current revision/chapter index;
- `list_chapters` / `inspect_chapter`;
- transcript range/window retrieval by time/word index/semantic hit;
- clip/timeline range summary;
- search/locate first, expand only the selected area.

Principle: **index -> locate -> expand -> edit**, not **dump everything -> reason**.

Payload thresholds are not frozen here; `TVE-SPIKE-MCP-CONTEXT` must supply evidence.

## D-008 — AI edit-plan safety
**Decision:** add an orchestration-level plan/batch envelope inspired by WeftCut and dawn-cut, while reusing SynthCut undo/recovery.

Target concepts:
- plan ID and project revision precondition;
- ordered operations with human-readable rationale;
- dry-run/validation before risky batches;
- checkpoint before coherent batch;
- history/batch lock where needed to prevent interleaved undo/mutation;
- append-only operation/evidence record;
- batch result records changed clip IDs/frame ranges/revision;
- one-step rollback/checkpoint restore for the batch when feasible.

This is a design direction, not production code authorization. Exact semantics are frozen only after audit/spikes.

## D-009 — Long-form planning hierarchy
**Decision:** editor brain reasons in:

```text
PROJECT -> CHAPTER -> SCENE / NARRATIVE BEAT -> EDIT ACTION
```

For a rough cut assembled from 200–300 shots, the system preserves shot/clip identity instead of flattening early. For a single already-flattened source video, chapter/scene/beat entries reference source/timeline ranges.

The hierarchy supports:
- narrative continuity;
- hook/pacing/retention decisions;
- B-roll/caption/audio plans;
- bounded QA;
- incremental re-edit by chapter.

It does not change the core EDL representation.

## D-010 — Transcript and Vietnamese policy
**Decision:** do not use `base.en`/English defaults for Vietnamese projects.

The orchestrator must explicitly select a multilingual Whisper model and `language="vi"` when project language is Vietnamese. The default model is selected by the automated `TVE-SPIKE-VI-STT` evidence gate defined by AC-18.

Transcript is an index/edit surface, not sole truth. Automated transcript-driven cuts use a fail-closed breathing-room resolver: retain at least 120 ms guard on each side of a performed removal; when the candidate gap cannot preserve that guard, return NOOP/review-needed instead of forcing the cut. Rendered audio/preview QA remains part of production verification. Human listening is optional spot-check evidence for v1 personal use, not a DESIGN Freeze prerequisite.

## D-011 — Media intelligence boundary
**Decision:** reuse existing silence, scene, transcript, CLIP/perceptual search and audio sync; add higher-level derived indexes instead of duplicating raw analysis.

Potential future scene/speaker intelligence can be introduced behind provider interfaces only when it produces normalized local evidence (ranges, labels, confidence) and does not own edit state.

Speaker diarization is a candidate enhancement, not required for initial freeze unless the living design makes it necessary for acceptance criteria.

## D-012 — Motion graphics
**Decision:** motion graphics are optional and provider-isolated.

Current Remotion implementation may remain for personal use. Baseline editing/export must remain functional if motion graphics are disabled or unavailable.

Provider contract should conceptually be:
`render graphic spec -> local alpha/video asset + metadata`.

Revisit provider only if license, reliability, startup/download, or render evidence fails an acceptance gate.

## D-013 — Agent/human coexistence
**Decision:** human and AI may edit the same live project, but AI multi-operation batches require concurrency safeguards.

Minimum design requirement before freeze:
- project revision precondition;
- mutation batch cannot silently apply against stale state;
- conflict results are explicit;
- UI shows/records AI batch changes;
- ordinary manual edits remain available outside a protected atomic batch.

## D-014 — Jobs and asynchronous local work
**Decision:** reuse SynthCut jobs for long local operations. Chat/API orchestration polls/observes jobs rather than inventing background promises external to the editor.

Long-form exports, transcription, indexing, proxy generation and similar work should return/track stable job IDs where practical.

## D-015 — QA and verification
**Decision:** every AI editing batch follows an evidence loop appropriate to the change:

```text
inspect real source/state
-> plan
-> mutate
-> structural verification
-> rendered frame/preview/audio verification
-> accept or correct
```

Ground truth hierarchy:
1. project/RPC state for structure;
2. exact FFmpeg rendered artifacts for visual/audio outcome;
3. final exported media for delivery verification.

UI approximation is not final-render evidence.

## D-016 — Interchange
**Decision:** retain OpenTimelineIO as interchange/handoff, not internal live state replacement.

Preserve SynthCut-specific metadata for lossless SynthCut roundtrip. CapCut/Premiere/Resolve are optional external finishing destinations, never required runtime dependencies.

## D-017 — Security/dependency gate
**Decision:** dependency security is a freeze gate, not deferred cleanup.

Rules:
- zero unreviewed critical production vulnerabilities before architecture/implementation freeze;
- classify reachable runtime vs tooling/build-only issues;
- prefer smallest compatible dependency upgrades/overrides;
- no blind forced major upgrade;
- MCP/local file boundaries continue to require explicit validation/allowlisting.

`TVE-SPIKE-DEPSEC-001` must produce the concrete remediation decision.

## D-018 — License boundary
**Decision:** current project remains personal/noncommercial; preserve source/license notices and provenance.

- SynthCut GPL obligations remain applicable to derivative distribution.
- Remotion remains separately governed.
- PolyForm Noncommercial source from ai-video-editor is not to be casually copied into generic/permissive modules; any copied code must be tracked explicitly. Prefer reimplementation from architectural ideas unless direct reuse is necessary.
- MIT/Apache reference implementations may be adapted subject to their notices.

Commercial redistribution is a non-goal for current freeze and would require a new license review ADR.

## D-019 — Implementation strategy
**Decision:** extension-first.

Preferred order after freeze:
1. read-model/context/orchestration layer;
2. batch safety/audit primitives;
3. long-form editor-brain policies;
4. UI scalability hardening only if spike requires it;
5. Vietnamese STT policy/config;
6. dependency hardening;
7. optional intelligence/provider improvements.

Do not fork/replace functioning renderer/timeline subsystems merely for stylistic consistency.

## Consequences
### Positive
- preserves a large tested upstream surface;
- minimizes regression and rewrite risk;
- solves the user's actual differentiator: AI long-form reasoning/control;
- keeps local/offline media and deterministic rendering;
- leaves room for targeted performance modernization based on measurements.

### Negative / accepted costs
- GPL remains the base license;
- flat core state requires a derived index for AI long-form navigation;
- existing UI may require virtualization;
- current MCP read tools need bounded alternatives;
- Remotion and dependency security remain explicit risk areas;
- more orchestration logic must maintain strict revision/traceability discipline.

## Required spikes before FREEZE
1. `TVE-SPIKE-LF-001` — real 30-minute/300-clip runtime/cache/jobs.
2. `TVE-SPIKE-UI-300` — timeline UI responsiveness/trace.
3. `TVE-SPIKE-MCP-CONTEXT` — bounded long-form context read model.
4. `TVE-SPIKE-VI-STT` — Vietnamese transcription + edit timing quality.
5. `TVE-SPIKE-DEPSEC-001` — dependency reachability/remediation.

A failed spike may amend or supersede this ADR before freeze.

## ADR acceptance
Research evidence supports this decision strongly enough to proceed to a living design and conditional audit. **This ADR does not set `IMPLEMENTATION_ALLOWED=true`.** Production code remains forbidden until `TVE-FRZ-001` PASSes.

## Evidence inputs
- `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`
- `docs/research/SYNTHCUT_BASE_REPO_AUDIT_V1.md`
- `docs/research/RESEARCH_EVIDENCE_V1.md`
- `docs/research/REPO_TECH_COMPARISON_V1.md`
- local baseline smokes described in research evidence

## Amendment A-001 — Windows long-form command-size boundary
Evidence from the premature `TVE-SPIKE-LF-001` run adds a concrete constraint to D-004/D-005.

Observed behavior:
- 30-minute 1080p30 source imported and ~301 clips saved/loaded successfully;
- first segmented preview failed at process launch with Windows `ENAMETOOLONG` because the generated FFmpeg command repeated hundreds of clip inputs even for a localized segment.

Decision refinement:
- retain FFmpeg and SynthCut base;
- segment/range render execution must construct a **bounded command graph for the requested render window** rather than forwarding the entire 300-clip staged set into each segment command;
- repeated source media should not expand process arguments linearly when the render window touches only a bounded subset;
- Windows command/process limits are a first-class architecture constraint;
- a corrected disposable LF POC must demonstrate a bounded command path before Freeze.

This amendment does not authorize production code. It narrows the hypothesis to be proven by `TVE-SPIKE-LF-001` when DESIGN re-authorizes it.


## Amendment A-002 — Bounded long-form A/V render architecture accepted at POC level
`TVE-SPIKE-LF-001` has completed and PASSed every fixed long-form DESIGN gate. This supersedes the uncertainty in A-001 while preserving its Windows command-size constraint.

Measured evidence:
- 30-minute / ~300-clip project save/load PASS;
- bounded local segment: 300 staged clips reduced to the intersecting dependency set (1 clip in the proof window);
- whole preview exact 1800 s at 720p30;
- localized edit preserved 299/300 segment keys (99.67% reusable);
- unchanged remote frame required 0 new segment renders and hit cache;
- 20 edit/verify cycles ended at 1.0451x post-warm RSS baseline;
- background export control returned in ~1.71 ms, emitted progress and canceled cleanly;
- final export verified independently by ffprobe: 1800.000000 s, 1920x1080, 30 fps, H.264 + AAC;
- generated segment commands stayed bounded at max 3 inputs / ~1,583 approximated characters.

Decision refinement for D-004/D-005/D-014:
1. Keep FFmpeg and the single authoritative SynthCut timeline.
2. Long-form preview/final execution must be **segment/window bounded** by intersecting media dependencies, not total project clip count.
3. Segment video may be encoded/cacheable independently and concatenated losslessly.
4. Segment audio must avoid accumulated lossy-codec priming/padding. The accepted POC path renders bounded segment audio as PCM, concatenates PCM losslessly, and encodes AAC **once** at final mux.
5. Final delivery remains one timeline-derived MP4; segmentation is an execution/cache detail, never separate edit truth.
6. Bounded export must remain inside the existing observable/cancelable JobManager contract.
7. These are architecture decisions proven by disposable POC only; production source changes still require Freeze + PLAN IMPLEMENTATION PASS.

Evidence: `docs/evidence/spikes/TVE-SPIKE-LF-001.md`.

## Amendment A-003 — Derived Tang metadata persistence
Decision for the pre-Freeze persistence question: use a **project-adjacent rebuildable sidecar**, not a new authoritative field inside upstream `.aive` project state for v1.

Canonical relationship:
- authoritative edit: `<project>.aive`;
- derived Tang sidecar: `<project>.tang.json` beside the `.aive` file.

Minimum sidecar envelope to freeze:
- `schemaVersion`;
- `coreProjectId`;
- `basedOnRevision` (the authoritative core project revision/index revision the metadata was derived from);
- `updatedAt`;
- optional brief/project intent;
- chapter/scene/beat/read-model indexes;
- analysis summaries;
- AI batch audit/checkpoint/evidence references that are safe to rebuild or invalidate.

Invariants:
- sidecar is never render/edit truth and must not directly contain an independently mutable shadow timeline;
- loss/corruption of sidecar must not corrupt `.aive`; it can be regenerated;
- when core revision/recovery truth conflicts with sidecar, core wins and derived data is invalidated/rebuilt;
- no sidecar record may authorize mutation against a stale core revision;
- schema migration/version validation must fail safely;
- sidecar implementation is deferred to a frozen implementation task.

Rationale: current `EditorEngine.save/load` owns `.aive` schema, migration, dirty/recovery semantics and revision lifecycle. Keeping orchestration/read metadata adjacent minimizes upstream schema coupling while preserving one authoritative edit state.


## Amendment A-004 — Safe coherent AI batch = revision guard + durable checkpoint + audit
`TVE-SPIKE-SAFE-BATCH-001` closes the remaining safe-mutation feasibility question.

Decision:
- every coherent/risky AI batch carries project identity + `basedOnRevision`;
- stale revision rejects before mutation;
- write a durable pre-batch `.aive` checkpoint before the first mutation;
- record ordered operation audit entries and revision-after values;
- stop immediately on mid-batch failure;
- use the known checkpoint as the explicit restore/recovery boundary;
- never call this database-style ACID atomicity: the frozen design is **checkpoint-backed recoverability**;
- batch audit/checkpoint references may be indexed in the derived Tang sidecar, but `.aive` remains authoritative edit truth.

POC evidence on the 310-clip long-form fixture:
- stale expected revision rejected with zero mutation;
- forced failure after two real mutations restored normalized pre-batch state equivalently;
- measured restore path ~8.18 ms in the POC;
- success path produced two completed operation audit records;
- pre-batch checkpoint also restored the successful batch explicitly when requested;
- production source diff for `packages/core apps src` remained empty.

Evidence: `docs/evidence/spikes/TVE-SPIKE-SAFE-BATCH-001.md`.

This amendment proves architecture feasibility only. Production batch APIs/tooling remain Phase 6 work after Freeze + Phase 5 planning.

## Amendment A-005 — Vietnamese STT automated acceptance gate
The v1 personal-use acceptance contract no longer requires mandatory human listening before DESIGN Freeze. AC-18 is revised to an objective automated gate while preserving optional human spot-check QA.

Frozen-candidate automated gate:
- >=10 minutes reference-backed Vietnamese speech;
- multilingual Whisper only with explicit `language=vi`;
- normalized WER <=20%;
- deterministic frozen rare/key-token recall >=75%;
- p95 utterance-end timing error <=1.5 s with every sampled timing finite and within utterance duration;
- 20/20 deterministic cut-boundary samples resolve fail-closed under a breathing-room policy that retains >=120 ms guard on each side when a cut is performed; insufficient gaps become NOOP/review-needed rather than forced cuts;
- throughput and peak memory recorded.

Human listening remains optional spot-check evidence and may reopen the requirement if contradictory runtime evidence appears. Existing `small` and `large-v3-turbo` model benchmarks remain valid and must not be rerun solely because this acceptance protocol changed.
