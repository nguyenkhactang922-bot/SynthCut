# TASK_QUEUE — Tang AI Video Editor / SynthCut

Canonical lifecycle: `docs/process/PROJECT_LIFECYCLE_V1.md`
Frozen baseline: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`
Phase 5 plan: `docs/plan/DEPENDENCY_GRAPH_V1.md`, `TASK_DECOMPOSITION_V1.md`, `TRACEABILITY_PLAN_V1.md`

## PHASE 1 — DISCOVER — PASS
- TVE-DISC-001 Raw Idea — DONE — `docs/discovery/PRODUCT_DISCOVERY_V1.md`
- TVE-DISC-002 Problem Discovery — DONE — same artifact
- TVE-DISC-003 Discovery Research — DONE — same artifact
- TVE-DISC-004 I/O Hypotheses — DONE — same artifact

## PHASE 2 — DEFINE — FROZEN
- TVE-DEF-001 Brief — DONE/FROZEN — `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`
- TVE-DEF-002 Scope — DONE/FROZEN — `docs/define/PRODUCT_DEFINITION_V1.md`
- TVE-DEF-003 Constraints — DONE/FROZEN — same artifact
- TVE-DEF-004 Acceptance Criteria — DONE/FROZEN — AC-18 amendment explicitly reconciled 2026-10-07

## PHASE 3 — RESEARCH — PASS
- TVE-RES-001 Solution Research + SynthCut audit — DONE
- TVE-RES-002 Repo/Tool/Framework Search — DONE
- TVE-RES-003 License/Security Audit — DONE FOR CURRENT PERSONAL/NONCOMMERCIAL SCOPE
- TVE-RES-004 Candidate Comparison/Reconciliation — DONE
Evidence: `docs/research/` canonical research set.

## PHASE 4 — DESIGN — FROZEN
- TVE-ADR-001 ADR/technology boundaries — FROZEN — `docs/adr/ADR-001_BASE_ARCHITECTURE.md`
- TVE-DES-002 Living system design — FROZEN — `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md`
- TVE-AUD-001 Initial independent audit — DONE
- TVE-LC-AUD-001 Lifecycle delta audit — DONE
- TVE-AUD-002 Lifecycle re-entry audit — DONE
- TVE-SPIKE-DEPSEC-001 — DONE/PASS
- TVE-SPIKE-MCP-CONTEXT — DONE/PASS
- TVE-SPIKE-UI-300 — DONE/PASS
- TVE-SPIKE-LF-001 — DONE/PASS
- TVE-SPIKE-SAFE-BATCH-001 — DONE/PASS
- TVE-SPIKE-VI-STT — DONE/PASS UNDER REVISED AUTOMATED AC-18 — `docs/evidence/spikes/TVE-SPIKE-VI-STT.md`
- TVE-AUD-003 Freeze readiness historical hold — DONE/HISTORICAL
- AC18_AUTOMATED_GATE_CHANGE_004 — DONE/PASS
- FREEZE_READINESS_004 — DONE/PASS TO FREEZE
- TVE-FRZ-001 — DONE/PASS/FROZEN — `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`

Do not rerun PASS DESIGN spikes unless scope/requirements/code/environment/contradictory evidence makes them stale.

## PHASE 5 — PLAN IMPLEMENTATION — PASS

### TVE-PLAN-001 — Dependency Graph
Status: DONE/PASS
Artifact: `docs/plan/DEPENDENCY_GRAPH_V1.md`

### TVE-PLAN-002 — Task Decomposition
Status: DONE/PASS
Artifact: `docs/plan/TASK_DECOMPOSITION_V1.md`

### TVE-PLAN-003 — Requirement/Test/Evidence Traceability
Status: DONE/PASS
Artifact: `docs/plan/TRACEABILITY_PLAN_V1.md`

### TVE-PLAN-004 — Production Task Queue
Status: DONE/PASS after this queue readback/verification
Artifact: `tasks/TASK_QUEUE.md`

Phase 5 exit rule: production implementation may begin only after post-update verification confirms the three plan artifacts + this queue are mutually consistent. When that verification PASSes, set `IMPLEMENTATION_ALLOWED=true` and CLAIM only the first dependency-ready task.

---

# PHASE 6 — BUILD & VERIFY — PRODUCTION QUEUE

Canonical per-task lifecycle:
`CLAIM → ANALYZE → PLAN → CODE → TEST → EVIDENCE → VERIFY → COMMIT → PR (if available) → REVIEW → MERGE → MAIN VERIFIED → NEXT TASK`

Git note: repo-local identity is configured as `nguyenkhactang922-bot <nguyenkhactang813@gmail.com>`. Keep task-scoped commits and never mix unrelated WIP.

## TVE-IMP-001 — Tang metadata sidecar foundation
Status: DONE / COMMITTED — `622769d`
Dependencies: TVE-FRZ-001 + TVE-PLAN-001..004 PASS
Scope/test/evidence: `docs/plan/TASK_DECOMPOSITION_V1.md#tve-imp-001--tang-metadata-sidecar-foundation`
Primary candidate files: new `packages/core/src/tang/metadata.ts`, narrow `packages/core/src/engine.ts`, optional shared types.
Completion requires: task acceptance + tests + evidence + review + commit when Git identity is available.

## TVE-IMP-002 — Bounded project/chapter/range/transcript read model
Status: DONE / COMMITTED — `c0e62eb`
Dependencies: IMP-001 committed at `622769d`
Primary candidate files: new `packages/core/src/tang/read-model.ts`, `packages/core/src/rpc.ts`, narrow engine accessors.

## TVE-IMP-003 — MCP bounded tool exposure and operator contract
Status: DONE / COMMITTED — `68adf99`
Dependencies: IMP-002 committed at `c0e62eb`
Primary candidate files: `packages/mcp/src/index.ts`, `packages/mcp/src/guide.ts`.

## TVE-IMP-004 — EditPlan, revision guard and dry-run
Status: DONE / COMMITTED — `3ab9518`
Dependencies: IMP-003 committed at `68adf99`; IMP-001 semantic dependency satisfied
Primary candidate files: new `packages/core/src/tang/edit-plan.ts`, `packages/core/src/rpc.ts`, narrow `engine.ts` hooks.
Core-lane ordering: execute after IMP-003 has completed its core-read dependency path to reduce shared-file conflict, even though semantic dependency is IMP-001.

## TVE-IMP-005 — Checkpoint-backed coherent batch/audit/rollback
Status: DONE / COMMITTED — `840bacd`
Dependencies: IMP-004 committed at `3ab9518`
Primary candidate files: new `packages/core/src/tang/batch.ts`, `engine.ts`, `rpc.ts`.

## TVE-IMP-006 — Bounded long-form preview/export execution
Status: DONE / COMMITTED — `52039c5`
Evidence: `docs/evidence/implementation/TVE-IMP-006.md`
Dependencies: IMP-005 committed at `840bacd` (shared-core serialization)
Primary candidate files: `packages/core/src/engine.ts`, `packages/core/src/ffmpeg/`, `packages/core/src/jobs.ts` only where needed.

## TVE-IMP-007 — 300-clip viewport culling/virtualization
Status: DONE / COMMITTED — `7741f69`
Evidence: `docs/evidence/implementation/TVE-IMP-007.md`
Dependencies: FROZEN DESIGN
Primary candidate files: `apps/desktop/src/timeline.tsx`, optional styles/helpers.
Convergence: must be verified before E2E.

## TVE-IMP-008 — Vietnamese STT + fail-closed transcript-cut policy
Status: DONE / COMMITTED — `dcb3579`
Evidence: `docs/evidence/implementation/TVE-IMP-008.md`
Dependencies: IMP-006 verified/committed
Primary candidate files: `packages/core/src/whisper/transcribe.ts`, transcript edit RPC/helpers, policy helper.
Frozen policy: multilingual `large-v3-turbo`, explicit `vi`, >=120 ms guard each side, insufficient gap = NOOP/review-needed.

## TVE-IMP-009 — Dependency hardening promotion
Status: DONE / COMMITTED — `f46feda`
Evidence: `docs/evidence/implementation/TVE-IMP-009.md`
Dependencies: FROZEN DESIGN
Primary files: `package-lock.json` only; no manifest/source change.
Convergence: production audit 0; remaining dev/packaging findings explicitly carried to release hardening.

## TVE-IMP-010 — Tang long-form editorial orchestration contract
Status: DONE / COMMITTED — `10711c1`
Evidence: `docs/evidence/implementation/TVE-IMP-010.md`
Dependencies: bounded reads/MCP + safe batch + Vietnamese policy
Primary candidate files: `packages/mcp/src/guide.ts`, `packages/mcp/src/index.ts`, optional pure `packages/mcp/src/tang/` helpers.

## TVE-IMP-011 — QA and durable evidence coordinator
Status: DONE / COMMITTED — `1cf0b80`
Evidence: `docs/evidence/implementation/TVE-IMP-011.md`
Dependencies: IMP-005 + IMP-006 + IMP-008 + IMP-010 — all satisfied
Primary scope: structural → rendered frame → preview/audio → delivery verification and evidence refs.

## TVE-E2E-001 — Integrated frozen-requirement proof
Status: DONE / COMMITTED — `c921f9e`
Evidence: `docs/evidence/e2e/TVE-E2E-001.md`
Required integrated proof: 30-minute/~300 clips, UI+MCP same project, bounded reads, stale-plan rejection, safe batch rollback, Vietnamese policy, viewport UI, jobs/cancel, final 1080p MP4, no required CapCut runtime, restart/persistence/error paths.
Artifact target: `docs/evidence/e2e/TVE-E2E-001.md`.

## MAIN VERIFIED
Status: DONE / PASS — `personal/main@af92f20` verified after PR #1 review+merge.
Evidence: `docs/evidence/e2e/TVE-MAIN-VERIFICATION.md`.
Merged-main root typecheck PASS; integrated E2E PASS / exit 0; merge tree equals reviewed feature tip. Upstream `origin/main` was not modified.

---

# COMMERCIAL RELEASE RE-ENTRY — B + C — 2026-10-09

## TVE-REL-001 — Commercial scope / license-security re-entry / ADR / Phase-7 plan
Status: DONE / PASS
Dependencies: MAIN VERIFIED + explicit user authorization `B + C`
Artifacts:
- `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
Result: GPL commercial distribution path accepted with fail-closed Remotion, FFmpeg provenance, release-tool security, fork identity/updater and trusted-signing gates.

# PHASE 7 — RELEASE & OPERATE — ACTIVE
Canonical plan: `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
Baseline retained: `personal/main@af92f20` MAIN VERIFIED.
Branch: `chatgpt/phase7-commercial-release`.

## TVE-REL-002 — Fork identity + updater ownership
Status: DONE / PASS
Dependencies: REL-001 PASS
Evidence: `docs/evidence/release/TVE-REL-002.md`
Result: fork display/app identity, installer identity and updater publish provider now use `Tang AI Video Editor` + `nguyenkhactang922-bot/SynthCut`; upstream visible logo/name removed from renderer bundle; typecheck/build/static scans PASS.

## TVE-REL-003 — Third-party provenance + corresponding-source compliance
Status: DONE / PASS / COMMITTED — `e051b8d`
Evidence: `docs/evidence/release/TVE-REL-003.md`
Result: exact Windows FFmpeg pin + fail-closed version/hash gate; source offer/notices/package-lock/distribution-doc hashes recorded; 36 staged files independently re-hashed PASS; root typecheck + diff check PASS.

## TVE-REL-004 — Release-tool dependency security hardening
Status: DONE / PASS / COMMITTED — `20c8ff9`
Dependencies: REL-003 committed at `e051b8d`
Evidence: `docs/evidence/release/TVE-REL-004.md`
Result: electron-builder upgraded non-force from 25.1.8 to 26.15.3; full audit reduced 11 high + 1 critical to 8 documented build-only moderate findings; production audit 0; build/typecheck/unpacked package smoke PASS.

## TVE-REL-005 — Release workflow + version metadata hardening
Status: DONE / PASS / COMMITTED — `227535b`
Dependencies: REL-004 committed at `20c8ff9`
Evidence: `docs/evidence/release/TVE-REL-005.md`
Result: version set aligned at `1.0.6`; manual workflow is read-only/non-publishing; tag publication is fork-only + commercial-gated; upstream npm namespace publication disabled; artifact/version/tag negative gates PASS.

## TVE-REL-006 — Local packaged acceptance
Status: DONE / PASS
Dependencies: REL-005 committed at `227535b`
Evidence: `docs/evidence/release/TVE-REL-006.md`
Accepted candidate source manifest: `225a987dfb5490949ba107eac4c9e0dd0c74499b`, tracked dirty=false.
Result: NSIS+ZIP integrity PASS; hashes/provenance/update metadata PASS; packaged MCP/core/bundled-resource smoke PASS; project save/open PASS; representative H.264+AAC export PASS; installer exit 0; installed desktop launch PASS. No publication occurred. `asar=false` was assessed and remains deferred hardening because an ASAR package needs additional MCP launcher/path work.

## TVE-REL-007 — Commercial authorization / license strategy
Status: DONE / PASS — owner-approved unsigned commercial lane
Dependencies: REL-006 PASS
Evidence: `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md` + `docs/evidence/release/TVE-REL-007-REMOTION.md` + `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md` + retained `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`
Result:
- `REMOTION_LICENSE_GATE=PASS` / `FREE_LICENSE_ELIGIBLE`.
- `SUPABASE_LICENSE_BACKEND=PASS`; founder/admin key prefix `TAIVE-F3E3Y`, maxDevices=3, no expiry, activeDevices=0 after exact test cleanup; plaintext key is not stored in Git.
- bounded DEFINE/ADR/PLAN amendment now explicitly permits the current unsigned commercial lane with owner-accepted Unknown-publisher/SmartScreen risk.
- packaged desktop activation/restart persistence through real renderer/preload/main IPC PASS; same device remained activeDevices=1; persisted key encrypted via Electron `safeStorage`.
- full 1.1.0 NSIS/ZIP dist PASS / exit 0; installer SHA-256 `867fb75aceecab263ad0a5b3914f55ce71772dfa6aa923749b689dc1ecad6451`; ZIP SHA-256 `2ff621e45d4c7d78211282beec983fecc66ea6f2f635f074aa8ece53d2d004f2`.
- installer and packaged app both intentionally `NotSigned`; trusted signing remains optional future hardening.
- no tag/push/PR/merge/GitHub Release/updater side effect occurred in REL-007.

## TVE-REL-008 — GitHub Release publication
Status: DONE / PASS / PUBLISHED / VERIFIED
Dependencies: REL-007 PASS
Target: `nguyenkhactang922-bot/SynthCut` only.
Evidence: `docs/evidence/release/TVE-REL-008.md` plus retained repair evidence.
Result: Release run `38137052906` SUCCESS; GitHub Release `v1.1.0` published at personal fork release id `409639821`; personal `main` and `v1.1.0^{}` both `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`; bundle provenance clean; release metadata PASS; `latest.yml` correct; public-downloaded EXE/ZIP sizes and SHA-256 independently recomputed and exactly match `SHA256SUMS.txt` + GitHub asset digests. Published `v1.1.0` is durable historical evidence and must not be overwritten in place.

## TVE-REL-009 — Installed updater E2E + stable verification
Status: ACTIVE / OWNED-CORE STARTUP PREREQUISITE FAIL; v1.1.3 RELEASE-FORWARD PASS RETAINED; SHARED-CORE PROOF PENDING
Dependencies: REL-008 PASS
Evidence: retained REL-009 identity/install/coordination/readiness evidence + `docs/evidence/release/TVE-REL-009-V113-RELEASE-FORWARD.md`
Repair/release-forward result: desktop package identity is `tang-ai-video-editor`; reviewed personal main is `452dd263`; `v1.1.1` is published/verified and immutable.
First updater attempt result: discovery/download of personal-fork v1.1.1 and executable version change to `1.1.1.0` occurred, but the resulting in-place install tree is incomplete (`electron-updater` absent; only `@aive` remains under top-level node_modules). Fresh v1.1.1 install is healthy with 224 modules, proving the public package is not the defect.
Root isolation finding: old 1.0.6 app attached to a pre-existing shared core on port 4789; attached cores intentionally survive app quit, invalidating the updater-install isolation precondition and allowing install-tree file locking during NSIS replacement.
Rerun rule: rerun only the failed updater transition using the accepted existing 1.0.6 installer, new controlled install/userData/APPDATA/LOCALAPPDATA/TEMP/AIVE_DATA_DIR and dedicated AIVE_PORT; prove old app owns core and core exits before install; then verify full 1.1.1 module tree/electron-updater, personal-fork feed + unique cache, `NotSigned`, same-device license revalidation and unchanged project/user-state hashes. Do not republish v1.1.1 or rerun REL-001..008.
Repair update: retained owned-core probe evidence proved the race also occurs when the app owns the core. v1.1.2 coordination repair disables auto-install-on-quit, defers shared-core install, waits for owned-core exit before quitAndInstall, and has deterministic CI smoke coverage. PR #11 CI PASSed and merged to personal main `196dccb6`; Release run `38237764462` SUCCESS and public v1.1.2 metadata/provenance/hash verification PASS. Runtime fixed-code updater E2E remains the only incomplete REL-009 stage.
Repair commit `2c19c93b386436cf941c46d4373034025957be88` was reviewed through PR #11 and merged; `v1.1.2` is published/verified. Controlled fixed lower-version fixture `.tmp/rel009-fixed-lower-dist` is accepted for the remaining runtime E2E.
Packaged readiness finding/repair: the next fixed-code runtime attempt reached a healthy owned core/server.json but the desktop timed out because child stdout ready was not delivered. v1.1.3 repair accepts only matching-child `server.json` + `/health` as fallback, rejects PID mismatch, cleans failed children, and has deterministic CI smoke + packaged runtime proof. PR #12 CI/merge PASS; Release run `38275741580` SUCCESS; public v1.1.3 source/tag/main/provenance/update identity/checksum/NotSigned verification PASS. Evidence: `docs/evidence/release/TVE-REL-009-PACKAGED-CORE-READY-FAIL.md`, `TVE-REL-009-PACKAGED-CORE-READY-REPAIR.md`, `TVE-REL-009-V113-RELEASE-FORWARD.md`. Remaining scope is only owned-core updater E2E + shared-core defer runtime proof.

## TVE-REL-010 — Monitor / incident handoff
Status: BLOCKED BY REL-009

# PHASE 8 — LEARN — FUTURE
Final Traceability Audit → Feedback → New Requirement/Bug/Improvement → correct lifecycle loopback.

# NEXT ELIGIBLE TASK
`TVE-REL-009 release-forward + runtime E2E`: fresh local candidate `1.1.4` source-to-package and packaged desktop core readiness are PASS (`docs/evidence/release/TVE-REL-009-V114-PACKAGED-RUNTIME.md`). Review scoped diff and configured `personal` remote, commit only REL-009 source/version/evidence/state files, follow PR/CI/review/merge gates, then produce and verify a new immutable `v1.1.4` release. Only after artifact/provenance checks pass, run the outstanding owned-core updater E2E + same-device license/feed revalidation and the separate shared-core defer-without-mutation proof. Never modify `v1.1.0`–`v1.1.3`.


### REL-009 latest runtime checkpoint — 2026-10-13
- Owned-core startup prerequisite: FAIL; actual UI error and absent server.json/port listener recorded in docs/evidence/release/TVE-REL-009-V113-OWNED-E2E-FAIL.md.
- Lower fixture installation and readiness-launcher hash parity: PASS; retain and do not repeat.
- v1.1.3 release-forward: PASS and immutable; do not rerun publication.
- Next action: investigate packaged Electron child Node-mode/fuse/launch behavior; only after focused launch proof passes, rerun the owned-core updater transition. Shared-core defer-without-mutation proof remains pending.

### REL-009 follow-up diagnostic checkpoint — 2026-10-13
- RunAsNode fuse: Enabled; do not assume a disabled fuse.
- Same Electron executable + packaged core CLI passed through Node child_process; packaged core-launcher readiness/health passed with all bundled asset paths.
- Actual desktop-main startup still fails and root cause remains unresolved; next action is test-only instrumentation at main-module load and immediately before ensureCore to capture effective process path/data dir/port and asset-env setup.
- Do not retry updater E2E until the actual desktop-main startup discrepancy is explained and a focused packaged-main proof passes.

### REL-009 post-update runtime checkpoint — FAIL (2026-10-13 resume audit)
- Existing updater transition was not restarted. Logs show downloaded v1.1.3 and NSIS launch; the original PTY expired and `result.json` is absent.
- Read-only verification: installed EXE ProductVersion `1.1.3.0`, package version `1.1.3`, `electron-updater` present, Authenticode `NotSigned`; project and marker SHA-256 match the source fixture; same deviceId remains.
- Continued only the post-update verification stage by launching the installed app once with the same isolated userData/APPDATA/LOCALAPPDATA/TEMP/AIVE_DATA_DIR/AIVE_PORT. PID 146048 exited. `postupdate-stderr.log` proves core startup FAIL: `@remotion/renderer@4.0.481` imports default from `execa`, but the renderer's required nested `execa@5.1.1` is absent; root workspace `execa@9.6.1` is incompatible. License revalidation and updater feed checks were not reached; task is not PASS.
- NEXT_EXACT_ACTION: inspect packaging/staging rules, repair dependency closure for renderer's pinned execa 5.1.1, add focused packaged-runtime regression coverage, review, then create a new immutable release version only if gates authorize. Never republish/retag v1.1.0–v1.1.3; do not rerun updater transition or earlier PASS stages.

### TVE-REL-009 — 2026-10-13 dependency closure update
- Focused packaging fix + smoke are implemented locally; regression smoke PASS and unpacked electron-builder afterPack PASS. Renderer ESM import resolves nested `execa@5.1.1`; seven sibling packages staged.
- Whole packaged runtime remains FAIL: desktop still times out awaiting core; direct CLI probe did not publish `server.json` or health within the probe window. License revalidation/feed checks are not PASS.
- Do not rerun updater transition, earlier PASS stages, or publish/retag v1.1.0–v1.1.3. Keep existing release evidence.
- NEXT_EXACT_ACTION: diagnose packaged core CLI startup with a fresh disposable fixture; record exact process tree, command line, cwd, effective env, stdout/stderr and server.json/health outcome; repair only the demonstrated startup cause. Continue REL-009 only after packaged core readiness passes.
- Follow-up diagnostics: instrumented only the disposable unpacked app's core launcher to log spawn executable/CLI/cwd/env and child PID/error/exit. A fresh isolated launch (PID 147704) stayed alive for 27s but produced no `server.json`, health response, stdout diagnostics or stderr diagnostics; it was closed during cleanup. No matching diagnostic process or listeners on ports 48722–48728 remain. This run is INCONCLUSIVE, not a pass and not a proven root cause.
- Latest narrow checks: `node --check apps/desktop/build/after-pack.cjs` PASS; `node --check scripts/release/smoke-remotion-dependency-packaging.cjs` PASS; focused dependency smoke PASS; `git diff --check` exit 0 (only Git LF→CRLF informational warnings).

### REL-009 packaged child-launch diagnostic checkpoint — 2026-10-13 14:53 +07
- Bootstrap reverified: PROJECT_ROOT/git root `E:\SynthCut`; branch `chatgpt/phase7-commercial-release`; HEAD `47dd8247ba9394999b5a3b4cc2259755ef673b7b`. Working tree remains dirty with existing release-lane changes and untracked scratch/artifacts; none were reset or deleted. No active SynthCut app/core diagnostic process or listeners on ports 48720–48740 remained after probes.
- Packaged dependency closure remains independently verified: nested renderer `execa@5.1.1` exists; focused packaging smoke PASS; direct ESM import of packaged `@remotion/renderer` PASS; direct ESM import of packaged `@aive/core/dist/engine.js` PASS.
- New bounded child-launch probes are inconsistent, so root cause is NOT proven:
  - Direct in-process import of packaged `@aive/core/dist/cli.js` (system Node, bundled asset paths, port 48737) emitted `{"event":"ready","port":48737,...}`, logged FFmpeg/listening, and wrote `server.json`; the probe then terminated the process at its timeout. This proves that code path can become ready under the direct in-process Node control.
  - One full-PATH child probe using system Node reached PASS on port 48738 and wrote matching `server.json`; a repeat full-PATH run did not become ready during its 7-second observation window. Treat the repeat as inconclusive, not a stable PASS.
  - The packaged branded `Tang AI Video Editor.exe` used as the child did not emit stdout/stderr or publish `server.json` during the observed 7-second window. Separate 8-second `spawnSync` probes with a minimal PATH timed out for system Node, branded Electron and the raw Electron binary; because the minimal-PATH setup itself affected the Node control, those results do not isolate product root cause.
  - A packaged main launch from prior smoke4 did reach core readiness, while smoke5/6 did not; the invocation/environment difference is still unknown. The temporary core-launcher instrumentation did not emit its pre-spawn markers in the failing runs, so do not infer a root cause from those runs.
- No source production code changed in this checkpoint. Probe scripts are disposable artifacts under `.tmp/`; do not treat them as production tests. No updater transition, install, commit, push, PR, tag or release side effect was triggered. v1.1.0–v1.1.3 remain immutable.
- Task classification: `TVE-REL-009 = FAIL` for packaged core readiness; dependency packaging substage = PASS; post-update license/feed acceptance and shared-core defer proof = NOT RUN / NOT PASS.
- NEXT_EXACT_ACTION: inspect and compare the exact launch command/environment in the existing passing `.tmp/rel009-afterpack-runtime-smoke4` invocation and failing smoke5/6 plus `.tmp/rel009-v113-owned-e2e2.ps1`; capture actual app `process.execPath`, inherited PATH and effective `AIVE_*` values before `ensureCore`, then run one bounded diagnostic using the same known-good invocation shape. Resolve the discrepancy with reproducible evidence before any source fix or updater retry. Do not rerun dependency smoke, packaging build, updater transition, or any earlier PASS stage.


### REL-009 packaged launch root cause + disposable runtime repair — 2026-10-13 15:14 +07
- Root cause now reproducible: passing the packaged branded Electron EXE the core CLI path directly as argv[1] (spawn(appExe, [cliPath]) left the child alive without stdout/stderr or server.json; the same EXE in Node mode with -e plus dynamic import of the CLI file URL emitted readiness. The production launcher now starts with -e and a pathToFileURL(cliPath) dynamic-import bootstrap, with a fail-visible import error handler. This is a narrow REL-009 runtime fix; no version/tag/release change has been made.
- Deterministic launcher fallback smoke after the source change: REL009_CORE_READY_FALLBACK_SMOKE=PASS. Launcher syntax check PASS.
- New focused packaged runtime regression scripts/release/smoke-packaged-core-launcher.cjs launches the actual packaged branded EXE as the core child, then verifies matching-PID server.json and /health=200. Run against the disposable packaged output: REL009_PACKAGED_CORE_LAUNCH_SMOKE=PASS pid=135540 port=64065.
- Full packaged desktop smoke using the patched launcher in the disposable output: server.json pid=146900 port=48743, /health=200, logs include [aive] started core on port 48743; all processes were cleaned up. Only the disposable package copy's launcher was replaced; its main file was test-instrumented. This is strong runtime evidence for the fix, but a fresh package build is still required to prove source-to-package integration.
- Release workflow now invokes node scripts/release/smoke-packaged-core-launcher.cjs apps/desktop/build/dist/win-unpacked after packaging; release validator checks that invocation and smoke contract. Fresh packaging and the integrated workflow/validator checks remain pending.
- TVE-REL-009 remains ACTIVE / NOT DONE. Updater transition was not rerun; license revalidation/feed acceptance and shared-core defer proof remain NOT PASS. No commit/push/PR/merge/tag/release side effect occurred; v1.1.0–v1.1.3 remain immutable.
- NEXT_EXACT_ACTION: run the narrow electron-builder --dir build into the existing project-local disposable output using .tmp/rel009-afterpack-test.config.cjs; confirm the new source launcher is in the fresh package; run the packaged-core-launch smoke against that fresh output; then run the release validator and diff checks. Do not rerun earlier updater or release-forward stages.


### REL-009 fresh package integration checkpoint — 2026-10-13 15:23 +07
- Source-to-package integration PASS: fresh electron-builder --dir completed exit 0 to .tmp/rel009-afterpack-test-output/win-unpacked. Build log .tmp/rel009-afterpack-build2.log contains REMOTION_DEPENDENCY_PACKAGING_PASS execa=5.1.1. Fresh packaged core-launcher.cjs SHA-256 equals source launcher: D63B42C4487D6AC9C0E60B2D50A01321A12DD3DDCF67F0D6DEBEF7046FE8F316. Packaged renderer nested execa version is 5.1.1.
- Packaged-child runtime smoke PASS: REL009_PACKAGED_CORE_LAUNCH_SMOKE=PASS pid=147072 port=49511; matching server.json PID and /health=200.
- Fresh packaged desktop runtime PASS: isolated app PID 149352; owned core PID 147912; server.json port 48744; /health=200; stderr records [aive] started core on port 48744. App/core were cleaned up after verification.
- Narrow checks: source launcher syntax PASS; smoke-core-launcher-ready-fallback PASS; packaged-launch smoke syntax PASS; release-validator syntax PASS; git diff --check exit 0 (only LF/CRLF informational warnings).
- REL-009 packaged-core startup prerequisite is now PASS. REL-009 overall remains ACTIVE/NOT DONE: the currently published v1.1.3 is immutable and still does not contain this fix. The fix requires a new immutable release version before installed updater E2E can validate it; license/feed revalidation and shared-core defer proof remain NOT PASS.
- No commit/push/PR/merge/tag/release side effect occurred. Next: inspect exact version/lock workspace fields and current scoped diff; prepare a new release-forward version (v1.1.4 only, never rewrite v1.1.3), then validate/package that version before running only the outstanding updater runtime stages.


### REL-009 v1.1.4 fresh package + runtime checkpoint — 2026-10-13 16:26 +07
- Build process PID 144880 completed with exit 0 at 16:23:37 +07. Logs: `.tmp/rel009-afterpack-build-v2.stdout.log`, `.tmp/rel009-afterpack-build-v2.stderr.log`, exit marker `.tmp/rel009-afterpack-build-v2.exit.txt`. Disposable output: `.tmp/rel009-afterpack-test-output-v2/win-unpacked`, package version 1.1.4.
- afterPack marker PASS: `REMOTION_DEPENDENCY_PACKAGING_PASS execa=5.1.1`; nested renderer execa version 5.1.1; source/package core-launcher SHA-256 matches `D63B42C4487D6AC9C0E60B2D50A01321A12DD3DDCF67F0D6DEBEF7046FE8F316`.
- Focused packaged child smoke PASS: PID 148880, port 62740, matching server.json PID and /health=200. Fresh full packaged desktop runtime PASS: app PID 141244, core PID 146976, port 48749, /health=200, `[aive] started core on port 48749`; both processes cleaned up. Runtime result marker: `REL009_PACKAGED_DESKTOP_RUNTIME_PASS`.
- Release validator PASS for local candidate 1.1.4; launcher syntax, dependency closure smoke, ready-fallback smoke PASS. Evidence: `docs/evidence/release/TVE-REL-009-V114-PACKAGED-RUNTIME.md`.
- Overall TVE-REL-009 remains ACTIVE/NOT DONE. No v1.1.4 tag/release, commit, push, PR, merge, install/updater transition occurred. v1.1.0–v1.1.3 remain immutable. Post-update license/feed revalidation and shared-core defer-without-mutation remain NOT PASS.
- NEXT_EXACT_ACTION: review the scoped REL-009 diff and release gates, verify configured `personal` remote and tag/release absence, run final scoped checks, and commit only REL-009 source, version manifests/lock, focused tests, evidence and state files. Follow PR/CI/review/merge before creating immutable v1.1.4; then verify release provenance/artifacts before running only the remaining updater and shared-core runtime gates.


### REL-009 PR/CI checkpoint — 2026-10-13 16:31 +07
- Scoped production candidate commit: `a3826610e2e165006e73fb13e5ee28fa78096095` (`fix: stabilize packaged core launch and Remotion dependencies`), pushed fast-forward to `personal/chatgpt/phase7-commercial-release`; remote SHA was verified equal to the commit before PR creation.
- PR #13 is open against `main@e40af75653375317b2d154b4190fd3cb2a8c17bd`: https://github.com/nguyenkhactang922-bot/SynthCut/pull/13. GitHub reports mergeable=true and not merged. v1.1.4 local/remote tag absent and release lookup 404; v1.1.0–v1.1.3 unchanged.
- Existing CI run `38376963425` for PR #13 was queued when checked. This run has not been restarted. A state-only checkpoint will advance the PR head and may trigger its own new CI run; monitor returned run evidence rather than retrying manually.
- Overall REL-009 remains ACTIVE/NOT DONE: fresh local v1.1.4 package + packaged desktop health PASS; installed updater transition, post-update same-device license/feed revalidation, and shared-core defer-without-mutation remain NOT PASS.
- NEXT_EXACT_ACTION: commit/push the state-only PR checkpoint, then query GitHub for the exact CI run(s) tied to the new PR head, inspect their jobs/logs and PR diff/reviews, and merge only when required checks/review pass. Verify merged main SHA/tree before any v1.1.4 release action.
