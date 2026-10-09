# Tang AI Video Editor — Living Design

Status: FROZEN — TVE-FRZ-001 PASS (2026-10-07)
Canonical design document. Later design changes update this file instead of creating competing specifications.
Date: 2026-10-06
Base: SynthCut `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
ADR: `docs/adr/ADR-001_BASE_ARCHITECTURE.md`

---

## 1. Product intent
Build a personal Windows-first AI-native long-form video editor by extending SynthCut, where:
- footage remains local;
- source media is never destructively changed;
- ChatGPT-compatible MCP is the primary high-level operator;
- the desktop timeline remains a first-class human review/edit surface;
- both human and AI mutate one authoritative core project;
- a 30-minute YouTube-style project and/or an ordered 200–300-shot rough cut are first-class targets;
- final render is local and does not require CapCut.

The differentiator is **long-form editorial reasoning + safe execution + verification**, not rebuilding basic NLE mechanics.

---

## 2. Design principles

### P-01 — One edit truth
`SynthCut Project` is the only authoritative edit state. No AI-only shadow timeline.

### P-02 — Non-destructive by default
Assets remain immutable. Timeline clips reference source ranges.

### P-03 — Index, locate, expand, edit
Long-form AI never needs the whole transcript/timeline injected repeatedly. It first uses compact indexes/search, then expands only relevant ranges.

### P-04 — Plan before mutation
Coherent AI edit batches have an explicit plan, precondition revision, validation/dry-run where applicable, then mutation.

### P-05 — Verify rendered truth
Structural state proves what commands did; rendered frames/preview/audio prove what the audience will see/hear.

### P-06 — Extension over rewrite
Preserve upstream subsystems unless measured spike evidence demonstrates a blocker.

### P-07 — Long work is observable work
Transcription, proxies, indexing, preview/export and other expensive operations use stable jobs/progress/cancel semantics.

### P-08 — No silent stale edits
Plans derived from an old project revision cannot silently apply to a changed project.

### P-09 — Evidence is part of completion
Every frozen requirement later maps to implementation, test and evidence.

---

## 3. System context

```text
┌──────────────────────────────────────────────────────────────────┐
│ ChatGPT / MCP-capable client                                     │
│ - receives user creative brief                                   │
│ - reasons over bounded project evidence                          │
└──────────────────────────┬───────────────────────────────────────┘
                           │ MCP
                           v
┌──────────────────────────────────────────────────────────────────┐
│ Tang Long-Form Orchestration Layer                               │
│                                                                  │
│ Brief / Acceptance Interpreter                                   │
│ Project Index / Chapter / Scene / Beat Read Model                │
│ Context Budgeter / Range Queries                                 │
│ Editorial Planner                                                │
│ Safe Batch Planner / Dry-run / Revision Guard                    │
│ QA / Evidence Coordinator                                        │
│ Operation Audit / Traceability                                   │
└──────────────────────────┬───────────────────────────────────────┘
                           │ validated calls
                           v
┌──────────────────────────────────────────────────────────────────┐
│ SynthCut MCP/RPC + Core — AUTHORITATIVE EDIT STATE               │
│                                                                  │
│ assets / tracks / clips / markers / revision                     │
│ undo/redo / recovery / jobs / cache                              │
│ transcript / silence / scene / visual indexes                    │
└──────────────┬──────────────────┬──────────────────┬──────────────┘
               │                  │                  │
               v                  v                  v
      Electron/React UI        FFmpeg          Optional graphics
      timeline/preview       preview/export       provider
               │                                      │
               └──────────────────┬───────────────────┘
                                  v
                              local media
                                  │
                                  v
                              final MP4

                      OTIO import/export on the side
```

---

## 4. Existing SynthCut subsystems to preserve

### 4.1 Core EDL
Keep:
- `Project`, `Track`, `Clip`, `MediaAsset`, markers;
- integer frame timing;
- immutable source references;
- transitions/effects/keyframes/text/captions/graphics;
- project revision and schema migration.

### 4.2 RPC command registry
Keep one command definition used by both UI and MCP.

Tang high-level tools must resolve to core RPC rather than directly editing serialized project JSON.

### 4.3 FFmpeg execution
Keep:
- preview/export compilation;
- proxy use for preview;
- segment cache;
- final full-resolution source render;
- loudness/export presets;
- background export jobs.

### 4.4 Existing intelligence
Reuse:
- word-level Whisper transcript;
- transcript search and phrase location;
- silence detection;
- scene-change detection;
- visual/perceptual/CLIP search;
- audio sync.

### 4.5 Project safety already present
Reuse:
- undo/redo;
- autosave/recovery;
- job cancel;
- source non-destruction.

### 4.6 Interchange
Keep OTIO import/export as finishing/handoff boundary.

---

## 5. New Tang layer — responsibilities

The Tang layer is **not a second editor engine**. It adds long-form semantics and safe orchestration.

### 5.1 Brief interpreter
Input example:
> Edit this 30-minute Vietnamese talking-head video for YouTube. Remove filler/dead air without making speech rushed, strengthen the first 30 seconds, add B-roll when concepts need illustration, use restrained keyword captions, keep natural pauses, export 1080p.

Normalized internal brief concept:

```ts
EditorialBrief {
  goal
  audience?
  platform
  targetDuration?
  language
  pacingProfile
  hookPolicy
  transcriptCleanupPolicy
  brollPolicy
  captionPolicy
  audioPolicy
  visualStyle?
  hardConstraints[]
  acceptanceChecks[]
}
```

The brief is planning context, not timeline state.

### 5.2 Project index
Purpose: make a long project navigable without dumping all raw state.

Conceptual model:

```ts
ProjectIndex {
  projectId
  projectRevision
  durationFrames
  fps
  assetSummary[]
  chapterRefs[]
  openRisks[]
  analysisStatus
}

ChapterRef {
  id
  title?
  startFrame
  endFrame
  summary
  sceneRefs[]
  transcriptSpanRefs[]
  keyEntities?
  editorialSignals?
}

SceneBeatRef {
  id
  kind: "scene" | "beat"
  startFrame
  endFrame
  clipIds[]
  sourceAssetIds[]
  summary
  confidence?
}
```

Important: these are references/indexes. Clip placement remains owned by core `Project`.

### 5.3 Index lifecycle
Index is derived and revision-aware:

```text
core project revision R
      ↓
analysis/index build
      ↓
ProjectIndex(projectRevision=R)
      ↓
manual/AI mutation → revision R+1
      ↓
mark affected index ranges stale
      ↓
reconcile/rebuild only affected summaries where practical
```

A stale index may be read for navigation only if marked stale; it cannot authorize a mutation without re-resolution against current core state.

---

## 6. Long-form context/read strategy

### 6.1 Problem
Research measured representative whole-state payloads around:
- ~425.9 KB for 6,000 words + 900 segments;
- ~46.8 KB for 300 clip summary.

Repeatedly returning full state wastes model context and increases stale-state risk.

### 6.2 Target read surfaces
Names are conceptual until spike/freeze.

#### `project_overview`
Returns compact:
- project ID/name/revision;
- duration/fps/canvas;
- asset/track/clip counts;
- chapter IDs/ranges/summaries;
- analysis/index/job status;
- unresolved markers/review notes.

#### `inspect_range`
Input:
- start/end frame or chapter/scene ID;
- requested detail flags.
Returns only clips/transcript/markers/analysis intersecting that range.

#### `get_transcript_window`
Input:
- asset/time/frame/word range;
- before/after context limit.
Returns bounded numbered word timing.

#### search-first tools
Reuse/compose:
- transcript semantic/exact search;
- locate in timeline;
- visual search;
- scene/silence candidates.

Workflow:

```text
project_overview
    ↓
choose chapter / query
    ↓
search / locate
    ↓
inspect_range
    ↓
get transcript window / frames
    ↓
plan edit
```

### 6.3 Context budget
Pre-spike audit fixes the default bounded-read target at **<=64 KiB serialized JSON per ordinary overview/chapter/range/transcript-window call**. Explicit debug/export/full-state calls may exceed this only when intentionally requested.

Design invariant: no default read operation should require returning the entire long-form transcript merely to perform one localized edit. `TVE-SPIKE-MCP-CONTEXT` must prove three representative edits can use bounded reads without loss of frame/clip precision.

---

## 7. Editorial planning model

### 7.1 Hierarchy

```text
PROJECT
  └─ CHAPTER
      └─ SCENE / NARRATIVE BEAT
          └─ EDIT ACTION
```

This hierarchy is for reasoning and traceability.

### 7.2 Project pass
Decisions:
- objective and audience;
- target runtime envelope;
- global hook/story shape;
- chapter ordering;
- pacing profile;
- visual/audio/caption style rules;
- preserve/remove constraints.

### 7.3 Chapter pass
Decisions:
- purpose in narrative;
- strongest opening/closing beat;
- redundancy/removal candidates;
- B-roll opportunities;
- pacing variation;
- chapter-local QA.

### 7.4 Scene/beat pass
Decisions become concrete frame/clip operations:
- trim/ripple ranges;
- reorder/insert;
- B-roll overlay;
- zoom/keyframes;
- text/caption emphasis;
- J/L audio cuts;
- transition/color/music operations.

### 7.5 Rough-cut from 200–300 generated shots
Preferred input remains individual ordered clips plus timeline assembly, not an early flattened MP4.

Benefits:
- `SHOT_143` remains replaceable;
- timing can be shortened without scene detection to rediscover cuts;
- source provenance remains intact;
- targeted re-render and QA are easier.

If the user provides only one flattened rough-cut MP4, scene/transcript analysis reconstructs chapter/scene references over source time.

---

## 8. Edit plan and safe mutation

### 8.1 Plan envelope
Conceptual schema:

```ts
EditPlan {
  planId
  projectId
  basedOnRevision
  briefId?
  scope: { startFrame, endFrame } | { chapterId }
  operations[]
  expectedEffects
  qaChecks[]
  riskLevel
}

PlannedOperation {
  id
  rpcMethod
  params
  rationale
  affectedRangeEstimate
  evidenceRefs[]
}
```

### 8.2 Precondition
Before apply:
- current project ID matches;
- current revision matches `basedOnRevision`, or plan is re-resolved/revalidated;
- referenced clip/asset IDs still exist;
- frames/ranges remain legal;
- no protected/locked human review condition is violated.

### 8.3 Dry-run
For risky or multi-operation batches, a dry-run should:
- validate schemas;
- resolve references against the current core revision;
- predict changed tracks/clips/ranges;
- detect collisions/illegal transitions/removed referenced ranges;
- return a concise diff without committing.

The frozen candidate keeps dry-run at orchestration level unless implementation evidence later justifies a new core simulation primitive.

### 8.4 Checkpoint / recoverable boundary
Before every coherent/risky AI batch:
- compare project identity + current revision to the plan precondition;
- write a durable pre-batch `.aive` checkpoint before the first mutation;
- associate checkpoint with batch/plan ID and revision;
- keep the checkpoint until success/failure handling and required QA complete.

`TVE-SPIKE-SAFE-BATCH-001` demonstrated stale rejection with zero mutation and checkpoint-backed restoration after a forced failure following two real mutations. Restore-equivalent state was verified on a 310-clip fixture.

This is **checkpoint-backed recoverability**, not database ACID. The product must not claim stronger atomicity than implemented.

### 8.5 Apply / failure policy
Operations execute through validated core RPC/engine operations only.

Apply rules:
- recheck revision immediately before mutation;
- append an audit entry for each attempted/applied operation;
- on mid-batch failure, stop remaining operations and expose the exact failed operation/error;
- restore the durable pre-batch checkpoint automatically for batches whose frozen policy requires all-or-recover, or expose an explicit restore action if later task policy chooses human review first;
- after restore, resolve subsequent work against the new current revision rather than reusing stale plan tokens.

### 8.6 Audit record
Each applied batch records conceptually:

```ts
EditBatchRecord {
  batchId
  planId
  projectRevisionBefore
  projectRevisionAfter
  startedAt
  endedAt
  operations[]
  changedClipIds[]
  affectedFrameRanges[]
  qaEvidence[]
  status
  rollbackRef?
}
```

This is evidence/traceability metadata, not a competing project state.

---

## 9. Human + AI concurrency

### 9.1 Threat
User may manually edit while AI is reasoning/applying a batch.

### 9.2 Required safeguards
Before freeze, design must guarantee:
- revision-based stale-plan detection;
- no silent apply against stale project;
- multi-operation atomic/protected batch semantics where needed;
- explicit conflict response;
- clear UI indication/log of AI edits;
- rollback path.

### 9.3 History lock concept
Inspired by WeftCut, an AI batch may temporarily protect undo/history interleaving. This must be narrowly scoped and visible, never a permanent lock.

---

## 10. Media analysis pipeline

### 10.1 Import
`import_video` probes source; source path remains immutable.

### 10.2 Proxy
Large/4K source may create preview proxy. Final export always resolves original full-resolution source.

### 10.3 Speech index
For speaking assets:
- choose language/model explicitly;
- transcribe once and cache segment + word timing;
- derive searchable transcript spans.

### 10.4 Silence
Use silence detection as candidate boundary, not automatic semantic truth.

### 10.5 Scene changes
Use scene-change detection as natural visual cut candidates/index boundaries.

### 10.6 Visual index
Use current perceptual/CLIP search to locate relevant B-roll/shots. Add higher-level scene tags only as derived metadata.

### 10.7 Future speaker intelligence
Diarization may become an optional analysis provider. It must output normalized local ranges/speaker IDs/confidence. It never edits the timeline directly.

---

## 11. Vietnamese transcription policy

Current upstream defaults are unsuitable for Vietnamese (`base.en`, language `en`).

### Frozen v1 policy
When project language is Vietnamese:
- never select an `.en` Whisper model;
- call transcription with `language="vi"`;
- use multilingual `large-v3-turbo` as the accepted edit-grade default under AC-18;
- `small` is not an accepted default because its measured WER failed the frozen gate.

### Quality dimensions for spike
- lexical accuracy on reference-backed Vietnamese speech;
- deterministic frozen rare/key-token retention;
- timestamp monotonicity, in-range integrity and practical utterance-end timing error;
- throughput/memory for long-form;
- deterministic cut-boundary safety under a fail-closed breathing-room resolver.

### Safety
Transcript-based deletions use >=120 ms retained guard on each side when a cut is performed. If a candidate gap cannot preserve that guard, the resolver returns NOOP/review-needed instead of forcing a cut. Rendered preview/audio QA remains part of production verification. Human listening is optional spot-check QA, not a DESIGN Freeze prerequisite for v1.

---

## 12. Long-form render and cache design

### 12.1 Existing cache
Preview segments are approximately 2–10 seconds and keyed by intersecting pixel dependencies. This is retained.

### 12.2 Frozen-candidate long-form behavior
A localized edit must:
- invalidate only segment(s) whose intersecting render dependencies changed;
- preserve unrelated video cache segments;
- support exact remote-frame verification from an unchanged segment without a new video segment render;
- keep each segment/window FFmpeg process bounded primarily by intersecting content, not total project clip count.

`TVE-SPIKE-LF-001` measured 299/300 unrelated segment keys reusable (99.67%) and 0 new renders / 1 cache hit for an unchanged remote frame after a localized edit.

### 12.3 Bounded A/V preview and final export
The accepted POC architecture is:
1. resolve the current authoritative core timeline;
2. plan bounded timeline segments;
3. for each segment, pass only intersecting dependencies to the render graph;
4. render/cache video segments independently;
5. render segment audio as PCM to avoid per-segment AAC priming/padding;
6. concatenate video losslessly and PCM audio losslessly;
7. encode AAC once at final mux;
8. expose the whole operation through the existing background JobManager progress/cancel contract.

Segmentation is an execution/cache implementation detail only. It never creates chapter timelines or a second edit truth.

Measured POC evidence:
- whole preview: exact 1800 s, 1280x720/30fps H.264+AAC;
- final export: exact 1800 s, 1920x1080/30fps H.264+AAC;
- max generated segment command: 3 inputs / ~1,583 approximated characters;
- 20 edit/verify cycle RSS ratio: 1.0451x;
- background cancel/control gate PASS.

### 12.4 Chapter QA vs chapter render
Chapters are reasoning/QA scopes. They are **not** separate authoritative timeline files.

Scoped chapter/range preview is allowed only as a view/render of the same current core project and must preserve the bounded execution invariant above.

### 12.5 Spike result
`TVE-SPIKE-LF-001` = **PASS FOR SPIKE HYPOTHESIS**. Evidence: `docs/evidence/spikes/TVE-SPIKE-LF-001.md`. Production implementation remains forbidden until Freeze + Phase 5 PASS.

---

## 13. Timeline UI scale

### 13.1 Known implementation
Current timeline renders clip and element blocks for all rows without viewport virtualization.

### 13.2 Preferred remediation if spike fails
First-line change:
- horizontal time-window virtualization/culling;
- render clip blocks only when intersecting visible viewport + buffer;
- cache/simplify snap indexes rather than walking every clip on every interaction;
- keep authoritative core project unchanged.

Second-line options only if needed:
- workerize heavy geometry/index computation;
- GPU/WebCodecs/native decode preview changes behind adapters.

No UI rewrite is authorized pre-spike.

---

## 14. Preview and verification loop

### 14.1 Verification classes

**Structural**
- timeline summary/range state;
- clip/range existence;
- project revision;
- expected duration and track placement.

**Visual**
- `get_frame` / `inspect_timeline` exact composited rendered frames;
- color scopes where relevant.

**Motion/audio**
- scoped/full `render_preview` watched/auditioned;
- transcript/caption alignment checks;
- loudness/audio integrity.

**Delivery**
- final export exists;
- ffprobe/container/codec/resolution/fps/duration/audio stream checks;
- representative visual/audio QA after export.

### 14.2 Batch policy
After a coherent batch:
1. structural check;
2. rendered frame(s) at affected ranges;
3. preview for timing/audio-sensitive edits;
4. correct or accept;
5. append evidence.

---

## 15. Editorial brain behavior

The editor brain adds craft, not just commands.

### 15.1 Hook engine
Evaluate first 15–30 seconds for:
- immediate promise/value;
- redundant greeting/context;
- strongest available statement/visual;
- curiosity/open loop;
- mismatch with video payoff.

### 15.2 Narrative engine
Maintain:
- premise;
- question/problem;
- progression;
- payoff;
- chapter continuity;
- no duplicated explanation.

### 15.3 Pacing engine
Use content-aware cadence:
- remove dead air but retain natural breath;
- vary shot length;
- do not jump-cut every sentence uniformly;
- allow important emotional/explanatory beats to land.

### 15.4 Retention signals
Flag, do not blindly cut:
- repeated point;
- long setup before payoff;
- visually static stretch;
- off-topic branch;
- unsupported abstraction needing B-roll/graphic;
- excessive CTA/interruption.

### 15.5 B-roll planner
B-roll is used to:
- illustrate nouns/actions/places/products;
- hide jump cuts;
- reset visual attention;
- explain abstract concepts.

It should not cover the speaker constantly.

### 15.6 Caption planner
Long-form default is restrained:
- sidecar captions can be primary YouTube accessibility deliverable;
- burned-in text reserved for emphasis/quotes/important labels unless brief asks full social captions.

### 15.7 Audio planner
Priorities:
1. intelligible speech;
2. natural room tone/cut continuity;
3. music under dialogue with ducking;
4. sound effects only where meaningful;
5. platform loudness normalization at export.

---

## 16. Motion graphics provider

### 16.1 Requirement
Baseline editor does not depend on motion graphics to function.

### 16.2 Provider concept

```ts
MotionGraphicsProvider {
  render(spec, canvas, fps, signal) -> {
    assetPath,
    durationFrames,
    alphaMode,
    providerMetadata
  }
}
```

Current provider: Remotion path already present in SynthCut.

### 16.3 Failure containment
A failed graphic render must not corrupt timeline state. Existing SynthCut already renders before adding the graphic; preserve that principle.

---

## 17. Jobs and operational model

Use stable local jobs for expensive work:
- transcription;
- proxy generation;
- visual indexing;
- stabilization/reframe;
- preview/export;
- motion graphic render.

Required fields conceptually:
- job ID;
- type;
- project/revision/scope where relevant;
- progress;
- status;
- result/error;
- cancel.

ChatGPT may poll/observe; it does not assume a lost chat stream means the local job died.

---

## 18. Project persistence and recovery

### 18.1 Authoritative save
Continue `.aive` project save/load and schema migration.

### 18.2 Derived Tang metadata — persistence decision
For v1, derived Tang orchestration/read metadata persists in a **project-adjacent sidecar** named `<project>.tang.json` beside the authoritative `<project>.aive` file. It does not extend the upstream `.aive` schema before there is evidence that tighter coupling is necessary.

Minimum envelope:
- `schemaVersion`;
- `coreProjectId`;
- `basedOnRevision`;
- `updatedAt`;
- optional brief/project intent;
- chapter/scene/beat/read-model indexes;
- analysis summaries;
- AI batch audit/checkpoint/evidence references.

Invariants:
- `.aive` remains the sole render/edit truth;
- the sidecar is derived and rebuildable; deletion/corruption cannot corrupt the edit;
- sidecar data derived from a stale/incompatible core revision is invalidated, never used to authorize mutation;
- recovered/newer core state always wins;
- sidecar schema migration/version validation fails safely;
- no shadow timeline is stored as independently mutable truth.

ADR basis: Amendment A-003 in `ADR-001_BASE_ARCHITECTURE.md`. Production implementation is deferred until Freeze + Phase 5 PASS.

### 18.3 Recovery
Core crash-recovery remains authoritative for unsaved timeline work. Tang metadata must never override a newer recovered core revision.

---

## 19. Security design

### 19.1 Local does not mean trustless
Attack surfaces include:
- MCP calls;
- local paths/imported files;
- downloaded models/binaries;
- Electron/file serving;
- motion code;
- transitive npm dependencies.

### 19.2 Freeze requirements
- no unreviewed critical production vulnerability;
- document reachable critical/high findings;
- upgrades/regressions tested;
- no arbitrary project JSON writes by AI;
- path/file endpoints remain constrained;
- motion graphics execution remains sandboxed/constrained according to provider capability;
- external downloads are explicit/cached/versioned where practical.

### 19.3 Current dependency risk
Research baseline initially contained 15 production findings (5 moderate / 9 high / 1 critical), including the MCP SDK/Express `proxy-addr` chain.

`TVE-SPIKE-DEPSEC-001` proved a **non-force, lockfile-only** candidate that reached `npm audit --omit=dev = 0` and passed build/typecheck/core security regression checks. The candidate was intentionally restored after the DESIGN spike and must be reapplied only as a traced production hardening task after Freeze + Phase 5 PASS.

The remaining full-audit findings are confined to the development/packaging chain centered on `electron-builder`; they are tracked for installer hardening before installer MAIN VERIFIED and are not treated as an unreviewed production-runtime critical.

---

## 20. License/provenance design

Current personal-use target permits continuing with SynthCut GPL base and current Remotion terms.

Rules:
- preserve upstream copyright/license files;
- retain third-party notices;
- direct code copied from noncommercial ai-video-editor must be explicitly identified/provenanced; default to independent implementation from architectural concepts;
- MIT/Apache copied/adapted code retains required notices;
- future commercial/distribution goal triggers a new license ADR/review.

---

## 21. Observability and evidence

Each AI batch should eventually emit enough metadata to answer:
- what brief/plan caused this edit?
- which project revision did it start from?
- which RPC calls changed what?
- what frame ranges were affected?
- what test/QA artifact verified it?
- what revision resulted?
- how can it be rolled back?

This supports both debugging and final requirement traceability.

---

## 22. Failure handling

### Stale plan
Fail closed -> re-read current revision/range -> regenerate/revalidate plan.

### Invalid operation
No mutation if dry-run/schema/invariant fails; return precise cause.

### Partial multi-operation failure
Target design: rollback to batch checkpoint or clearly expose partial state and recovery action. Exact transaction semantics require audit/spike choice.

### Render failure
Keep project edit state; report underlying FFmpeg/provider error; retry only after cause changes.

### Missing media
Preserve offline placeholder/relink semantics; do not silently drop clips.

### Job interrupted
Read actual job/process/recovery state; do not equate lost chat stream with dead local process.

---

## 23. Acceptance criteria mapping — design coverage

| Requirement | Design mechanism | Pre-freeze proof |
|---|---|---|
| AC-01 non-destructive import | existing MediaAsset + EDL | upstream/core test evidence |
| AC-02 same UI/MCP state | same RPC/core boundary | code + MCP smoke |
| AC-03 word timing | Whisper full transcript words | Vietnamese spike for target language |
| AC-04 silence/scene cuts | existing analysis tools | baseline tests + long-form policy |
| AC-05 NLE capabilities | existing SynthCut core/UI | full smoke suite later |
| AC-06 30-min proxy/full-res | proxy + full-source export | LF spike |
| AC-07 observable long render | jobs/progress/cancel | LF/jobs test |
| AC-08 incremental cache | intersecting segment cache | cache smoke + LF spike |
| AC-09 AI verify | rendered frame/preview loop | MCP/toolsurface + E2E later |
| AC-10 save/load/recovery | existing project/recovery | jobs/recovery tests |
| AC-11 200–300 clips/no flatten | flat core + long-form index | UI/LF spikes |
| AC-12 YouTube MP4 | export preset/FFmpeg | final E2E |
| AC-13 traceability | batch/evidence + final audit | final traceability audit |
| AC-14 bounded long-form reads | revision-aware read model | MCP-CONTEXT spike PASS |
| AC-15 stale-plan guard | project/revision precondition | MCP-CONTEXT spike PASS; production integration later |
| AC-16 recoverable AI batch | pre-batch `.aive` checkpoint + revision guard + ordered audit + rollback/recovery | `TVE-SPIKE-SAFE-BATCH-001` PASS |
| AC-17 300-clip UI | viewport culling/virtualization | UI-300 spike PASS |
| AC-18 Vietnamese STT | multilingual model + explicit `vi` + automated quality/safety gate | VI-STT automated validator + retained model benchmark evidence |
| AC-19 no required CapCut runtime | local SynthCut/Tang import→edit→preview→export path | LF/core evidence + final implementation E2E later |
| AC-A01 reuse strengths | extension-first ADR | code review/final audit |
| AC-A02 one source truth | core `Project` only | architecture invariant |
| AC-A03 frame determinism | frame boundary | tests/invariants |
| AC-A04 licenses | research/ADR/provenance | freeze checklist |
| AC-A05 no code before freeze | lifecycle gate | Git/state audit |
| AC-A06 bounded spikes | spike lane | spike evidence |
| AC-A07 derived hierarchy only | `<project>.tang.json` sidecar, revision-aware/rebuildable | ADR A-003 + design invariant |
| AC-A08 dependency integrity | constrained dependency remediation | DEPSEC spike PASS |
| AC-A09 POC non-promotion | `.spike-temp` evidence only | Git/diff/state audit |

---

## 24. Required spikes and what they may change

### TVE-SPIKE-LF-001
May change:
- cache sizing/segment strategy;
- range-preview API;
- render concurrency/job policy;
- possibly core performance internals.
Must not split source of truth without a new ADR.

### TVE-SPIKE-UI-300
May change:
- timeline viewport virtualization;
- snap indexing;
- component memoization/workerization;
- preview adapter only if evidence requires it.

### TVE-SPIKE-MCP-CONTEXT
May change:
- exact read-tool API;
- index granularity;
- payload thresholds;
- cached chapter summaries.

### TVE-SPIKE-VI-STT
May change:
- default Vietnamese model;
- language/model selection policy;
- transcript padding/cut policy.

### TVE-SPIKE-DEPSEC-001
May change:
- package versions/overrides;
- MCP SDK version;
- specific security mitigations.

---

## 25. Freeze-readiness decision register
1. Derived Tang metadata persistence: **RESOLVED** — `<project>.tang.json` project-adjacent, rebuildable and revision-aware (ADR A-003).
2. Safe coherent AI batch checkpoint/audit/rollback: **RESOLVED AT POC LEVEL** — orchestration-level pre-batch `.aive` checkpoint + revision precondition + ordered audit record rejected stale plans, restored semantic state after forced mid-batch failure, and preserved an explicit recovery path after successful batches. Evidence: `docs/evidence/spikes/TVE-SPIKE-SAFE-BATCH-001.md`.
3. Bounded MCP read budget: **RESOLVED AT POC LEVEL** — ordinary reads <=64 KiB; MCP-CONTEXT PASS.
4. UI 300-clip latency thresholds/path: **RESOLVED AT POC LEVEL** — viewport-culling prototype PASSed the fixed gates.
5. Long-form preview/export/cache thresholds/path: **RESOLVED AT POC LEVEL** — LF-001 PASSed all fixed gates; ADR A-002 records the bounded A/V architecture.
6. Vietnamese multilingual default/model quality: **RESOLVED AT POC LEVEL** — revised automated AC-18 PASS; `large-v3-turbo` accepted as edit-grade default, explicit `language=vi`, 120 ms per-side fail-closed cut guard; evidence: `docs/evidence/spikes/TVE-SPIKE-VI-STT.md` + `.spike-temp/vi-stt/automated-validation.json`.
7. Production dependency reachability/remediation: **RESOLVED AT POC LEVEL** — DEPSEC evidence retained; re-open only if dependency graph changes before Freeze.
8. Speaker diarization: **DEFERRED FROM V1** unless later evidence makes it necessary.

No OPEN/BLOCKED item may be silently waived at Freeze.

---

## 26. Current lifecycle gate

`IMPLEMENTATION_ALLOWED = false`

Current lifecycle step: **PLAN IMPLEMENTATION authorized after TVE-FRZ-001 PASS**. All required DESIGN spikes, including revised automated `TVE-SPIKE-VI-STT`, are reconciled. Architecture + acceptance criteria are frozen by `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`.

Production code remains locked until Dependency Graph → Task Decomposition → Traceability → Production Task Queue all PASS.


---

## 27. Audit-remediated pre-spike gates

`DESIGN_AUDIT_001` fixes these measurable gates before any spike executes. They remain provisional acceptance thresholds until spike evidence is reconciled and `TVE-FRZ-001` freezes them.

### 27.1 Long-form runtime gate
For a 30:00 1920x1080/30fps ~300-clip fixture:
- save and reload <=5 s each after source metadata is available;
- localized <=10 s visual edit after cache warm-up leaves >=90% unrelated video segments reusable;
- unchanged remote `get_frame` requires no new segment video render or equivalent cache-hit path;
- 20 localized edit/verify cycles: no crash and post-warm RSS <=125% of post-warm baseline unless intentional bounded allocation explains growth;
- background export control available <=5 s with progress/cancel;
- one full 30-minute 1080p MP4 export completes and passes ffprobe delivery checks.

### 27.2 UI 300-clip gate
- core-state available -> usable timeline first paint <=5 s;
- scripted 30 s zoom/pan/scrub interaction latency p95 <=100 ms;
- no normal-interaction main-thread task >500 ms;
- ordinary drag/trim commit reflected in authoritative state <=250 ms after release under local RPC conditions;
- no renderer crash/OOM;
- failure requires a disposable viewport-culling/virtualization prototype proving a path to PASS before freeze.

### 27.3 MCP context gate
- default overview/range/transcript-window response <=64 KiB JSON;
- three representative edits complete without fetching the entire transcript after indexing;
- all ranges resolve deterministically to current clip IDs/frames;
- stale revision prevents apply;
- no precision loss versus existing full-state tools for tested tasks.

### 27.4 Vietnamese STT gate
Using >=10 minutes reference-backed Vietnamese speech and 20 deterministic boundary samples:
- multilingual model only; language explicitly `vi`;
- normalized WER <=20%;
- deterministic frozen rare/key-token recall >=75%;
- p95 utterance-end timing error <=1.5 s and every sampled timing finite/in-range;
- 20/20 boundary samples resolve safely under the >=120 ms per-side breathing-room policy; insufficient gaps become NOOP/review-needed, never forced cuts;
- throughput/memory recorded; if highest-accuracy model is impractical, define a two-tier draft/final transcription policy;
- human listening is optional spot-check QA and is not a Freeze prerequisite.

### 27.5 Dependency integrity gate
- zero unreviewed critical production dependency findings;
- every high production finding classified by chain/reachability/path;
- reachable highs fixed or explicitly mitigated/accepted with rationale before freeze;
- changes pass build/typecheck + relevant core/MCP/security smokes;
- no forced mass-upgrade without compatibility evidence.

### 27.6 Safe mutation gate
Before freeze, batch semantics must demonstrate:
- plan carries project revision precondition;
- stale revision fails closed;
- coherent multi-operation batch has a recoverable checkpoint/snapshot/transaction-equivalent boundary;
- operations and affected ranges are auditable;
- rollback/recovery path is explicit;
- spike/prototype implementation cannot silently become production code.

These gates close audit findings F-001..F-006 at the document-design level. Runtime closure still requires their respective spike PASS evidence.

## 28. Windows long-form render command-size constraint

### 28.1 Evidence
A premature 30-minute/~301-clip LF POC assembled, saved and loaded correctly but failed on the first segmented preview with Windows `ENAMETOOLONG`. The render builder supplied hundreds of repeated clip inputs to FFmpeg even for a local segment window.

### 28.2 Design invariant
For any scoped preview/segment render, process arguments and render-graph inputs must be bounded primarily by content intersecting the requested render window, not by total project clip count.

### 28.3 Allowed pre-freeze POC directions
A disposable corrected LF POC may test the smallest safe change, in this preference order:
1. pass only staged clips intersecting the planned segment/window into the segment render builder;
2. additionally deduplicate repeated media inputs where graph semantics permit;
3. only if necessary, use intermediate/concat/filter-script mechanisms to keep Windows process arguments bounded.

Do not replace the authoritative timeline, flatten the project, or rewrite the renderer before these narrow approaches are disproven.

### 28.4 Freeze gate addition
`TVE-SPIKE-LF-001` cannot PASS unless:
- the 30-minute/~300-clip preview path starts without command-size/process-launch failure;
- segment command construction remains bounded for a local window;
- the original LF runtime/cache/memory/jobs/final-export gates still pass.
