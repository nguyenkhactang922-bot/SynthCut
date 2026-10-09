# TVE-IMP-011 — QA and durable evidence coordinator

Status: PASS / VERIFIED
Date: 2026-10-09
Branch: `chatgpt/ai-video-editor-design`
Baseline HEAD before task commit: `9dd1e9a03d0f9d281c73f82f6b715fa309c15e8d`

## Scope
Productionize the frozen QA/evidence loop without creating a second edit truth:

- structural verification over the current authoritative core project;
- exact rendered-frame evidence copied into durable Tang evidence storage;
- preview render + ffprobe-backed A/V facts;
- optional final-delivery ffprobe facts for duration/canvas/audio;
- revision/project binding with stale fail-closed behavior;
- durable logical `evidenceRef` records readable through core/MCP;
- only accepted PASS records are indexed into derived Tang sidecar `evidenceRefs`;
- orchestration/guide routes FAIL/STALE to replan/restore rather than silent acceptance.

Primary production files:
- `packages/core/src/tang/qa.ts`
- `packages/core/src/rpc.ts`
- `packages/mcp/src/index.ts`
- `packages/mcp/src/guide.ts`
- `packages/mcp/src/tang/orchestration.ts`

Task-local verification:
- `packages/core/scripts/smoke-tang-qa.ts`

## Runtime evidence

### Core build
Command:
`npm run build --workspace @aive/core`

Result: PASS / exit 0.

### MCP build
Command:
`npm run build --workspace @aive/mcp`

Result: PASS / exit 0.

### Dedicated QA coordinator smoke
Command:
`node node_modules/tsx/dist/cli.mjs packages/core/scripts/smoke-tang-qa.ts`

Fixture reuse only (no DESIGN spike rerun):
- retained media input: `.spike-temp/lf001-corrected/source-6s.mp4`
- retained project-local FFmpeg/FFprobe binaries from the already-PASS long-form evidence lane.
- all new smoke outputs stayed under repo-local `.tmp/tve-imp-011-*` and were removed on PASS.

Result marker:
`TVE-IMP-011 QA COORDINATOR SMOKE PASSED`

Verified behavior:
1. Built a real 90-frame/3-second authoritative project from the existing 1920x1080 30fps H.264 + AAC fixture and rendered a real final MP4 delivery.
2. STALE binding:
   - verdict `stale`;
   - `accepted=false`;
   - `nextAction=replan`;
   - no rendered-frame acceptance evidence produced;
   - durable QA record written/readable;
   - stale `evidenceRef` not indexed into accepted Tang evidence refs.
3. Wrong-duration final delivery:
   - verdict `fail`;
   - `accepted=false`;
   - `nextAction=replan`;
   - ffprobe-backed duration mismatch recorded;
   - preview A/V and rendered-frame diagnostics retained;
   - durable failed QA record readable;
   - failed `evidenceRef` not indexed as accepted evidence.
4. Correct final delivery:
   - verdict `pass`, `accepted=true`, `nextAction=continue`;
   - structural check PASS with one authoritative clip;
   - three exact rendered-frame artifacts copied under `dataDir/tang-evidence/<qaId>/`;
   - preview probe recorded video + audio;
   - delivery checks PASS for duration, 1920x1080 canvas, and required audio;
   - durable QA record readable through `get_qa_evidence`;
   - PASS `evidenceRef` indexed into live Tang metadata while rejected refs remained excluded.
5. Persistence/restart:
   - project save persisted accepted evidence refs in adjacent derived Tang sidecar;
   - restart loaded the same authoritative 90-frame `.aive` timeline;
   - PASS ref remained indexed;
   - STALE/FAIL refs remained absent from accepted index;
   - durable PASS QA record remained readable after restart.

This proves evidence storage is verification/derived state only; `.aive` remains edit/render truth.

### Root typecheck
Command:
`npm run typecheck`

Result: PASS / exit 0 across core + MCP + desktop.

## Review / diff gate
- `git diff --cached --check` on IMP-011 scope: PASS / exit 0.
- Task-scoped staged stat before evidence file: 6 source/smoke files, `+604/-5`.
- No unrelated `packages/skill-installer/bin/synthcut.mjs`, `.spike-temp`, `.tmp`, dataset scratch, or historical governance WIP belongs to the task commit.
- `get_qa_evidence` is marked MCP read-only; `run_qa_verification` is not falsely marked read-only because accepted QA updates derived Tang evidence references.
- QA coordinator does not mutate project edit decisions and does not create a shadow timeline.

## Acceptance verdict
PASS.

`TVE-IMP-011` satisfies the planned exit gate: representative verification emits structural + rendered + preview/audio + final-delivery evidence; stale/failed QA cannot be silently accepted; durable evidence references survive project save/restart while authoritative edit truth remains `.aive`.
