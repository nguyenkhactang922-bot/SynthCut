# Project Operating Rules

## Source of truth
Repo state, Git state, project state files, and runtime evidence are authoritative. Chat history is not authoritative.

## Mandatory delivery lifecycle
Every non-trivial change follows this order and may not skip gates:

1. Raw idea
2. Brief + acceptance criteria
3. Repository research, including license/dependency obligations
4. Technology comparison and ADR
5. One living design document
6. Conditional audit with explicit stop criteria
7. Spike/prototype for unresolved technical risk
8. Freeze architecture + acceptance criteria
9. Task decomposition and dependency ordering
10. Code
11. Test
12. Evidence
13. PR / review / merge
14. MAIN VERIFIED
15. Final traceability audit

## Hard gates
- No feature implementation before the architecture and acceptance criteria are marked FROZEN.
- Research and audit must cite concrete repo files, tests, runtime evidence, or upstream references; do not infer from marketing copy alone.
- A spike is disposable evidence, not production code, unless a later task explicitly promotes it.
- Tests must exercise real behavior where practical; rendering claims require real render evidence.
- A task is not DONE until its acceptance criteria, tests, and evidence are linked.
- MAIN VERIFIED requires verification on merged main, not only on a feature branch.
- Final audit must map each frozen requirement to implementation, test, evidence, and final status.

## Current product direction
Personal-use, Windows-first AI-native long-form video editor. Primary usage path: local raw footage -> ChatGPT/MCP control -> shared non-destructive timeline -> local render -> review/QA -> final export. CapCut is not a required dependency.

## Base repository policy
SynthCut is the current base candidate. Preserve upstream capability where it is already stronger than a proposed replacement. Prefer extension/adapters over rewrites until research proves a core limitation.

## Canonical expanded lifecycle
The project must follow `docs/process/PROJECT_LIFECYCLE_V1.md` exactly:

1. DISCOVER — Raw Idea -> Problem Discovery -> Discovery Research -> I/O Hypotheses
2. DEFINE — Brief -> Scope -> Constraints -> Acceptance Criteria
3. RESEARCH — Solution Research -> Repo/Tool/Framework Search -> License/Security Audit -> Candidate Comparison
4. DESIGN — ADR -> System Design -> Independent Audit -> Spike/POC -> Freeze
5. PLAN IMPLEMENTATION — Dependency Graph -> Task Decomposition -> Traceability -> Task Queue
6. BUILD & VERIFY — Claim -> Code -> Test -> Evidence -> Verify -> Commit -> PR -> Review -> Merge -> MAIN VERIFIED
7. RELEASE & OPERATE — Package -> Release -> Deploy -> Monitor -> Incident Handling
8. LEARN — Final Traceability Audit -> Feedback -> New Requirement/Bug/Improvement -> DISCOVER/DEFINE

Hard rule: if an earlier phase is later found incomplete, project authorization rolls back to the earliest incomplete phase. Later evidence is retained but does not authorize skipping the missing gate. Spike/POC code is DESIGN evidence, not production implementation.
