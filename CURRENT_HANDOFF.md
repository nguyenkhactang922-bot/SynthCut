# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-IMP-011`
- STATUS: `CLAIMED`
- CURRENT_STAGE: `BUILD & VERIFY — ANALYZE/PLAN: QA and durable evidence coordinator`
- BRANCH: `chatgpt/ai-video-editor-design`
- HEAD: `10711c1`
- LAST_VERIFIED_CHECKPOINT: `TVE-IMP-010 PASS / COMMITTED 10711c1` — repaired MCP prompt contract accepts MCP string arguments, real stdio 30-minute/300-clip scenario PASS, six bounded chapter packets, revision-bound real clip/frame EditPlan dry-run, root typecheck PASS, evidence at `docs/evidence/implementation/TVE-IMP-010.md`.
- PROCESS_PID: `NONE`
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE`
- LATEST_LOG: `NONE — IMP-010 smoke completed PASS; no SynthCut long-run process active`
- LAST_EXIT_CODE: `IMP-010 build/smoke/typecheck/review PASS; commit 10711c1 created`
- ARTIFACTS:
  - `docs/evidence/implementation/TVE-IMP-010.md`
  - commit `10711c1`
  - frozen task input `docs/plan/TASK_DECOMPOSITION_V1.md#TVE-IMP-011`
- BLOCKERS:
  - `NONE`.
- NEXT_EXACT_ACTION: For `TVE-IMP-011`, inspect current checkpoint-backed batch result/audit metadata, Tang sidecar evidence refs, `inspect_timeline`/`get_frame`/`render_preview`/export + ffprobe/job surfaces. Design the smallest coordinator that records structural + rendered-frame + preview/audio + delivery evidence references, rejects stale/failed QA, and routes failure to correction/rollback without duplicating `.aive` edit truth. Then implement only that scope and run dedicated runtime smoke + build/typecheck/evidence/review.
- DO_NOT_REPEAT:
  - DISCOVER / DEFINE / RESEARCH;
  - completed DESIGN audits/spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - TVE-IMP-001..010 stages/commits;
  - IMP-010 build/smoke/typecheck unless its source becomes stale;
  - `.spike-temp/`, unrelated `.tmp/`, dataset scratch, and `packages/skill-installer/bin/synthcut.mjs` WIP.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gate
`IMPLEMENTATION_ALLOWED=true` because DESIGN is FROZEN and PLAN IMPLEMENTATION is PASS.
Authorization remains dependency/task scoped. Current claim: `TVE-IMP-011`.
