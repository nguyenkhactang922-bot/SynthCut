# TVE-IMP-010 — Tang long-form editorial orchestration contract

Status: PASS / VERIFIED
Date: 2026-10-09
Branch: `chatgpt/ai-video-editor-design`
Baseline HEAD at task start: `cfd51f857f7011b3a4bdfa11e610e43d7518d6df`

## Scope
Productionize the frozen PROJECT → CHAPTER → SCENE/BEAT → EDIT ACTION operating contract over existing SynthCut core/MCP authority without creating a second timeline, local second LLM, direct `.aive` writer, or unbounded whole-state default.

## Implementation
- `packages/mcp/src/tang/orchestration.ts`
  - pure long-form brief/work-packet helpers;
  - chapter packets when current/mutation-eligible chapter metadata exists;
  - deterministic bounded range fallback when chapter metadata is absent/stale;
  - revision-bound packet metadata;
  - explicit bounded read, transcript-window, `dry_run_edit_plan → apply_edit_plan`, and QA sequences.
- `packages/mcp/src/guide.ts`
  - long-form hierarchy and editorial pass order;
  - current chapter/range requirement;
  - real IDs/frames from bounded reads;
  - revision precondition and stale-plan rebuild rule;
  - Vietnamese `vi` / `large-v3-turbo` / fail-closed cut policy;
  - no direct `.aive`, shadow timeline, or second local LLM.
- `packages/mcp/src/index.ts`
  - registers `edit_long_form` MCP prompt;
  - prompt arguments remain MCP-compatible strings;
  - `targetMinutes` is validated as a numeric string in `(0, 240]`, then converted to number only before the pure prompt helper.
- `packages/mcp/scripts/smoke-long-form-orchestration.ts`
  - real stdio MCP scenario with a 30-minute / 300-clip authoritative project and six chapter sidecar entries.

## Runtime evidence
### MCP build
Command: `npm run build --workspace @aive/mcp`
Final result: PASS / exit 0.

### Representative 30-minute MCP scenario
Command: `node node_modules/tsx/dist/cli.mjs packages/mcp/scripts/smoke-long-form-orchestration.ts`
Final result: PASS / exit 0.
Marker: `TVE-IMP-010 LONG-FORM ORCHESTRATION SMOKE PASSED`.

Measured final scenario:
- authoritative fixture: 30 minutes / 300 clips / 30 fps;
- work packets: 6 chapter-scoped packets;
- `project_overview`: 1,711 bytes;
- `inspect_chapter`: 23,634 bytes;
- both representative bounded reads < 64 KiB;
- current project revision observed through MCP: 12;
- actual current clip ID used by the plan: `clip-001`;
- `dry_run_edit_plan` operation count: 1;
- dry-run left authoritative project state unchanged;
- packet mutation sequence asserted exactly `dry_run_edit_plan → apply_edit_plan`;
- prompt exposes Vietnamese edit-grade policy and explicitly forbids direct `.aive` writes/shadow timeline.

### Root typecheck
Command: `npm run typecheck`
Result: PASS / exit 0 across core + MCP + desktop.

### Diff hygiene
`git diff --check` for IMP-010 source/smoke scope: PASS / exit 0.

## Failures found and repaired during TEST
1. Initial smoke supplied `targetMinutes` as a string to a `z.number()` prompt schema; server rejected it.
2. Changing the smoke to a number exposed the actual MCP protocol constraint: prompt `arguments` values are strings, so the client rejected numeric `targetMinutes` before the server.
3. Production prompt contract was repaired to accept/validate a numeric string and convert it internally. The smoke returned to the real MCP client representation (`"30"`) and then PASSed.

These failures were confined to IMP-010 and no prior PASS task/stage was rerun.

## Acceptance mapping
- PROJECT→CHAPTER→SCENE/BEAT→EDIT ACTION contract: PASS.
- Representative 30-minute brief decomposes into chapter/range-scoped bounded work: PASS.
- Operations use actual RPC method, project/revision, clip ID and integer frame range: PASS.
- Revision precondition + plan-before-mutation: PASS.
- No whole-state default: PASS.
- No direct `.aive` writes / no shadow timeline / no local second LLM: PASS.
- Editorial hook/narrative/pacing/retention/filler/B-roll/caption/audio policy remains guidance, while core RPC/EditPlan remains execution authority: PASS.

## Review verdict
PASS. Implementation is an orchestration contract over existing core authority, not a competing state machine. No frozen architecture change is required.
