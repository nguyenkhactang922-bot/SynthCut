# TVE-PLAN-002 — Production Task Decomposition v1

Status: PASS
Date: 2026-10-07
Depends on: `TVE-PLAN-001` PASS
Frozen baseline: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`

Every production task below has the ten-field execution contract required by global-law §20. Candidate file paths are planning targets; task analysis may narrow them, but may not alter frozen architecture without loopback.

---

## TVE-IMP-001 — Tang metadata sidecar foundation
- **Input:** frozen A-003 sidecar decision; current `.aive` save/load/recovery behavior.
- **Entry Gate:** Phase 5 dependency graph PASS; no duplicate active implementation task; root/Git verified.
- **Work:** add versioned `<project>.tang.json` schema/store; bind `coreProjectId` + `basedOnRevision`; atomic/safe write; load/validate/invalidate; ensure sidecar corruption/missing file never corrupts `.aive`; no shadow timeline. Candidate files: new `packages/core/src/tang/metadata.ts`, `packages/core/src/types.ts` if public types needed, narrow integration in `packages/core/src/engine.ts`.
- **Output:** production sidecar persistence primitive and tests/smoke.
- **Exit Gate:** save/load/restart round-trip PASS; stale sidecar invalidates; malformed sidecar fails safe; `.aive` remains authoritative; deletion of sidecar leaves edit usable.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-001.md`.
- **Evidence:** build/typecheck; dedicated sidecar smoke; save/load/restart evidence; diff proving no duplicate edit truth.
- **Owner/Authority:** ChatGPT Web; FileMCP-E executes; frozen design controls semantics.
- **Risks/Open Questions:** atomic-write semantics on Windows, path derivation for unsaved projects, schema migration strategy.
- **Loopback:** Code/Test for defects; DESIGN only if a sidecar cannot satisfy frozen invariants.

## TVE-IMP-002 — Bounded project/chapter/range/transcript read model
- **Input:** IMP-001 sidecar/index foundation; MCP-CONTEXT POC; frozen <=64 KiB rule.
- **Entry Gate:** IMP-001 MAIN/branch verification required by queue policy.
- **Work:** implement derived project overview, chapter/index references, range inspection, transcript-window queries, revision/stale markers; no independent clip timing. Candidate files: new `packages/core/src/tang/read-model.ts`, `packages/core/src/rpc.ts`, narrow `engine.ts` accessors.
- **Output:** bounded deterministic core RPC read surfaces.
- **Exit Gate:** representative overview/range/transcript calls <=64 KiB by default; three representative localized tasks resolve current clip IDs/frames without full transcript dump; stale index clearly marked/ineligible for mutation authorization.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-002.md`.
- **Evidence:** build/typecheck; new bounded-read smoke; payload-byte measurements; deterministic range assertions.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** accidental full-state serialization, chapter index invalidation granularity, range boundary off-by-one.
- **Loopback:** IMP-001 for metadata contract issue; DESIGN only if frozen bounded-read model is structurally impossible.

## TVE-IMP-003 — MCP bounded tool exposure and operator contract
- **Input:** IMP-002 core RPC reads; existing generic MCP registration.
- **Entry Gate:** IMP-002 PASS.
- **Work:** expose/read-only annotations for bounded tools; teach MCP guide to prefer `overview → search/locate → range → transcript-window`; preserve shared core transport. Candidate files: `packages/mcp/src/index.ts`, `packages/mcp/src/guide.ts`, `core-client.ts` only if necessary.
- **Output:** MCP client can use bounded long-form reads without direct project JSON access.
- **Exit Gate:** MCP smoke invokes new surfaces; read-only annotations correct; payloads match core; existing tool registration unaffected.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-003.md`.
- **Evidence:** core + MCP build/typecheck, MCP smoke, payload comparison.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** guide drift from actual tool names, duplicate tool semantics, MCP client compatibility.
- **Loopback:** IMP-002 if RPC contract inadequate; otherwise Code/Test.

## TVE-IMP-004 — EditPlan, revision guard and dry-run
- **Input:** sidecar foundation, frozen D-008 plan envelope, existing project revision/RPC validation.
- **Entry Gate:** IMP-001 PASS; current revision access proven.
- **Work:** implement plan ID/project ID/basedOnRevision/scope/ordered operations/rationale/evidence refs; precondition validation; stale revision fail-closed; dry-run predicts affected IDs/ranges without mutation. Candidate: new `packages/core/src/tang/edit-plan.ts`, `packages/core/src/rpc.ts`, narrow `engine.ts` hooks.
- **Output:** validated/dry-runnable production EditPlan contract.
- **Exit Gate:** stale revision produces zero mutation; invalid refs/ranges fail before mutation; valid dry-run deterministic; no direct serialized project writes.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-004.md`.
- **Evidence:** build/typecheck; stale-plan and dry-run smoke; before/after revision/state proof.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** predicting operations with side effects, plan schema evolution, exact revision semantics.
- **Loopback:** IMP-001 for persistence metadata issue; DESIGN if revision model contradicts frozen assumption.

## TVE-IMP-005 — Coherent AI batch checkpoint/audit/rollback
- **Input:** IMP-004 EditPlan; SAFE-BATCH POC; `.aive` persistence/recovery.
- **Entry Gate:** IMP-004 PASS.
- **Work:** create durable pre-batch checkpoint, ordered operation audit, stop-on-failure, restore/recovery path, batch result with revision/affected ranges; index safe references in Tang sidecar. Candidate: new `packages/core/src/tang/batch.ts`, `engine.ts`, `rpc.ts`.
- **Output:** production checkpoint-backed recoverable batch API.
- **Exit Gate:** stale plan rejected; forced mid-batch failure restores normalized pre-batch state; successful batch emits complete audit; explicit recovery reference retained; no ACID claim.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-005.md`.
- **Evidence:** build/typecheck; productionized safe-batch smoke including failure/success/restart; diff/revision evidence.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** checkpoint cleanup/retention, failure during restore, audit durability across crash.
- **Loopback:** IMP-004 for plan/precondition contract; IMP-001 for sidecar persistence; otherwise Code/Test.

## TVE-IMP-006 — Bounded long-form preview/export execution
- **Input:** LF-001 POC/A-002; existing FFmpeg/cache/jobs; accepted Windows command-size constraint.
- **Entry Gate:** IMP-005 PASS for shared-core file ordering; long-form POC evidence valid.
- **Work:** productionize segment/window intersecting-dependency selection, bounded commands, video segment caching/concat, PCM segment audio concat, single final AAC encode/mux, JobManager progress/cancel and partial-output cleanup. Candidate: `packages/core/src/engine.ts`, `packages/core/src/ffmpeg/`, `packages/core/src/jobs.ts` only as necessary.
- **Output:** production 30-minute/~300-clip bounded render path.
- **Exit Gate:** exact 1800s preview/final behavior; max command remains bounded by intersecting window; localized cache reuse >=90%; remote unchanged frame cache-hit; 20 edit/verify RSS <=125% baseline; background progress/cancel clean; final 1080p H.264+AAC ffprobe PASS.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-006.md` + project-local render artifacts.
- **Evidence:** existing smoke-cache/jobs plus dedicated production LF smoke and independent ffprobe.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** codec concat compatibility, audio sync/priming, Windows argv growth, cancellation across multi-stage mux.
- **Loopback:** exact failed render substage; DESIGN only if POC architecture cannot be productionized.

## TVE-IMP-007 — 300-clip timeline viewport culling/virtualization
- **Input:** UI-300 POC; frozen UI latency gates; current desktop timeline.
- **Entry Gate:** FROZEN design; desktop lane not conflicting with active UI task.
- **Work:** render clip/element blocks only for visible horizontal time window + buffer; preserve selection/drag/trim/snap semantics; avoid core EDL changes. Candidate: `apps/desktop/src/timeline.tsx`, `styles.css`, related desktop helpers only if measured.
- **Output:** production scalable timeline rendering.
- **Exit Gate:** 300-clip first paint <=5s; interaction p95 <=100ms; no normal task >500ms; drag/trim reflection <=250ms; no renderer OOM/crash; behavior parity for visible/offscreen selection/snap.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-007.md`.
- **Evidence:** renderer build/typecheck; deterministic UI performance harness/trace; desktop smoke.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** offscreen selection, snapping to culled clips, zoom coordinate drift.
- **Loopback:** Code/Test; DESIGN only if virtualization cannot preserve UX contract.

## TVE-IMP-008 — Vietnamese STT policy and fail-closed cut resolver
- **Input:** revised frozen AC-18; VI-STT evidence; current Whisper defaults (`base.en`/`en`).
- **Entry Gate:** IMP-006 PASS for serialized core integration lane; AC-18 frozen.
- **Work:** add Vietnamese policy selecting multilingual `large-v3-turbo` with explicit `vi`; never use `.en`; implement >=120ms per-side transcript-cut guard; insufficient gaps return NOOP/review-needed; retain rendered audio/preview QA requirement. Candidate: `packages/core/src/whisper/transcribe.ts`, transcript-edit RPC/helpers, new policy helper.
- **Output:** deterministic production Vietnamese edit-grade transcription/cut policy.
- **Exit Gate:** Vietnamese request resolves correct model/language; `small` not default; 20 frozen cut samples reproduce 13 safe cut/7 safe no-op or equivalent safe resolution; no forced cut below guard; STT smoke/benchmark contract remains within frozen metrics.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-008.md`.
- **Evidence:** build/typecheck; policy unit/smoke; retained benchmark refs; automated cut validator adapted to production helper; preview/audio QA smoke.
- **Owner/Authority:** ChatGPT Web / FileMCP-E; product owner required to change AC thresholds.
- **Risks/Open Questions:** model download/bundle size, memory on weaker PCs, default policy for non-Vietnamese languages.
- **Loopback:** DEFINE/ADR only for AC/model-policy change; Code/Test for implementation defects.

## TVE-IMP-009 — Dependency hardening promotion
- **Input:** DEPSEC POC exact non-force remediation path and current dependency graph.
- **Entry Gate:** FROZEN design; verify package graph has not materially changed since POC.
- **Work:** reapply only proven compatible dependency/lockfile remediation; no forced major upgrade; run audit/build/typecheck/security regressions.
- **Output:** production dependency graph with zero unreviewed critical production findings.
- **Exit Gate:** `npm audit --omit=dev` accepted target; build/typecheck/core security smoke PASS; any remaining high/dev findings explicitly classified.
- **Artifact:** minimal manifest/lockfile diff + `docs/evidence/implementation/TVE-IMP-009.md`.
- **Evidence:** audit before/after, dependency chain, build/typecheck, `smoke-security.ts`.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** upstream package drift since POC, lockfile churn, Electron-builder dev findings.
- **Loopback:** RESEARCH/License-Security only if dependency graph materially changed; otherwise repair failed upgrade/test stage.

## TVE-IMP-010 — Tang long-form editorial orchestration contract
- **Input:** bounded MCP tools, safe batch surface, Vietnamese policy, frozen editorial brain design.
- **Entry Gate:** IMP-003 + IMP-005 + IMP-008 PASS.
- **Work:** encode operator contract for PROJECT→CHAPTER→SCENE/BEAT→EDIT ACTION; brief normalization; hook/narrative/pacing/retention/filler/repetition/B-roll/caption/audio rules; require plan-before-mutation, bounded reads, revision precondition, QA checks. Candidate: `packages/mcp/src/guide.ts`, prompt registration in `packages/mcp/src/index.ts`, optional pure helpers under `packages/mcp/src/tang/`.
- **Output:** deterministic AI-operating contract over existing core, without local second LLM or shadow timeline.
- **Exit Gate:** representative 30-minute brief can be decomposed into chapter/range-scoped plans using bounded reads; operation plans reference actual RPC methods/frames/IDs; no whole-state default; no direct `.aive` writes.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-010.md`.
- **Evidence:** MCP smoke/scenario tests; generated plan fixture; payload/revision assertions.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** overlong guide, nondeterministic client adherence, editorial policy conflated with execution authority.
- **Loopback:** IMP-003/005/008 for missing tools/safety; DESIGN only for architecture change.

## TVE-IMP-011 — QA and durable evidence coordinator
- **Input:** safe batches, long-form renderer, Vietnamese policy, editorial orchestration, existing inspect/render/export tools.
- **Entry Gate:** IMP-005 + IMP-006 + IMP-008 + IMP-010 PASS.
- **Work:** standardize post-batch structural checks, exact rendered frames, timing/audio preview, final delivery verification, and durable evidence references in batch/sidecar metadata; ensure failed QA leads to correction/rollback path.
- **Output:** production verification loop matching frozen D-015.
- **Exit Gate:** representative visual/timing/audio batches emit structural + rendered evidence; final export records ffprobe delivery evidence; stale/failed QA cannot be silently accepted.
- **Artifact:** production diff + `docs/evidence/implementation/TVE-IMP-011.md`.
- **Evidence:** MCP/core smoke using `inspect_timeline`, `get_frame`, `render_preview`, export/ffprobe; persisted evidence refs.
- **Owner/Authority:** ChatGPT Web / FileMCP-E.
- **Risks/Open Questions:** evidence size/retention, image/media artifact cleanup, client not requesting QA unless contract enforces it.
- **Loopback:** owning implementation task for failing layer; DESIGN if verification contract itself is inadequate.

## TVE-E2E-001 — Frozen-requirement integrated proof
- **Input:** IMP-001..011 verified implementation.
- **Entry Gate:** all production implementation tasks PASS/committed as workflow permits; no unresolved P0/P1 review findings.
- **Work:** execute one integrated Windows-first local project proof with 30-minute/~300-clip shape and Vietnamese path; exercise import/save/load/recovery, bounded reads, safe batch, UI scalability, transcript edit guard, preview/frame/audio QA, jobs/cancel, final full-res export, no-CapCut path.
- **Output:** final integrated evidence package and verdict.
- **Exit Gate:** applicable AC-01..AC-19 and architecture/process ACs pass their mapped production evidence; final MP4 ffprobe correct; restart persistence verified; error/cancel path verified; no required CapCut process/dependency; no unsupported completion claim.
- **Artifact:** `docs/evidence/e2e/TVE-E2E-001.md` + project-local media/log artifacts.
- **Evidence:** real runtime logs, project state/restart, UI/MCP state checks, final ffprobe, process/dependency inspection.
- **Owner/Authority:** ChatGPT Web verification authority; FileMCP-E executes local proof.
- **Risks/Open Questions:** long runtime, model/resource availability, machine-specific performance, unrelated external cache use must be documented.
- **Loopback:** only failed owning IMP task/stage; frozen design reopened only on contradiction.

---

# Task decomposition exit gate

PASS because every frozen implementation-relevant requirement is covered by one or more bounded tasks; every task identifies prerequisites, candidate source, measurable acceptance, tests/evidence, risks, and loopback; POC code is not promoted implicitly; integration converges in `TVE-E2E-001`.
