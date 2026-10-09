# TVE-FRZ-001 — Architecture + Acceptance Criteria Freeze Record

Status: PASS — FROZEN
Date: 2026-10-07
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Branch: `chatgpt/ai-video-editor-design`
Production authorization after this record: still `IMPLEMENTATION_ALLOWED=false` until PLAN IMPLEMENTATION PASS.

## Input
- canonical 8-phase lifecycle + §20 ten-field Stage Execution Contract;
- `docs/audit/FREEZE_READINESS_004.md` = PASS TO FREEZE;
- product brief and definition including revised AC-18;
- ADR-001 + Amendments A-001..A-005;
- living system design;
- all required DESIGN spike evidence;
- current license/security/risk decisions.

## Entry Gate
- DISCOVER: PASS.
- DEFINE: PASS with explicit AC-18 amendment reconciled.
- RESEARCH: PASS FOR DESIGN.
- ADR/System Design/Independent Audit: complete.
- DEPSEC, MCP-CONTEXT, UI-300, LF-001, SAFE-BATCH, VI-STT: PASS FOR DESIGN hypotheses under current criteria.
- lifecycle detailed contract: 39/39 substages normalized before production planning.
- production source diff for DESIGN lane: empty.

## Work
1. Perform final cross-document readback for contradictions.
2. Lock base architecture, state authority, execution boundaries, persistence model, long-form policies, Vietnamese STT policy, license/security boundaries, and measurable ACs.
3. Record accepted/deferred risks and explicit reopening triggers.
4. Mark canonical brief/definition/ADR/living design as FROZEN.
5. Authorize Phase 5 planning only; do not authorize production code yet.

## Output
The v1 design baseline is frozen with these major decisions:
- **Base/editor core:** SynthCut remains authoritative base.
- **Single source of edit truth:** one core `.aive` project shared by UI/MCP.
- **Tang derived metadata:** project-adjacent `<project>.tang.json`, revision-aware/rebuildable, never render/edit truth.
- **AI reasoning hierarchy:** PROJECT → CHAPTER → SCENE/NARRATIVE BEAT → EDIT ACTION, as derived references only.
- **AI mutation safety:** project revision precondition + dry-run/validation + durable pre-batch `.aive` checkpoint + ordered audit + explicit rollback/recovery.
- **Long-form reads:** bounded overview/chapter/range/transcript-window surfaces; ordinary default target <=64 KiB.
- **300-clip UI:** viewport culling/virtualization before any UI rewrite.
- **Long-form render:** segment/window-bounded intersecting dependencies; cached video segments; PCM segment audio concat; one final AAC encode/mux; observable/cancelable jobs.
- **Windows command safety:** render command size scales with intersecting window, not total project clips.
- **Vietnamese STT:** multilingual `large-v3-turbo`, explicit `language=vi`; WER/rare-key/timing automated gate; >=120 ms per-side cut guard; fail closed to NOOP/review-needed on insufficient gap; human listening optional spot-check.
- **Dependency/security:** proven non-force remediation path; production lockfile application becomes traced implementation work.
- **CapCut:** not required at runtime; CapCut/Premiere/Resolve are optional finishing/interchange targets.
- **Motion graphics:** provider-isolated/optional; baseline editor must work without them.
- **Commercial redistribution:** out of v1 scope and is a license-review reopening trigger.

## Exit Gate
PASS only if:
- architecture and ACs are explicit and mutually consistent;
- all blocking pre-freeze risks have evidence-backed decisions;
- unresolved items are deferred with reopening triggers, not silently ignored;
- no POC code has been silently promoted to production;
- Phase 5 can decompose implementation without making new architecture decisions.

Result: PASS.

## Artifact
- `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`
- frozen canonical design set:
  - `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`
  - `docs/define/PRODUCT_DEFINITION_V1.md`
  - `docs/adr/ADR-001_BASE_ARCHITECTURE.md`
  - `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md`
  - `docs/process/PROJECT_LIFECYCLE_V1.md`

## Evidence
- `docs/audit/FREEZE_READINESS_004.md`
- `docs/audit/AC18_AUTOMATED_GATE_CHANGE_004.md`
- `docs/evidence/spikes/TVE-SPIKE-DEPSEC-001.md`
- `docs/evidence/spikes/TVE-SPIKE-MCP-CONTEXT.md`
- `docs/evidence/spikes/TVE-SPIKE-UI-300.md`
- `docs/evidence/spikes/TVE-SPIKE-LF-001.md`
- `docs/evidence/spikes/TVE-SPIKE-SAFE-BATCH-001.md`
- `docs/evidence/spikes/TVE-SPIKE-VI-STT.md`
- `.spike-temp/vi-stt/automated-validation.json` = PASS.

## Owner / Authority
- Product owner: product scope and explicit AC amendments.
- ChatGPT Web: architecture/evidence reconciliation and Freeze authority under global/repository law.
- FileMCP-E: execution/evidence bridge only.

## Risks / Open Questions
Accepted/deferred:
- optional human audio spot-check may reveal contradictory evidence and reopen AC-18;
- speaker diarization deferred from v1;
- commercial redistribution reopens license/security research;
- installer/dev dependency hardening remains release work where applicable;
- POC performance results must be reproduced by production implementation tests before MAIN VERIFIED;
- Git identity remains unset and blocks commits later, not Phase 5 planning.

## Loopback
After Freeze, any material contradiction must be recorded before changing the frozen baseline:
- product/scope/AC change -> DEFINE;
- candidate/license/security change -> RESEARCH;
- architecture change -> DESIGN / ADR;
- implementation-only defect within frozen design -> BUILD & VERIFY task loop.

Valid unaffected evidence is retained; do not restart the whole lifecycle.

## Freeze declaration
`TVE-FRZ-001 = PASS`.

Architecture + Acceptance Criteria are **FROZEN for v1 implementation planning**.

Next authorized lifecycle phase: **PLAN IMPLEMENTATION**.
Production Code remains **LOCKED** until `TVE-PLAN-001..004` all PASS.
