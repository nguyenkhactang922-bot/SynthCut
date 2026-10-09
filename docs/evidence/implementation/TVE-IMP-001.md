# TVE-IMP-001 — Tang metadata sidecar foundation evidence

Status: VERIFIED PASS THROUGH REVIEW — BLOCKED AT COMMIT
Date: 2026-10-08
Lifecycle: Phase 6 BUILD & VERIFY
Frozen source: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`
Task contract: `docs/plan/TASK_DECOMPOSITION_V1.md#tve-imp-001--tang-metadata-sidecar-foundation`

## Input
- Frozen ADR A-003 / living design decision that `.aive` remains sole authoritative edit/render truth.
- Required adjacent rebuildable `<project>.tang.json` sidecar bound to core project identity/revision.
- Existing `EditorEngine` save/load/current-path/revision/recovery behavior.

## Entry Gate
- DESIGN/FREEZE: PASS.
- Phase 5 Dependency Graph / Task Decomposition / Traceability / Queue: PASS.
- `TVE-IMP-001`: claimed before production mutation.
- Git root verified as `E:/SynthCut` on branch `chatgpt/ai-video-editor-design`, HEAD `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`.

## Work / production scope
Implemented:
- `packages/core/src/tang/metadata.ts`
  - schema version `1`;
  - `coreProjectId` + `basedOnRevision` binding;
  - project-adjacent `.tang.json` path derivation;
  - strict top-level schema validation (unknown/shadow keys rejected);
  - safe load classification: `missing | valid | stale | invalid`;
  - fail-safe stale project-id/revision handling;
  - temp-file + rename replacement with Windows fallback backup/restore behavior;
  - backup is retained on catastrophic replacement/restore failure rather than being blindly deleted.
- `packages/core/src/engine.ts`
  - derived metadata kept outside authoritative `Project` edit state;
  - live revision drift marks metadata stale;
  - save writes `.aive` first, then best-effort sidecar; sidecar failure never converts a successful `.aive` save into edit-data loss;
  - load validates sidecar against persisted project identity/revision before live-session revision bump;
  - valid sidecar is rebased in memory to the loaded session revision;
  - missing/stale/invalid sidecar does not block `.aive` load;
  - reset/OTIO import clears sidecar binding state.
- `packages/core/scripts/smoke-tang-metadata.ts`
  - project-local disposable test output under `.tmp/` only;
  - cleanup on PASS; failure path preserves test artifacts under project root.

No RPC expansion, read model, EditPlan, batch API, or shadow timeline was introduced in this task.

## Dedicated runtime smoke
Command:
`npx.cmd tsx packages/core/scripts/smoke-tang-metadata.ts`

Final hardened run: PASS, exit code `0`.
Marker:
`TVE-IMP-001 TANG SIDECAR SMOKE PASSED`

Verified behaviors:
1. First `.aive` save creates adjacent `.tang.json`.
2. Sidecar schema version is `1`.
3. Sidecar binds exact core project ID and persisted revision.
4. Generated sidecar contains no `tracks`, `clips`, `assets`, or `timeline` shadow state.
5. A normal edit makes live derived metadata stale immediately.
6. Stale metadata is not returned as valid.
7. Save rebases sidecar to the new persisted revision.
8. Restart/load accepts a valid disk sidecar while `.aive` remains authoritative.
9. In-memory metadata rebases to the live loaded-session revision; next save persists it.
10. Stale-revision sidecar does not block `.aive` load and is repaired by save.
11. Malformed JSON sidecar does not block `.aive` load and is repaired by save.
12. Sidecar containing unknown/shadow top-level key `tracks` is rejected as invalid and is not re-persisted during repair.
13. Missing/deleted sidecar does not block load or editing; next save recreates it.
14. Final restart accepts repaired sidecar.
15. Successful atomic replacement leaves no `.tmp`/`.bak` leakage.

An earlier smoke run passed before strict unknown-key hardening. That earlier run is superseded by the final hardened run above and is not used as final verification evidence.

## Build / typecheck
After the final production hardening change:
- `npm.cmd run build --workspace @aive/core` — PASS, exit `0`.
- `npm.cmd run typecheck` — PASS, exit `0`.
  - core + MCP TypeScript project build passed;
  - desktop `tsc --noEmit` passed.

Earlier build/typecheck results that preceded final validator hardening are superseded and are not used as final verification evidence.

## Review evidence
- `git diff --check -- packages/core/src/engine.ts` — PASS, exit `0`.
- Final review found and corrected two safety issues before acceptance:
  1. unknown top-level sidecar keys could otherwise have allowed shadow-timeline data to survive validation/re-save;
  2. catastrophic Windows replacement failure must not blindly delete the preserved `.bak` after restore failure.
- Unrelated `packages/skill-installer/bin/synthcut.mjs` WIP remains outside this task and was not absorbed.
- Existing historical/governance staged changes remain separate from the IMP-001 production diff.

## Exit Gate evaluation
- save/load/restart round-trip: PASS.
- stale sidecar invalidation: PASS.
- malformed sidecar fail-safe: PASS.
- missing/deleted sidecar fail-safe: PASS.
- project identity/revision binding: PASS.
- `.aive` authoritative when sidecar disagrees/fails: PASS.
- no shadow timeline: PASS.
- safe replacement behavior: PASS for success path and recovery-preserving implementation review.
- build/typecheck: PASS.
- review: PASS.

Implementation/Test/Evidence/Verify/Review boundary is accepted for `TVE-IMP-001`.

## Commit / Git blocker
Direct Git config verification on 2026-10-08:
- `git config --get user.name` -> unset, exit `1`.
- `git config --get user.email` -> unset, exit `1`.

Therefore COMMIT cannot be performed without inventing identity, which is forbidden by project law. No commit, push, PR, merge, or MAIN VERIFIED claim is made.

## Owner / Authority
ChatGPT Web: implementation/review authority under frozen design.
FileMCP-E: local execution/evidence bridge.
Git identity must be supplied/configured by the user or other authorized repo configuration; it is not inferred.

## Risks / Open Questions
- Sidecar is intentionally best-effort derived state. A sidecar write failure may leave metadata unavailable/stale while `.aive` remains safely saved; later save/rebuild repairs it.
- No public RPC sidecar/read-model surface is introduced here; that belongs to dependency-following tasks.

## Loopback
- Contradictory sidecar runtime evidence -> reopen only TVE-IMP-001 Code/Test.
- Frozen invariant conflict -> loop back to DESIGN/ADR.
- Current state -> BLOCKED AT COMMIT solely on missing Git identity; do not rerun accepted tests unless code changes.
