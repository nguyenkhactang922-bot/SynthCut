# TVE-SPIKE-MCP-CONTEXT — Bounded Long-Form Reasoning Evidence

Status: PASS FOR SPIKE HYPOTHESIS
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Nature: disposable data/read-model prototype only; no production editor code.

## Hypothesis
A derived PROJECT -> CHAPTER -> RANGE/TRANSCRIPT-WINDOW read model can keep ordinary long-form MCP payloads bounded while resolving edits with the same clip/frame precision as full state, and revision preconditions can fail closed against stale plans.

## Fixture
Synthetic but target-shaped long-form project:
- 30:00 total duration;
- 30 fps;
- 300 sequential clips, each 6 s;
- one authoritative source asset mapped continuously through all clips;
- 6,000 word-level transcript entries;
- 900 transcript segments;
- 6 chapters, each 5 minutes / 50 clips;
- project revision = 7.

The prototype did **not** create a second timeline. Chapters and transcript windows referenced the same authoritative clip IDs/frame ranges.

## Baseline whole-state payloads
Serialized UTF-8 JSON:
- whole transcript: **415,761 bytes**;
- whole 300-clip timeline fixture: **44,586 bytes**.

This confirms the research concern: repeatedly returning the whole transcript is materially more expensive than localized reads.

## Bounded read prototype
Conceptual read surfaces exercised:
- `projectOverview()` — compact project/revision/chapter index;
- `inspectRange(startFrame,endFrame)` — clips + transcript segments intersecting a selected range;
- `getTranscriptWindow(centerWord,radius)` — bounded numbered word context;
- `searchTranscript(query)` — locate first, expand second;
- source-time -> authoritative clip/timeline-frame resolver;
- `guardPlan(plan,currentRevision)` — stale revision fail-closed.

### Measured payloads
Audit threshold: **65,536 bytes (64 KiB)** per ordinary read.

Results:
- project overview: **985 bytes**;
- 5-minute chapter inspection (50 clips + 150 transcript segments): **18,728 bytes**;
- 101-word transcript window: **6,127 bytes**;
- flow-A search hit: **111 bytes**;
- flow-C search hit: **109 bytes**.

All ordinary bounded read payloads were well below the 64 KiB gate.

## Representative flow A — find spoken section and cut
Query: `noi-dung-quan-trong`.

Result:
- word index: 3500;
- source time: 1050.000 s;
- bounded transcript window: 101 words;
- resolved authoritative clip: `clip-176`;
- resolved timeline frame: **31,500**;
- source frame: **31,500**.

A reference resolver that scanned the complete clip set produced the exact same clip ID/track/frame result.

Candidate edit plan used only the search hit + bounded word window + resolved frame target; it did not serialize/fetch the whole transcript.

## Representative flow B — inspect/refine a chapter
Selected `chapter-4`:
- exact chapter range from overview;
- 50 intersecting clips;
- 150 bounded transcript segments;
- serialized inspection payload: **18,728 bytes**.

This demonstrates that a five-minute reasoning scope can remain comfortably below the default payload limit without fragmenting the underlying project.

## Representative flow C — locate concept and place B-roll
Query: `minh-hoa-san-pham`.

Result:
- word index: 4800;
- source time: 1440.000 s;
- resolved authoritative clip: `clip-241`;
- resolved timeline frame: **43,200**;
- proposed B-roll operation: `add_clip` on overlay track at frame 43,200.

The bounded resolver and full-state reference resolver matched exactly.

## Stale revision behavior
Plan created at revision 7:
- against current revision 7 -> allowed;
- against current revision 8 -> **blocked** with `stale_project_revision`, expected=7, actual=8.

Result: stale-plan fail-closed behavior is feasible without a shadow timeline.

## Threshold evaluation
1. Default bounded reads <=64 KiB — **PASS**.
2. Three representative tasks without whole-transcript fetch after indexing — **PASS**.
3. Returned targets resolve deterministically to clip IDs/frame ranges — **PASS**.
4. Stale project revision prevents plan application — **PASS**.
5. No edit-target precision loss vs full-state resolver for tested flows — **PASS**.

## Architecture consequence
The spike supports ADR-001 and the living design:
- retain the flat SynthCut `Project` as edit truth;
- add a revision-aware derived chapter/index read model;
- add bounded overview/range/transcript-window tools;
- use `index -> locate -> expand -> edit` as the default long-form reasoning pattern;
- attach `projectId + revision` to plans and read responses;
- resolve every mutation back to current core clip IDs/frames before apply.

No evidence supports splitting a 30-minute project into independent timeline files.

## Recommended frozen API shape (conceptual, not implementation)
Ordinary read surface should include equivalents of:
- `project_overview()`;
- `inspect_range({startFrame,endFrame,...detailFlags})`;
- `inspect_chapter({chapterId,...detailFlags})`;
- `get_transcript_window({assetId,centerWord|start/end time,contextLimit})`;
- existing search/locate operations reused beneath them.

Every response should include at least project identity/revision or an equivalent state token so a later mutation can detect staleness.

## Limitations
This was a **data/read-model feasibility spike**, not a production MCP implementation or transport benchmark. It proves the payload/precision/revision architecture can meet the fixed gates on a target-shaped fixture. Production implementation must later expose these semantics through normal traced MCP/RPC code and re-run integration tests after FREEZE.

## Prototype cleanup
The disposable prototype lived only under `.spike-temp/context-spike.mjs`. It must be deleted after this evidence is written and cannot be promoted silently.

## Verdict
PASS.

The bounded-context architecture is viable and does not require changing the authoritative SynthCut EDL.
