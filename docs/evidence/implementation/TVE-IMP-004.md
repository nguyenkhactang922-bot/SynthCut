# TVE-IMP-004 — EditPlan, revision guard and dry-run

Status: **PASS / VERIFIED / COMMIT PENDING**

## Scope
Implements the frozen D-008 EditPlan safety envelope without starting IMP-005 batch execution/recovery semantics.

Production changes:
- `packages/core/src/tang/edit-plan.ts`
  - strict EditPlan + PlannedOperation schemas;
  - projectId + basedOnRevision fail-closed preconditions;
  - range/chapter scope validation;
  - deterministic ordered-operation validation and affected clip/asset/track/range prediction;
  - conservative EditPlan v1 mutation allowlist;
  - no mutation handler execution during dry-run.
- `packages/core/src/rpc.ts`
  - exposes `dry_run_edit_plan`;
  - reuses the existing RPC Zod schema catalog for operation parameter validation;
  - does not duplicate mutation handlers.
- `packages/core/scripts/smoke-edit-plan.ts`
  - dedicated deterministic/zero-mutation acceptance smoke.

## Resume / anti-duplicate recovery
At resume, repo/Git/runtime were rechecked. Canonical root was `E:/SynthCut`, branch `chatgpt/ai-video-editor-design`, HEAD `4a9ea4e94a886ae830f7f60e4ced5ef83471210e`.

The prior handoff referenced PID `15596` / PTY `pty_dcfd5102cb99831da90d773de418cd1b023b`, but no SynthCut process remained and that PTY was unavailable in the current FileMCP runtime. Visible PTYs belonged to other repositories. No durable PASS/FAIL marker existed for the old core-build process, so the stage was classified **INTERRUPTED** and only the exact core-build stage was resumed. No earlier task/stage was rerun.

## Test evidence
### Core build
Command:
`npm.cmd run build --workspace @aive/core`

Runtime:
- PTY: `pty_bf0feca10dd1fa6544b04b47877486cdd2ac`
- exit code: `0`
- result: **PASS**

### Dedicated EditPlan dry-run smoke
Command:
`npx.cmd tsx packages/core/scripts/smoke-edit-plan.ts`

Runtime:
- PTY: `pty_93dc9208e1607ce98202d81b251012e9ff09`
- exit code: `0`
- marker: `TVE-IMP-004 EDIT PLAN DRY RUN SMOKE PASSED`

Verified cases:
1. identical valid plan produces deterministic output;
2. valid dry-run leaves full project state and revision unchanged;
3. prediction reports ordered operations and affected clip/track/range;
4. stale revision rejects and causes zero mutation;
5. projectId mismatch rejects and causes zero mutation;
6. unknown clip reference rejects and causes zero mutation;
7. illegal clip-local range rejects and causes zero mutation;
8. unsupported side-effecting RPC method rejects and causes zero mutation;
9. invalid operation params are rejected through the existing RPC schema and cause zero mutation.

### Root typecheck
Command:
`npm.cmd run typecheck`

Runtime:
- PTY: `pty_4cb9d99814d8f10a2a6a8ae7e1aa4b780d79`
- exit code: `0`
- covers core + MCP + desktop TypeScript checks
- result: **PASS**

### Diff hygiene
`packages/core/src/rpc.ts` was temporarily rewritten with CRLF by an edit path. HEAD uses LF. The file was normalized back to LF without changing logic. Post-normalization `git diff --numstat -- packages/core/src/rpc.ts` reports `28 0`, and `git diff --check -- packages/core/src/rpc.ts` exits `0`.

## Acceptance verdict
- stale revision -> zero mutation: **PASS**
- wrong project -> zero mutation: **PASS**
- invalid refs/ranges -> fail before mutation: **PASS**
- valid dry-run deterministic: **PASS**
- existing RPC validation reused: **PASS**
- no direct serialized project write: **PASS**
- no IMP-005 checkpoint/batch execution semantics introduced early: **PASS**

`TVE-IMP-004 = PASS / VERIFIED / COMMIT PENDING`.