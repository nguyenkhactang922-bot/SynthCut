# TVE-IMP-003 — MCP bounded tool exposure and operator contract

Status: PASS / VERIFIED / COMMIT PENDING
Date: 2026-10-08
Branch: `chatgpt/ai-video-editor-design`
Base commit at task start: `84318ff`

## Scope
Expose the already-committed bounded long-form read model through the existing generic MCP transport and teach the operator contract to prefer bounded reads without duplicating core read logic.

Production changes are limited to:
- `packages/mcp/src/index.ts`
  - marks `project_overview`, `inspect_range`, `inspect_chapter`, and `get_transcript_window` with MCP `readOnlyHint=true`;
  - preserves generic registration over `@aive/core/rpc` methods.
- `packages/mcp/src/guide.ts`
  - long-form default path is `project_overview -> search/locate -> inspect_range/inspect_chapter -> get_transcript_window -> plan edit`;
  - derived chapter/read-model state is navigation-only when stale;
  - broad-range truncation/pagination must be followed rather than falling back to full-state dumps;
  - `get_state` is a full-detail/debug escape hatch, not the default long-form reasoning surface.
- `packages/mcp/scripts/smoke-bounded-tools.ts`
  - project-local deterministic real stdio MCP smoke; no media/FFmpeg dependency.

`packages/mcp/src/core-client.ts` was intentionally not changed because generic RPC forwarding already exposes all core methods through the shared core/UI state.

## Test history

### MCP build — first attempt
Command:
`npm.cmd run build --workspace @aive/mcp`

Result: FAIL, exit 1.

Isolated cause: a newly added guide sentence contained raw backticks inside the `PLATFORM_INSTRUCTIONS` template literal. No transport/schema/core failure was present. Only the guide parse error was repaired.

### MCP build — repaired final run
Command:
`npm.cmd run build --workspace @aive/mcp`

Result: PASS, exit 0.

### Dedicated real stdio MCP smoke
Command:
`npx.cmd tsx packages/mcp/scripts/smoke-bounded-tools.ts`

Result: PASS, exit 0.

Marker:
`TVE-IMP-003 MCP BOUNDED TOOLS SMOKE PASSED`

Verified behavior:
1. in-process core started and MCP server connected to that same core over the existing shared transport;
2. MCP client connected over real stdio;
3. all 4 bounded tools were exposed with `readOnlyHint=true`;
4. the operator contract contained the bounded long-form path and full-state escape-hatch policy;
5. all four bounded MCP payloads exactly matched direct core RPC payloads and stayed within the <=64 KiB contract;
6. existing generic registration remained intact with 98 total tools.

### Root typecheck
Command:
`npm.cmd run typecheck`

Result: PASS, exit 0.

Coverage:
- TypeScript project references for core + MCP;
- desktop renderer `tsc --noEmit`.

## Acceptance verification
- MCP exposes bounded core read surfaces without bypassing shared RPC validation: PASS.
- Read-only annotations on all four bounded read tools: PASS.
- Operator guidance prefers bounded long-form reads: PASS.
- Full `get_state` / full transcript are not taught as the normal long-form path: PASS.
- Revision/index-stale fields remain visible because MCP payloads exactly equal the core RPC payloads: PASS.
- Existing generic tool registration remains intact: PASS, 98 total tools in smoke.
- No duplicated core read-model logic in MCP: PASS.

## Review notes
- The task intentionally does not add hand-written wrappers or new transport code.
- The MCP layer remains a thin operator/annotation layer over the canonical core RPC surface.
- No IMP-004 EditPlan/revision-guard code is included in this task.
- Unrelated `packages/skill-installer/bin/synthcut.mjs`, `.spike-temp/`, dataset scratch files, and previously staged governance/design files must not be absorbed into this task commit.

## Verdict
`TVE-IMP-003 = PASS / VERIFIED / COMMIT PENDING`.

NEXT_EXACT_ACTION: run task-scoped diff-check/review, commit only IMP-003 source/smoke/evidence, sync state/queue/handoff with the real commit hash, then evaluate/claim TVE-IMP-004.
