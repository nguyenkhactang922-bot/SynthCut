# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-IMP-003`
- STATUS: `ACTIVE / CLAIMED`
- CURRENT_STAGE: `BUILD & VERIFY — ANALYZE/PLAN for MCP bounded tool exposure and operator contract`
- BRANCH: `chatgpt/ai-video-editor-design`
- HEAD: `c0e62eb`
- LAST_VERIFIED_CHECKPOINT: `TVE-IMP-002 COMMIT PASS` — commit `c0e62eb` contains only bounded read-model source, dedicated runtime smoke, and implementation evidence. Final core build, bounded-read smoke, root typecheck, and diff-check are PASS and must not be rerun unless IMP-002 source changes.
- PROCESS_PID: `NONE`
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE`
- LATEST_LOG: `docs/evidence/implementation/TVE-IMP-002.md`
- LAST_EXIT_CODE: `0 for final core build, bounded-read smoke, root typecheck, diff-check and commit`
- ARTIFACTS:
  - `packages/core/src/tang/read-model.ts`
  - `packages/core/src/engine.ts`
  - `packages/core/src/rpc.ts`
  - `packages/core/scripts/smoke-tang-read-model.ts`
  - `docs/evidence/implementation/TVE-IMP-002.md`
- BLOCKERS:
  - `NONE` for IMP-003 ANALYZE/PLAN.
- NEXT_EXACT_ACTION: Analyze `packages/mcp/src/index.ts`, `packages/mcp/src/guide.ts`, and generic core-client/method registration. Plan the smallest IMP-003 change that exposes/teaches the already-committed bounded read surfaces through the existing shared RPC/MCP transport without duplicating read-model logic. Then implement/test/evidence/verify/commit IMP-003 only. Do not claim IMP-004 until IMP-003 commits.
- DO_NOT_REPEAT:
  - DISCOVER / DEFINE / RESEARCH;
  - all completed DESIGN audits/spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - all TVE-IMP-001 stages/commit;
  - all TVE-IMP-002 stages/commit;
  - expensive long-form/Whisper POC evidence already PASS.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gate
`IMPLEMENTATION_ALLOWED=true` because DESIGN is FROZEN and PLAN IMPLEMENTATION is PASS.
Authorization remains dependency/task scoped. Current claim: `TVE-IMP-003`.
