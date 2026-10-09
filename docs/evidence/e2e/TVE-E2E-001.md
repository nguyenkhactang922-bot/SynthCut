# TVE-E2E-001 — Integrated frozen-requirement proof

Status: PASS / VERIFIED ON FEATURE BRANCH
Date: 2026-10-09
Branch: `chatgpt/ai-video-editor-design`
Baseline HEAD at E2E claim: `2efe693d1005e7732846d0940208575a1bb0ddfd`

> This artifact closes the feature-branch integrated proof only. It does **not** claim `MAIN VERIFIED`; merge/review/main verification remains a separate required gate.

## Input
- Frozen architecture/acceptance baseline: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`.
- Traceability: `docs/plan/TRACEABILITY_PLAN_V1.md`.
- Verified/committed implementation tasks `TVE-IMP-001..011`.
- Authoritative long-form fixture: `.spike-temp/lf001-corrected/lf300.aive`.
- Durable full-render/job evidence: `.tmp/TVE-IMP-006-runtime.json`.
- UI performance evidence: `docs/evidence/implementation/TVE-IMP-007.md`.
- Vietnamese policy evidence: `docs/evidence/implementation/TVE-IMP-008.md`.
- QA coordinator evidence: `docs/evidence/implementation/TVE-IMP-011.md`.

## Entry Gate
PASS:
- `TVE-IMP-001..011` are committed and recorded PASS.
- Git root verified as `E:/SynthCut`.
- E2E runs only inside project-local `.tmp` and uses retained project-local fixtures/tools.
- No production feature task was reopened merely to duplicate already-valid evidence.

## Work
A new task-local integrated verifier, `packages/core/scripts/smoke-e2e-integrated.ts`, executes only cross-feature interactions that were not already proven together:

1. Binds the E2E to the exact long-form project already used by IMP-006 full render evidence.
2. Creates a project-local **copy** of the `.aive` fixture; the retained fixture is read-only.
3. Adds a deterministic Vietnamese word-timing transcript only to the E2E copy.
4. Starts one production `EditorServer` over one `EditorEngine`.
5. Connects a UI-contract WebSocket using the same state/RPC transport used by desktop `CoreApi`.
6. Connects a real stdio MCP client to the same server.
7. Executes bounded MCP overview/chapter reads and long-form work-packet decomposition.
8. Executes a stale MCP EditPlan and proves zero mutation/no UI state advance.
9. Executes a forced coherent batch failure through MCP: removal of the second video track succeeds, removal of the final video track fails the runtime invariant, and checkpoint rollback restores the full project.
10. Verifies the UI state stream observes one consolidated restored-state broadcast rather than partial operations.
11. Executes the Vietnamese fail-closed unsafe transcript-cut request through the same MCP/core authority and proves zero mutation/review-needed.
12. Saves, restarts, reloads and proves authoritative `.aive` semantic state plus batch audit/checkpoint refs persist correctly.
13. Verifies no CapCut package dependency is required and independently checks the running process list for CapCut.
14. Reuses still-valid IMP-006/007/011 evidence instead of rerunning a 1.78 GB final export, UI performance benchmark, or redundant QA smoke.

## New integrated runtime evidence
Command:
`node node_modules/tsx/dist/cli.mjs packages/core/scripts/smoke-e2e-integrated.ts`

Final result: **PASS / exit 0**.

Marker:
`TVE-E2E-001 INTEGRATED PROOF PASSED`

Durable result:
`.tmp/TVE-E2E-001-runtime.json`

Measured result:
- projectId: `proj_jnjvadlpe3`;
- authoritative clips: `310`;
- authoritative duration: `1800 s`;
- MCP `project_overview`: `1708` bytes;
- MCP `inspect_chapter`: `24383` bytes;
- long-form work packets: `6`;
- initial UI/core revision: `340`;
- post-rollback revision observed through UI stream: `342`;
- rollback UI state broadcasts: exactly `1` consolidated transition;
- stale plan: rejected, zero mutation;
- forced coherent batch: `rolled_back`;
- rollback restored clips: `310`;
- Vietnamese transcript policy in restarted project cache: `language=vi`, `model=large-v3-turbo`;
- unsafe Vietnamese cut: `cuts=0`, `reviewNeeded=1`, zero mutation;
- save/restart: PASS, revision token refreshed;
- CapCut required: `false`.

The batch produced durable logical refs during the E2E run:
- `auditRef`: `tang-batch:batch-91d28cbc-9794-4f1b-b649-b267f784b158/audit.jsonl`;
- `checkpointRef`: `tang-batch:batch-91d28cbc-9794-4f1b-b649-b267f784b158/checkpoint.aive`.

The per-run directory is disposable and removed on PASS; the logical behavior and metrics are retained in `.tmp/TVE-E2E-001-runtime.json` and this evidence record.

## Reused durable evidence — not rerun blindly

### IMP-006 — same-project 30-minute render/jobs/cache proof
`.tmp/TVE-IMP-006-runtime.json` is PASS and is bound to the **same projectId `proj_jnjvadlpe3`**, same `310`-clip / `1800 s` fixture used by this E2E.

Reused facts:
- preview: exact `1800 s`, 1280×720, 30 fps, H.264 + AAC;
- bounded command max: 3 inputs / 1601 chars preview, 3 / 1615 final;
- unrelated segment cache reuse: `299/300 = 99.6667%`;
- remote frame: `0` renders + `1` cache hit;
- 20-cycle RSS ratio: `1.04818x`;
- background export progress observed;
- cancel: clean, no partial final output, no bounded transient directory;
- final FFprobe: exact `1800 s`, `1920×1080`, `30 fps`, H.264 + AAC, video+audio;
- verified final output size before intentional cleanup: `1,775,895,551` bytes.

The large final MP4 was intentionally deleted after IMP-006 FFprobe assertions. E2E therefore reuses the durable facts rather than falsely claiming a fresh final file was produced here.

### IMP-007 — 300-clip production UI convergence proof
Reused valid evidence from `docs/evidence/implementation/TVE-IMP-007.md`:
- first paint `185 ms`;
- authoritative clips `300`;
- rendered clip/element DOM `6` initial / `10` max;
- interaction p95 `6.2 ms`;
- drag reflection `6.2 ms`;
- `0` long tasks;
- visible/offscreen selection `1/1`;
- renderer crash=false.

New E2E evidence complements that performance proof by showing the production UI WebSocket contract and MCP connect to the **same live core engine/project/revision** and that coherent rollback produces one state broadcast.

### IMP-011 — QA coordinator proof
Reused valid evidence from `docs/evidence/implementation/TVE-IMP-011.md`:
- structural QA;
- exact rendered-frame evidence;
- preview video+audio probe;
- final-delivery duration/canvas/audio checks;
- STALE/FAIL evidence is durable but never indexed as accepted;
- PASS evidenceRef is indexed and survives save/restart.

This E2E does **not** claim a fresh 30-minute `run_qa_verification` render. Combining the same-project IMP-006 full-delivery facts with the independently verified IMP-011 coordinator semantics is deliberate evidence composition under the anti-duplicate rule.

## No-CapCut runtime proof
Independent process inspection after E2E:
- `CapCutProcessCount = 0`;
- no package manifest scanned by the E2E contains a required `capcut` dependency;
- the integrated flow completed through SynthCut/Tang core + MCP + local FFmpeg evidence only.

Result: PASS for AC-19 / no required CapCut runtime.

## Root convergence gate
Command:
`npm run typecheck`

Result: **PASS / exit 0** across core + MCP + desktop after the integrated proof.

## Failures found and repaired inside E2E TEST only
1. First run asserted `asset.transcript.language` on live project state. Production intentionally extracts heavy transcript payloads into `EditorEngine.assetCaches` on load and leaves only `transcriptIndexed` in live project state. Harness was repaired to use public `engine.getTranscript(assetId)`. No production code changed.
2. Second run expected `Client.callTool()` to reject for stale EditPlan. MCP correctly returned a tool response with `isError=true`; harness was repaired to parse the MCP protocol response before asserting `STALE_EDIT_PLAN`. No production code changed.

Both failures were test-harness assumptions and did not invalidate any IMP checkpoint.

## Frozen requirement convergence
| Requirement | E2E verdict | Evidence |
|---|---|---|
| AC-01 local/non-destructive source path | PASS | retained read-only source fixture + project-local E2E copy; prior core import evidence retained |
| AC-02 UI/MCP same state | PASS | UI WebSocket + MCP attached to same EditorServer; project/revision parity; one rollback broadcast |
| AC-03 word timing | PASS | IMP-008 + E2E cached Vietnamese word transcript |
| AC-04 deterministic candidates | PASS by valid prior evidence | IMP-010/existing analysis contract; no contradictory E2E evidence |
| AC-05 NLE editing surface | PASS by regression/implementation evidence | IMP-001..011 + root typecheck |
| AC-06 proxy/full-res render | PASS | IMP-006 same-project durable render evidence |
| AC-07 observable/cancelable work | PASS | IMP-006 same-project progress/cancel durable evidence |
| AC-08 incremental cache | PASS | IMP-006 same-project 99.6667% cache reuse |
| AC-09 rendered truth / QA | PASS by evidence composition | IMP-006 same-project rendered delivery + IMP-011 verified QA coordinator semantics |
| AC-10 save/load/recovery | PASS | new E2E save/restart + rollback refs |
| AC-11 200–300 clips/no flatten | PASS | new E2E 310-clip authoritative project |
| AC-12 local YouTube MP4 | PASS | IMP-006 same-project exact 1080p H.264+AAC FFprobe evidence |
| AC-13 traceability | PASS for Build & Verify | per-task evidence + this E2E; final trace audit remains Phase 8 |
| AC-14 bounded reads | PASS | new E2E 1708 B overview / 24383 B chapter |
| AC-15 stale fail-closed | PASS | new E2E stale MCP plan zero mutation/no UI broadcast |
| AC-16 coherent recoverable batch | PASS | new E2E forced rollback + durable refs + restart |
| AC-17 300-clip UI | PASS | IMP-007 performance + new same-core UI state-stream convergence |
| AC-18 Vietnamese policy | PASS | new E2E `vi` / `large-v3-turbo` + unsafe zero-cut/reviewNeeded, plus IMP-008 frozen sample evidence |
| AC-19 no CapCut runtime | PASS | manifest check + process count 0 + local integrated flow |

Architecture/process AC-A01..A09 remain backed by frozen design, task-scoped review/commits and the unchanged extension-first architecture; this E2E found no contradictory evidence requiring DESIGN loopback.

## Exit Gate
PASS on feature branch:
- one authoritative 30-minute / 310-clip project is bound across same-project render evidence and new core/MCP/UI interaction proof;
- bounded reads PASS;
- stale-plan rejection PASS;
- coherent rollback/recovery + restart PASS;
- Vietnamese fail-closed policy PASS;
- viewport convergence has valid production evidence and UI state authority converges with MCP/core;
- jobs/cancel/final 1080p MP4 are bound by projectId to durable IMP-006 evidence;
- QA evidence contract is valid and explicitly composed rather than falsely rerun;
- no required CapCut runtime/dependency;
- root typecheck PASS;
- no unsupported `MAIN VERIFIED` claim is made.

## Artifact
- `docs/evidence/e2e/TVE-E2E-001.md`
- `packages/core/scripts/smoke-e2e-integrated.ts`
- `.tmp/TVE-E2E-001-runtime.json` (runtime-local durable metrics; excluded from commit)

## Evidence
- E2E PTY final exit code `0` and marker `TVE-E2E-001 INTEGRATED PROOF PASSED`.
- `.tmp/TVE-E2E-001-runtime.json`.
- `.tmp/TVE-IMP-006-runtime.json`.
- `docs/evidence/implementation/TVE-IMP-001.md` … `TVE-IMP-011.md`.
- root typecheck exit `0`.
- process inspection: CapCut process count `0`.

## Owner / Authority
ChatGPT Web owns verification judgment; FileMCP-E executed the local proof. Only actual merged-main verification may authorize `MAIN VERIFIED`.

## Risks / Open Questions
- Full 30-minute final media is not retained after IMP-006 PASS; only FFprobe-backed durable metrics/logs are retained by design.
- E2E deliberately does not rerun a redundant 30-minute QA preview or UI benchmark; it composes already-valid evidence and runs only new cross-feature interactions.
- Release/package proof remains Phase 7 and must not be conflated with this feature-branch E2E.

## Loopback
- Any future contradiction in stale/batch/Vietnamese/UI/render/QA behavior reopens only the owning IMP stage first.
- Frozen DESIGN reopens only if evidence contradicts the frozen contract rather than an implementation/test defect.
- Current next gate: task-scoped review/commit of E2E evidence, then PR/review/merge/main verification if repository workflow is available.
