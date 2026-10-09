# TVE-PLAN-001 — Production Dependency Graph v1

Status: PASS
Date: 2026-10-07
Frozen baseline: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`
Production source mutation during this planning task: NONE

## Input
- FROZEN brief/definition/ADR/living design.
- all DESIGN POC outcomes.
- current SynthCut source/module layout.
- `docs/TESTING.md` real smoke inventory.

## Entry Gate
- `TVE-FRZ-001 = PASS`.
- Architecture + ACs FROZEN.
- No production task has been claimed yet.
- Existing unrelated WIP must remain untouched.

## Work
Map frozen capabilities into implementation nodes, identify semantic prerequisites, shared-file conflict ordering, integration convergence, and MAIN VERIFIED gate.

## Output — dependency DAG

```text
                         FROZEN DESIGN
                              |
          +-------------------+--------------------+
          |                   |                    |
          v                   v                    v
 TVE-IMP-001            TVE-IMP-007          TVE-IMP-009
 Tang sidecar            UI 300-clip          dependency
 foundation              virtualization       hardening
          |
          +-------------------+
          |                   |
          v                   v
 TVE-IMP-002            TVE-IMP-004
 bounded read model      EditPlan/revision/dry-run
          |                   |
          v                   v
 TVE-IMP-003            TVE-IMP-005
 MCP bounded tools       checkpoint/audit/rollback
          |                   |
          +---------+---------+
                    |
                    v
              TVE-IMP-006
              bounded long-form
              render execution
                    |
                    v
              TVE-IMP-008
              Vietnamese STT +
              fail-closed cut policy
                    |
          +---------+---------+
          |                   |
          v                   v
 TVE-IMP-010            TVE-IMP-011
 editorial orchestration QA/evidence coordinator
          \                   /
           +--------+--------+
                    v
              TVE-E2E-001
       30m/~300 clip integrated proof
                    |
                    v
             MAIN VERIFIED gate
                    |
                    v
          Phase 7 Package/Release
```

## Node definitions / source ownership

### TVE-IMP-001 — Tang metadata sidecar foundation
Purpose: create revision-aware rebuildable `<project>.tang.json` support without changing `.aive` authority.
Candidate source:
- new `packages/core/src/tang/metadata.ts` / related types;
- `packages/core/src/types.ts` only for shared public types if required;
- `packages/core/src/engine.ts` save/open/recovery integration points;
- `packages/core/src/rpc.ts` only for explicit metadata read/status surface if needed.
Blocks: IMP-002, IMP-004.

### TVE-IMP-002 — Bounded project/chapter/range/transcript read model
Purpose: implement <=64 KiB ordinary AI reads and derived hierarchy/index surfaces.
Candidate source:
- new `packages/core/src/tang/read-model.ts`;
- `packages/core/src/rpc.ts` (`timeline_summary` neighborhood / new bounded methods);
- engine/project revision access in `packages/core/src/engine.ts`.
Depends: IMP-001.
Blocks: IMP-003, IMP-010.

### TVE-IMP-003 — MCP bounded tool exposure
Purpose: expose bounded read methods through current single RPC/MCP contract and update operator guidance.
Candidate source:
- `packages/mcp/src/index.ts`;
- `packages/mcp/src/guide.ts`;
- `packages/mcp/src/core-client.ts` only if contract transport needs support.
Depends: IMP-002.
Blocks: IMP-010.

### TVE-IMP-004 — EditPlan + revision precondition + dry-run
Purpose: define deterministic plan envelope, stale revision fail-closed, validation/dry-run result.
Candidate source:
- new `packages/core/src/tang/edit-plan.ts`;
- `packages/core/src/rpc.ts`;
- `packages/core/src/engine.ts` revision/state access.
Depends: IMP-001.
Blocks: IMP-005.

### TVE-IMP-005 — Checkpoint-backed coherent batch/audit/rollback
Purpose: productionize proven safe-batch semantics.
Candidate source:
- new `packages/core/src/tang/batch.ts` / audit types;
- `packages/core/src/engine.ts` save/load/recovery/checkpoint hooks;
- `packages/core/src/rpc.ts` batch methods;
- adjacent Tang sidecar audit/checkpoint refs from IMP-001.
Depends: IMP-004.
Blocks: IMP-006, IMP-010, IMP-011.

### TVE-IMP-006 — Bounded long-form render execution
Purpose: productionize window-intersection render planning, cache locality, PCM audio concat + one AAC mux, observable/cancelable background export.
Candidate source:
- `packages/core/src/engine.ts` preview/export orchestration;
- `packages/core/src/ffmpeg/` render/filter/concat helpers;
- `packages/core/src/jobs.ts` integration only where existing contract needs extension;
- existing cache/render helpers.
Depends: IMP-005 for shared `engine.ts` conflict ordering, not because rendering semantically requires AI batch state.
Blocks: IMP-008, IMP-011, E2E.

### TVE-IMP-007 — 300-clip timeline viewport culling/virtualization
Purpose: productionize proven UI POC without changing core EDL.
Candidate source:
- `apps/desktop/src/timeline.tsx`;
- `apps/desktop/src/styles.css` if needed;
- desktop interaction/snap helpers only when measured.
Depends: FROZEN DESIGN only.
Blocks: E2E.
Can be developed independently from core lane, but integration must converge before E2E.

### TVE-IMP-008 — Vietnamese STT policy + fail-closed transcript-cut resolver
Purpose: explicit multilingual `large-v3-turbo`, `language=vi`, deterministic 120 ms per-side guard / SAFE_NOOP behavior.
Candidate source:
- `packages/core/src/whisper/transcribe.ts`;
- transcription/edit RPC handlers in `packages/core/src/rpc.ts`;
- new small policy/helper module under `packages/core/src/tang/` or `whisper/`;
- bundle/model preparation later only if required by packaging.
Depends: IMP-006 for shared core integration ordering.
Blocks: IMP-010, IMP-011, E2E.

### TVE-IMP-009 — Dependency hardening promotion
Purpose: apply the non-force dependency remediation proven by DEPSEC POC.
Candidate source:
- `package-lock.json` and minimal manifest override/version changes only as required by the POC decision.
Depends: FROZEN DESIGN only.
Blocks: final integration verification / MAIN VERIFIED.
Must not use blind forced major upgrade.

### TVE-IMP-010 — Tang editorial orchestration contract
Purpose: make ChatGPT/MCP operate long-form as PROJECT→CHAPTER→SCENE/BEAT→EDIT ACTION using bounded reads, safe EditPlan batches, hook/narrative/pacing/retention/B-roll/caption/audio policy.
Candidate source:
- `packages/mcp/src/guide.ts` / prompt/tool guidance;
- bounded RPC/MCP surfaces from IMP-002/003;
- plan/batch surfaces from IMP-004/005;
- optional new `packages/mcp/src/tang/` pure orchestration helpers where deterministic normalization is useful.
Depends: IMP-003, IMP-005, IMP-008.
Blocks: IMP-011, E2E.

### TVE-IMP-011 — QA/evidence coordinator
Purpose: standardize structural → rendered frame → preview/audio → delivery verification and durable batch evidence.
Candidate source:
- core/MCP orchestration around existing `inspect_timeline`, `get_frame`, `render_preview`, export/jobs;
- new Tang evidence record helpers where required;
- `packages/mcp/src/guide.ts` for operator contract.
Depends: IMP-005, IMP-006, IMP-008, IMP-010.
Blocks: E2E.

### TVE-E2E-001 — Integrated frozen-requirement proof
Purpose: prove final production implementation on one shared authoritative timeline.
Scope:
- local import/save/load/recovery;
- 30-minute/~300 clips;
- bounded AI reads;
- revision/stale-plan rejection;
- coherent batch checkpoint/rollback;
- viewport-culling UI;
- Vietnamese `large-v3-turbo` policy + fail-closed transcript cut;
- preview/frame/audio QA;
- progress/cancel;
- final exact 1080p MP4;
- no required CapCut runtime.
Depends: IMP-001..011 complete and verified.
Blocks: MAIN VERIFIED / Phase 7.

## File-overlap constraints
- `packages/core/src/engine.ts` is a high-conflict file. Core tasks IMP-001 → IMP-004 → IMP-005 → IMP-006 → IMP-008 are serialized even where semantic work could theoretically overlap.
- `packages/core/src/rpc.ts` is shared by IMP-002/004/005/008; queue serializes those mutations.
- `packages/mcp/src/guide.ts` is shared by IMP-003/010/011; later tasks consume earlier accepted state.
- IMP-007 desktop lane and IMP-009 dependency lane may run independently only when no command/build lock or package-lock mutation conflicts with active verification.

## Exit Gate
PASS because:
- every production capability has a node;
- semantic prerequisites are explicit;
- shared-file conflict order is explicit;
- independent lanes are identified without unsafe overlap;
- all nodes converge on one E2E/MAIN VERIFIED gate;
- no node requires a new architecture decision beyond the frozen baseline.

## Artifact
`docs/plan/DEPENDENCY_GRAPH_V1.md`

## Evidence
- frozen ADR/design/freeze record;
- current source layout under `packages/core/src`, `packages/mcp/src`, `apps/desktop/src`;
- `docs/TESTING.md` smoke inventory.

## Owner / Authority
ChatGPT Web owns dependency planning; FileMCP-E supplies source evidence. Product-owner approval is required only for product requirement changes, not normal implementation ordering.

## Risks / Open Questions
- exact function/file placement may shift during task analysis if current callers require a narrower location; this does not permit architecture change.
- shared `engine.ts`/`rpc.ts` increase merge/conflict risk, hence serialized core lane.
- packaging/bundle impact of `large-v3-turbo` is Phase 7 unless implementation requires model acquisition policy earlier.

## Loopback
- hidden prerequisite -> update Dependency Graph before claiming affected task;
- architecture contradiction -> reopen DESIGN/ADR with evidence;
- product/AC contradiction -> reopen DEFINE;
- ordinary source-location refinement -> remain in Phase 5/claimed task without reopening Freeze.
