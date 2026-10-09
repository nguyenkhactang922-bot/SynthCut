# DESIGN AUDIT 002 — Lifecycle Re-entry and Long-Form Command Boundary

Status: PASS TO REMAINING DESIGN SPIKES — NOT FROZEN
Date: 2026-10-06

## Inputs
- canonical 8-phase lifecycle;
- `PRODUCT_DISCOVERY_V1.md` — DISCOVER PASS;
- `PRODUCT_DEFINITION_V1.md` — DEFINE PASS;
- `RESEARCH_RECONCILIATION_V1.md` — RESEARCH PASS;
- ADR-001 + Amendment A-001;
- living design + section 28;
- prior spike evidence for DEPSEC, MCP-CONTEXT and UI-300;
- premature LF failure evidence.

## Independent checks

### R1 — Problem/solution separation
PASS. Discovery describes user/workflow problems independently of SynthCut selection. Base selection remains in RESEARCH/ADR.

### R2 — Definition completeness
PASS. Brief, scope, constraints and acceptance mapping are explicit. `no required CapCut runtime` must become an explicit frozen trace item at Freeze.

### R3 — Research sufficiency
PASS. Existing candidate/license/security comparison remains applicable to the normalized definition. No blind research rerun is required.

### R4 — Existing spike freshness
- DEPSEC: retain as valid pre-freeze evidence; definition changes do not invalidate the dependency result.
- MCP-CONTEXT: retain; bounded-context requirement is unchanged.
- UI-300: retain; 200–300 clip UI requirement is unchanged and the disposable culling POC proved a path to all fixed UI gates.

### R5 — LF spike
FAIL as originally attempted, but failure is diagnostically useful. Windows `ENAMETOOLONG` is now an explicit design constraint. The next LF POC must test bounded segment/window command construction; blindly rerunning the same 300-input preview is prohibited.

### R6 — Vietnamese STT
Still OPEN. No evidence change; `TVE-SPIKE-VI-STT` remains required before Freeze.

### R7 — Freeze readiness
NOT READY. Remaining blockers:
1. corrected `TVE-SPIKE-LF-001` PASS;
2. `TVE-SPIKE-VI-STT` PASS;
3. persistent derived Tang metadata location/schema decision;
4. final acceptance/trace matrix including no-CapCut-runtime requirement;
5. reconcile all spike outcomes into the living design.

## Authorization decision
The project may re-enter **DESIGN / SPIKE** only for the still-open bounded risks. Production implementation remains locked.

Previously valid spikes MUST NOT be rerun merely because the lifecycle was normalized. Only the failed LF stage and still-unrun Vietnamese STT spike remain active technical evidence tasks, subject to their fixed gates.

**DESIGN AUDIT 002 = PASS TO REMAINING SPIKES, NOT FREEZE.**
