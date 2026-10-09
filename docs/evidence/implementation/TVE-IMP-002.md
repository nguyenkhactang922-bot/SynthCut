# TVE-IMP-002 — Bounded project/chapter/range/transcript read model

Status: VERIFIED PASS THROUGH REVIEW
Date: 2026-10-08
Branch: `chatgpt/ai-video-editor-design`
Baseline task-entry HEAD: `12d4f900fc9a3be16b782ce6a1c9f13cbe1bf4a8`
Depends on: `TVE-IMP-001` committed at `622769d`

## Scope implemented

Production scope is limited to the frozen bounded-read model:
- `packages/core/src/tang/read-model.ts`
  - `projectOverview()`
  - `inspectProjectRange()`
  - `inspectChapter()`
  - `transcriptWindow()`
  - current project identity/revision token;
  - stale derived-index marker and mutation-ineligibility;
  - ordinary-response hard budget `64 * 1024` bytes;
  - pagination/truncation instead of whole-state context explosion;
  - current core clip/source-frame resolution; no second timeline.
- `packages/core/src/engine.ts`
  - narrow read-only `getTangMetadataForNavigation()` accessor so stale derived indexes can remain navigational while mutation authority stays fail-closed.
- `packages/core/src/rpc.ts`
  - four read-only RPC methods: `project_overview`, `inspect_range`, `inspect_chapter`, `get_transcript_window`.
- `packages/core/scripts/smoke-tang-read-model.ts`
  - target-shaped 30-minute / 300-clip / 6,000-word / six-chapter deterministic runtime smoke.

No IMP-003 MCP guide/exposure work, EditPlan, batch mutation, viewport, export, or Vietnamese production policy was added in this task.

## Failure / repair history

The first core build failed only on TypeScript optionality for adjustment-layer `Clip.assetId` in the new transcript-range resolver. The first repair reduced the failure to one callback-narrowing error because TypeScript did not retain the property narrow across `forEach`. Final repair caches the guarded value in a local `const assetId` and skips source-less adjustment layers for transcript lookup.

These were compile-time implementation defects isolated to IMP-002. Earlier lifecycle evidence and IMP-001 were not rerun. Superseded build attempts are not counted as PASS evidence.

## Final core build

Command:
`npm.cmd run build --workspace @aive/core`

Final result: PASS, exit code `0`.

## Dedicated bounded-read runtime smoke

Command:
`npx.cmd tsx packages/core/scripts/smoke-tang-read-model.ts`

Final result: PASS, exit code `0`.

Result marker:
`TVE-IMP-002 BOUNDED READ MODEL SMOKE PASSED`

Measured actual serialized JSON sizes using `Buffer.byteLength(JSON.stringify(value), "utf8")`:
- `project_overview`: **2,182 bytes**;
- five-minute `inspect_chapter`: **50,035 bytes**;
- 101-word `get_transcript_window`: **6,392 bytes**;
- localized six-second `inspect_range`: **1,685 bytes**;
- broad whole-project range request after hard-cap/truncation: **65,203 bytes**.

All are <= 65,536 bytes.

Runtime assertions also proved:
- overview reports all **300** authoritative clips by count without dumping all clip state;
- six derived chapter references are visible;
- project identity + current revision are carried in read responses;
- fresh derived chapter index is mutation-eligible only when its revision matches the live project;
- chapter 4 resolves exact range **27,000..36,000** frames and exactly **50** current clips (`clip-151` .. `clip-200`);
- chapter inspection returns only **150** intersecting transcript segments;
- transcript window returns **101** numbered words around word index 3500 while reporting a 6,000-word total;
- localized frame **31,500** resolves current authoritative `clip-176` and exact source-frame mapping at speed=1;
- oversized range requests truncate/page instead of overflowing context and expose a continuation offset;
- after live mutation/revision drift, derived chapter index becomes stale/navigation-only and `indexMutationEligible=false`;
- stale chapter navigation re-resolves against current core clip IDs instead of acting as edit truth.

## Root typecheck

Command:
`npm.cmd run typecheck`

Coverage: core + MCP TypeScript project references, then desktop renderer `tsc --noEmit`.

Final result: PASS, exit code `0`.

## Diff / review verification

Command:
`git diff --check -- packages/core/src/engine.ts packages/core/src/rpc.ts packages/core/src/tang/read-model.ts packages/core/scripts/smoke-tang-read-model.ts`

Result: PASS, exit code `0`, no whitespace errors.

Review findings:
- `.aive` / core `Project` remains sole authoritative edit/render state;
- chapters/readModel remain derived references, not a shadow timeline;
- stale derived indexes remain useful for navigation but explicitly cannot authorize mutation;
- adjustment layers are correctly excluded from asset transcript lookup;
- RPC additions are read-only and bounded;
- broad reads fail bounded through truncation/pagination rather than silently returning oversized payloads;
- implementation does not absorb unrelated `packages/skill-installer/bin/synthcut.mjs` WIP, `.spike-temp/`, or dataset scratch files.

## Acceptance mapping

1. Derived project overview / chapter/index references — PASS.
2. Bounded range inspection — PASS.
3. Bounded transcript-window queries — PASS.
4. Ordinary responses <=64 KiB — PASS on target-shaped runtime fixture, including broad range cap at 65,203 bytes.
5. Localized reads resolve current authoritative clip IDs/frames without full transcript/state dump — PASS.
6. Revision/stale markers are explicit — PASS.
7. Stale index cannot authorize mutation — PASS.
8. Build/typecheck/runtime evidence — PASS.
9. No second timeline / no authority split — PASS.

## Verdict

`TVE-IMP-002` = **VERIFIED PASS THROUGH REVIEW**.

Next lifecycle action: stage/review only the accepted IMP-002 source + smoke + this evidence, commit the task boundary, sync `CURRENT_HANDOFF.md` / `PROJECT_STATE.md` / `tasks/TASK_QUEUE.md`, then evaluate `TVE-IMP-003`. Do not rerun final build/smoke/typecheck unless IMP-002 production source changes.
