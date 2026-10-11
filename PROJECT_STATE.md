# PROJECT_STATE

Project: Tang AI Video Editor on SynthCut base
Root: `E:\SynthCut`
Branch: `chatgpt/phase7-commercial-release`
HEAD baseline: `af92f20` (`personal/main` MAIN VERIFIED before Phase-7 changes)

## Canonical lifecycle
`docs/process/PROJECT_LIFECYCLE_V1.md`
Global contract: `docs/CHATCODE_GLOBAL_MULTI_PROJECT_EXECUTION_LAW.md` §19 + §20.

## Current lifecycle phase
`RELEASE & OPERATE — ACTIVE; TVE-REL-001..007 PASS retained; TVE-REL-008 FAIL at Assemble and validate release artifact set in run 38133316488 after package PASS; exact post-package tracked-clean defect repaired locally; hotfix PR/merge + guarded tag retry pending`

## Phase gates
- DISCOVER: PASS — retained
- DEFINE: V1 FROZEN + commercial release scope amendment PASS — `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- RESEARCH: V1 PASS + commercial redistribution audit PASS WITH HARD GATES — `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- DESIGN: V1 FROZEN + release ADR ACCEPTED — `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- PLAN IMPLEMENTATION: V1 PASS + Phase-7 release plan FROZEN — `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
- BUILD & VERIFY: PASS — prior product baseline remains MAIN VERIFIED at `personal/main@af92f20`
- RELEASE & OPERATE: ACTIVE — REL-001..007 PASS retained; run `38133316488` PASSed through the intentionally unsigned Windows package stage, then FAILed only post-package assemble clean validation because `packages/skill-installer/bin/synthcut.mjs` was the sole tracked dirty path; narrow fail-closed restore gate repaired locally; publication remains blocked pending reviewed hotfix + guarded tag retry
- LEARN: FUTURE

## Governance normalization
The canonical lifecycle now contains 39 named substages. Post-update runtime verification confirmed all ten contract fields are present 39/39:
- Input
- Entry Gate
- Work
- Output
- Exit Gate
- Artifact
- Evidence
- Owner/Authority
- Risks/Open Questions
- Loopback

No prior valid evidence was rerun merely for this normalization.

## Frozen architecture baseline
Freeze record: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`.

Key frozen decisions:
- SynthCut remains base and `.aive` remains the only authoritative edit/render truth.
- Tang derived metadata uses adjacent `<project>.tang.json`, revision-aware and rebuildable.
- PROJECT→CHAPTER→SCENE/BEAT hierarchy is a derived read/orchestration model only.
- long-form default reads are bounded; ordinary target <=64 KiB.
- coherent AI batches use revision guard + durable pre-batch `.aive` checkpoint + ordered audit + rollback/recovery.
- 300-clip UI uses viewport culling/virtualization rather than core rewrite.
- long-form FFmpeg execution is segment/window bounded by intersecting dependencies; bounded segment audio uses PCM concat with one final AAC encode/mux.
- CapCut is not required at runtime.
- dependency hardening uses the proven non-force remediation path.
- Vietnamese edit-grade default is multilingual `large-v3-turbo`, explicit `language=vi`, under fail-closed >=120 ms per-side cut guard; insufficient gap = NOOP/review-needed.

## Verified DESIGN evidence
- `TVE-SPIKE-DEPSEC-001`: PASS
- `TVE-SPIKE-MCP-CONTEXT`: PASS
- `TVE-SPIKE-UI-300`: PASS
- `TVE-SPIKE-LF-001`: PASS
- `TVE-SPIKE-SAFE-BATCH-001`: PASS
- `TVE-SPIKE-VI-STT`: PASS UNDER REVISED AUTOMATED AC-18

VI-STT automated result:
- speech: 639.96 s
- WER: 0.0941734417 <= 0.20
- deterministic rare/key recall: 0.79 >= 0.75
- timing p95: 1.12 s <= 1.5 s
- timing violations: 0
- 20/20 cut samples safe-resolved: 13 SAFE_CUT + 7 SAFE_NOOP
- model inference rerun for amendment: false
Evidence: `docs/evidence/spikes/TVE-SPIKE-VI-STT.md`, `.spike-temp/vi-stt/automated-validation.json`.

Historical human-review pack remains optional spot-check QA and is not claimed as human-reviewed.

## PLAN IMPLEMENTATION
- TVE-PLAN-001 Dependency Graph: PASS — `docs/plan/DEPENDENCY_GRAPH_V1.md`
- TVE-PLAN-002 Task Decomposition: PASS — `docs/plan/TASK_DECOMPOSITION_V1.md`
- TVE-PLAN-003 Traceability: PASS — `docs/plan/TRACEABILITY_PLAN_V1.md`
- TVE-PLAN-004 Production Task Queue: PASS — `tasks/TASK_QUEUE.md`

## Completed production tasks
- `TVE-IMP-001 — Tang metadata sidecar foundation` — COMMITTED `622769d`
- `TVE-IMP-002 — Bounded project/chapter/range/transcript read model` — COMMITTED `c0e62eb`
- `TVE-IMP-003 — MCP bounded tool exposure and operator contract` — COMMITTED `68adf99`
- `TVE-IMP-004 — EditPlan, revision guard and dry-run` — COMMITTED `3ab9518`
- `TVE-IMP-005 — Checkpoint-backed coherent batch/audit/rollback` — COMMITTED `840bacd`
- `TVE-IMP-006 — Bounded long-form preview/export execution` — COMMITTED `52039c5`
- `TVE-IMP-007 — 300-clip timeline viewport culling/virtualization` — COMMITTED `7741f69`
- `TVE-IMP-008 — Vietnamese STT policy and fail-closed cut resolver` — COMMITTED `dcb3579`
- `TVE-IMP-009 — Dependency hardening promotion` — COMMITTED `f46feda`
- `TVE-IMP-010 — Tang long-form editorial orchestration contract` — COMMITTED `10711c1`
- `TVE-IMP-011 — QA and durable evidence coordinator` — COMMITTED `1cf0b80`

## Active production task
`TVE-REL-008 — FAIL / run 38133316488 failed only post-package assemble clean gate after package PASS; fail-closed known workspace-bin restore repair locally PASS; hotfix PR pending`

Release baseline summary:
- prior product/runtime Build & Verify remains MAIN VERIFIED at `personal/main@af92f20`;
- user authorized Windows GitHub Release on the personal fork plus commercial-distribution hardening (`B+C`);
- REL-001 commercial scope/audit/ADR/plan is PASS;
- REL-002 fork identity/updater ownership is PASS with evidence `docs/evidence/release/TVE-REL-002.md`;
- REL-003 provenance/source compliance is PASS/COMMITTED `e051b8d` with `docs/evidence/release/TVE-REL-003.md`;
- REL-004 packaging/release-tool security hardening is PASS/COMMITTED `20c8ff9` with `docs/evidence/release/TVE-REL-004.md`;
- REL-005 release workflow/version hardening is PASS/COMMITTED `227535b` with `docs/evidence/release/TVE-REL-005.md`;
- REL-006 local packaged acceptance is PASS with `docs/evidence/release/TVE-REL-006.md`; accepted candidate manifest source commit is `225a987`, installer/ZIP integrity PASS, packaged MCP/core/resource resolution PASS, save/open PASS, representative H.264+AAC export PASS, installer exit 0 and installed launch PASS;
- `REMOTION_LICENSE_GATE=PASS`; `SUPABASE_LICENSE_BACKEND=PASS`; owner-approved unsigned distribution amendment PASS; packaged license activation/restart persistence PASS; founder/admin key returned to activeDevices=0 after exact test-device cleanup; full 1.1.0 NSIS/ZIP build PASS with installer/app `NotSigned` and hashes recorded in `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md`. REL-007 is PASS.

## Hard gate
`RELEASE_IMPLEMENTATION_ALLOWED=true` for dependency-ready Phase-7 tasks.

`PUBLIC_COMMERCIAL_RELEASE_ALLOWED=true` for the frozen owner-approved unsigned lane only after REL-008 entry checks confirm reviewed committed source, fork-only target, no tag/release collision, and valid GitHub write authority. This does not authorize publication to upstream or skipping REL-008 side-effect guards.

## Git identity
Repo-local identity is configured and verified: `nguyenkhactang922-bot <nguyenkhactang813@gmail.com>`.

## Latest TVE-IMP-001 verification
- Implementation/Test/Evidence/Verify/Review: PASS.
- Evidence: `docs/evidence/implementation/TVE-IMP-001.md`.
- Final hardened sidecar smoke: PASS / exit 0, including unknown/shadow-key rejection, stale/malformed/missing fail-safe, restart/rebase/repair, and no temp/backup leakage on success path.
- Core build: PASS / exit 0.
- Root typecheck (core + MCP + desktop): PASS / exit 0.
- `git diff --check` on tracked engine diff: PASS / exit 0.
- Commit: PASS — `622769d`.

## Latest TVE-IMP-002 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-002.md`.
- Final core build: PASS / exit 0.
- Dedicated 30m/300-clip bounded-read smoke: PASS / exit 0.
- Root typecheck (core + MCP + desktop): PASS / exit 0.
- `git diff --check`: PASS / exit 0.
- Commit: PASS — `c0e62eb`.

## Latest TVE-IMP-003 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-003.md`.
- Final repaired MCP build: PASS / exit 0.
- Real stdio MCP bounded-tools smoke: PASS / exit 0; 4/4 bounded tools `readOnlyHint=true`; payload parity with core RPC; generic registration intact at 98 tools.
- Root typecheck: PASS / exit 0.
- `git diff --check`: PASS / exit 0.
- Commit: PASS — `68adf99`.

## Latest TVE-IMP-004 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-004.md`.
- Core build: PASS / exit 0.
- Dedicated EditPlan dry-run smoke: PASS / exit 0 with marker `TVE-IMP-004 EDIT PLAN DRY RUN SMOKE PASSED`.
- Root typecheck: PASS / exit 0.
- Diff review/check: PASS; `rpc.ts` logical diff limited to +28 lines after EOL cleanup.
- Commit: PASS — `3ab9518`.

## Latest TVE-IMP-005 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-005.md`.
- Core build: PASS / exit 0.
- Dedicated coherent-batch smoke: PASS / exit 0 with marker `TVE-IMP-005 COHERENT BATCH SMOKE PASSED`.
- Verified stale-plan zero mutation/no batch artifact; forced mid-batch runtime failure rollback; durable checkpoint/audit/result; successful batch; save/restart; explicit recovery after restart; recovered save/reopen.
- Root typecheck: PASS / exit 0.
- EditPlan sync allowlist audit: PASS — 51 allowlisted methods, 0 async, 0 missing handlers.
- Cached diff review/check: PASS; task commit scope 5 files, +951/-1.
- Commit: PASS — `840bacd`.

## Latest TVE-IMP-006 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-006.md`.
- Independent VERIFY found and repaired the continuous-transition command-growth edge case before task closure.
- Repaired-source core build: PASS / exit 0.
- Root typecheck: PASS / exit 0.
- Cache regression smoke: PASS / exit 0.
- Export regression smoke: PASS / exit 0 for H.264/H.265 and WebM/VP9 fallback.
- Dedicated 310-clip/1800s production smoke: PASS with marker `TVE_IMP_006_RESULT`.
- Transition command bound: 2 inputs / 1112 chars; preview max 3 / 1601; final max 3 / 1615.
- Cache reuse: 299/300 = 99.6667%; remote frame 0 renders + 1 hit.
- 20-cycle RSS ratio: 1.04818x; cancel clean; final exact 1800s 1920x1080 30fps H.264+AAC.
- `git diff --check`: PASS.
- Commit: PASS — `52039c5`.

## Latest TVE-IMP-007 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-007.md`.
- Desktop typecheck: PASS / exit 0 after final production repair.
- Renderer production build: PASS / exit 0 after final production repair.
- Final clean 300-clip Electron acceptance: PASS / exit 0.
- First paint 185 ms; authoritative clips 300; rendered clip/element DOM 6 initial / 10 max.
- Interaction p95 6.2 ms; drag reflection 6.2 ms; 0 long tasks; visible/offscreen selection 1/1; renderer crash=false.
- Focused diff/check/review: PASS.
- Commit: PASS — `7741f69`.

## Latest TVE-IMP-008 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-008.md`.
- Core build: PASS / exit 0.
- Dedicated VI-policy + frozen 20-sample resolver smoke: PASS / exit 0; 13 SAFE_CUT + 7 SAFE_NOOP.
- Unsafe Vietnamese delete: zero mutation + reviewNeeded; safe delete: real ripple cut.
- Production preview/audio QA: PASS; 8.900 s pre-cut H.264+AAC → 8.700 s post-cut H.264+AAC.
- Root typecheck: PASS / exit 0.
- Focused diff/check/review: PASS.
- Commit: PASS — `dcb3579`.

## Latest TVE-IMP-009 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-009.md`.
- Materialized production dependency tree verification: PASS / `npm ls --omit=dev --json` exit 0.
- Production audit: PASS / 0 findings.
- Full audit remaining risk: 12 findings = 11 high + 1 critical, isolated to the tracked electron-builder dev/packaging chain; semver-major remediation deferred by frozen scope.
- Root build: PASS / exit 0.
- Root typecheck: PASS / exit 0.
- Composite smoke: PASS / exit 0.
- CLIP tokenizer smoke: PASS / exit 0.
- Core security smoke: PASS / exit 0 using project-local FFmpeg/FFprobe.
- Commit: PASS — `f46feda`.

## Latest TVE-IMP-010 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-010.md`.
- Repaired MCP build: PASS / exit 0.
- Real stdio 30-minute / 300-clip orchestration smoke: PASS / exit 0 with marker `TVE-IMP-010 LONG-FORM ORCHESTRATION SMOKE PASSED`.
- Six chapter packets; overview 1,711 bytes; chapter read 23,634 bytes; real revision 12; real clip `clip-001`; non-mutating dry-run 1 operation.
- Root typecheck: PASS / exit 0.
- Focused staged diff/check/review: PASS; task scope 5 files / +464.
- Commit: PASS — `10711c1`.

## Latest TVE-IMP-011 verification
- Evidence: `docs/evidence/implementation/TVE-IMP-011.md`.
- Core build: PASS / exit 0.
- MCP build: PASS / exit 0.
- Dedicated QA coordinator smoke: PASS / exit 0 with marker `TVE-IMP-011 QA COORDINATOR SMOKE PASSED`.
- STALE and failed-delivery records are durable but rejected from accepted evidenceRefs; matching delivery PASS records structural + exact frame + preview/audio + ffprobe delivery facts.
- Save/restart preserves only accepted evidenceRefs while `.aive` remains authoritative edit truth.
- Root typecheck: PASS / exit 0.
- Focused cached diff/check/review: PASS; task scope 7 files / +710/-5.
- Commit: PASS — `1cf0b80`.

## Latest TVE-E2E-001 verification
- Evidence: `docs/evidence/e2e/TVE-E2E-001.md`.
- Integrated runtime: PASS / exit 0 with marker `TVE-E2E-001 INTEGRATED PROOF PASSED`.
- Same authoritative project: `proj_jnjvadlpe3`, 310 clips, 1800 s.
- MCP bounded reads: overview 1708 B; chapter 24383 B; six packets.
- UI/MCP/core convergence: same initial revision; coherent rollback observed as exactly one restored-state UI broadcast.
- Stale plan: rejected with zero mutation/no UI state advance.
- Coherent batch: forced runtime failure rolled back and restored 310 clips; durable audit/checkpoint refs survive save/restart.
- Vietnamese policy: `vi` + `large-v3-turbo`; unsafe cut produced zero cuts + reviewNeeded.
- Same-project durable IMP-006 evidence supplies final exact 1800 s 1080p H.264+AAC and clean cancel; IMP-007/011 evidence reused without blind rerun.
- CapCut process count: 0; no required package dependency.
- Root typecheck: PASS / exit 0.
- Commit: `c921f9e`.

## Latest MAIN verification
- Evidence: `docs/evidence/e2e/TVE-MAIN-VERIFICATION.md`.
- PR #1: MERGED to personal fork `main` at `af92f2018d287a14e4f3af03f6d00879d12a6ab1`.
- Owner review: Final review PASS before merge; fork has no configured GitHub CI checks.
- Merge tree parity: PASS — `git diff --exit-code HEAD^2 HEAD` = 0.
- Merged-main root typecheck: PASS / exit 0.
- Merged-main integrated E2E: PASS / exit 0 with marker `TVE-E2E-001 INTEGRATED PROOF PASSED`.
- Ref verification: `HEAD == personal/main == af92f20`; upstream `origin/main` remains `96b1ca0` and was not modified.

## Latest TVE-REL-002 verification
- Evidence: `docs/evidence/release/TVE-REL-002.md`.
- Fork identity/updater ownership: PASS.
- Forbidden upstream identity scan in distributed desktop scope: PASS / no matches.
- Root typecheck: PASS / exit 0 before final renderer brand repair; desktop typecheck after final repair: PASS / exit 0.
- Root build: PASS; final renderer build: PASS and no `relo-logo` asset.
- Packaged-renderer identity scan: PASS.
- `git diff --check` focused desktop diff: PASS.

## Latest TVE-REL-003 verification
- Evidence: `docs/evidence/release/TVE-REL-003.md`.
- Exact Gyan FFmpeg/ffprobe 6.1.1 version/hash pin: PASS.
- Positive staged-resource proof: PASS / exit 0; final staged bundle ~313.0 MB.
- Wrong FFmpeg (`n7.1`) negative path: PASS by expected fail-closed rejection.
- Independent manifest verification: PASS / exit 0; marker `REL003_MANIFEST_VERIFY_PASS files=36 bytes=328141128 ... trackedDirty=True`.
- `package-lock.json` + `LICENSE` + `THIRD_PARTY_LICENSES.md` + `SOURCE_OFFER.md` source hashes are recorded; package resources include all three distribution documents.
- Root typecheck: PASS / exit 0.
- Focused `git diff --check`: PASS / exit 0.
- No package or GitHub Release was published.

## Latest TVE-REL-004 verification
- Evidence: `docs/evidence/release/TVE-REL-004.md`.
- electron-builder: `25.1.8` → `26.15.3`, explicit non-force release-tool upgrade.
- Baseline full audit: 12 = 11 high + 1 critical.
- Final full audit: 8 moderate, 0 high, 0 critical; residual chain is build-only and absent from unpacked runtime.
- Production audit: 0 findings.
- Root build: PASS / exit 0.
- Root typecheck: PASS / exit 0.
- Unpacked Windows package smoke: PASS / exit 0; marker `REL004_PACK_SMOKE_EXIT=0`.
- Compliance resources present; executable is intentionally `NotSigned`, carried to REL-007.
- Commit: `20c8ff9`.
- No package was published.

## Latest TVE-REL-005 verification
- Evidence: `docs/evidence/release/TVE-REL-005.md`.
- Version alignment: all five package manifests + package-lock workspaces = `1.0.6`; no tag created.
- Personal remote `v1.0.6`: absent; personal GitHub Releases: none.
- `npm ci --dry-run --ignore-scripts`: PASS / exit 0.
- Release validator: PASS; authorized tag simulation PASS; wrong repository and wrong tag rejected.
- Artifact validator fixture: full set PASS; missing `latest.yml` rejected.
- Workflow YAML parse + semantic permission/fork/gate verification: PASS.
- Legacy `@relo-video/synthcut` npm publication disabled (`private:true`, no `publishConfig`).
- Commit: `227535b`.
- No push/tag/release/npm publication occurred.

## Latest TVE-REL-006 verification
- Status: PASS.
- Evidence: `docs/evidence/release/TVE-REL-006.md`.
- Accepted package manifest source: `225a987dfb5490949ba107eac4c9e0dd0c74499b`, `sourceTrackedDirty=false`.
- NSIS: `397,648,957` B; SHA-256 `754138d0e683cb10828f1b7fcc125ea71e1443c9a03b63e54a8e63f0c4442ab0`.
- ZIP: `505,855,006` B; SHA-256 `59aa55f8aff9395f45408b93565385d8262e6610bb48da0848597b68231c7478`.
- Blockmap/latest.yml/SHA256SUMS present; artifact validator and package provenance inspection PASS.
- Packaged MCP/core/bundled-resource acceptance PASS after bundled AIVE env repair; `import_video` succeeded offline with restricted PATH.
- Packaged project save/open PASS; representative export PASS: 4.000 s H.264 320x180@25fps + AAC, 250,897 B.
- Installer acceptance PASS with durable marker `.tmp/rel006-install4-exit.json`: exit code 0 to project-local target `.tmp/rel006-installed4`.
- Installed desktop launch PASS: main window + renderer + bundled core observed; test process tree closed cleanly.
- `latest.yml` version/path/size metadata PASS; fork ownership retained from REL-002/005.
- Installer Authenticode remains `NotSigned`; this is a hard REL-007 gate, not a REL-006 failure.
- `asar=false` was explicitly assessed. An ASAR smoke candidate packaged PASS, but current external MCP launch via a script path inside `app.asar` needs additional launcher/unpack work. Experimental ASAR source change was reverted and is deferred hardening, not part of the accepted candidate.
- No tag/push/GitHub Release/npm publish/deploy occurred.

## Latest TVE-REL-007 unsigned-commercial verification
- Status: `PASS` — owner-approved unsigned commercial lane, Supabase entitlement integration, packaged runtime persistence, and full 1.1.0 unsigned artifact proof all verified.
- Evidence: `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md` + `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md` + retained signing/remotion evidence.
- Supabase project `ljygpbxkxmsuhdfpfgml` contains isolated `tve_license_keys`, `tve_license_devices`, `tve_license_events` tables with RLS enabled and no direct `anon`/`authenticated` grants.
- Transactional RPC `public.tve_activate_license(...)` uses `SECURITY INVOKER`, row-locks the license and enforces max-device count atomically; execute is restricted to `service_role`.
- Edge Function `tve-license-authority` version 1 deployed with custom license-key authentication and pinned `@supabase/supabase-js@2.117.3`.
- Founder/admin commercial key prefix `TAIVE-F3E3Y`: active, maxDevices=3, no expiry, activeDevices=0 after test cleanup. Full plaintext key is not stored in Git.
- Verification PASS: devices 1/2/3 VALID; device 4 DEVICE_LIMIT; real HTTPS Edge Function validation VALID; test device/event data removed afterward.
- Packaged desktop activation via the real renderer/preload/main bridge returned VALID/commercial/stored=true; restart on the same device remained activeDevices=1; persisted license file contained encrypted key bytes and no plaintext key.
- Full 1.1.0 dist PASS / exit 0. Installer SHA-256 `867fb75aceecab263ad0a5b3914f55ce71772dfa6aa923749b689dc1ecad6451`; ZIP SHA-256 `2ff621e45d4c7d78211282beec983fecc66ea6f2f635f074aa8ece53d2d004f2`; installer and packaged app both `NotSigned` as required by the current lane.
- Supabase security advisor reports `RLS Enabled No Policy` at INFO for the new service-only tables; this is intentional because direct public/authenticated access is revoked.
- SSL.com/eSigner repository integration remains available as an optional future trusted-signing path, but purchase/issuance is no longer the active next action.
- Supabase licensing does not satisfy Authenticode; the release remains intentionally unsigned and carries explicit Unknown-publisher/SmartScreen risk acceptance.
- No tag, push, PR, merge, GitHub Release, or updater side effect was performed by REL-007.

## Latest TVE-REL-008 PR CI repair
- PR #2 exists on `nguyenkhactang922-bot/SynthCut`, base `main`, head `chatgpt/phase7-commercial-release`.
- Initial CI run `38125686293` on head `db00c89` FAILed only `Smoke — jobs (background export, progress, cancel)`; setup/install/typecheck/build/compositor/CLIP/security stages PASS and are retained.
- Failure evidence: running background export remained `fraction=0.000` during the observation window; cancel/cleanup/blocking export/recovery all PASS.
- Root cause: bounded export did not forward first video-segment FFmpeg progress to JobManager until that segment completed.
- Repair: `ensureExportVideoSegmentRendered` now forwards segment FFmpeg progress to bounded aggregate progress; aggregate fraction is monotonic across retry/fallback.
- Exact failed smoke rerun with already-bundled candidate FFmpeg/ffprobe: PASS / exit 0; observed running fraction `0.005`; marker `JOBS SMOKE TEST PASSED`.
- Narrow compile after repair: `tsc -b packages/core` PASS / exit 0.
- Evidence: `docs/evidence/release/TVE-REL-008-PR-CI-REPAIR.md`.
- Repair commit `a27c78f9404024eb45638512c2e513a82d188f5b` is present on the personal feature branch.
- PR #2 CI rerun `38126601288` on exact repaired head: `build-and-smoke` SUCCESS / 2m42s.
- PR #2 MERGED to personal `main` at `622af29029d53c2724af6f5789c54b43688d25da` on 2026-10-11T09:04:04Z.
- Merged-main tree equals repaired-head tree `5afbdddc0741db5daff64f9d743b0d5feecacd32`; tree parity PASS.
- Upstream `origin/main` remains `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`; no upstream mutation occurred.
- Post-merge guard: personal `v1.1.0` tag ABSENT; GitHub Release `v1.1.0` ABSENT; no active SynthCut process.

## Latest TVE-REL-008 Release workflow failure / launcher repair
- Release tag `v1.1.0` was pushed to personal fork and pointed to `beeb8152331c172b728b96c34f3b4df22b472351`.
- Tag-triggered Release run `38127692348` completed `FAILURE`.
- PASS retained before failure: checkout, Node 22.12 setup, release identity/version/source validation, lockfile install, core+MCP+renderer build, pinned FFmpeg 6.1.1 install.
- FAIL stage only: `Stage verified FFmpeg, Whisper, YuNet, font and provenance`.
- Exact failure: `ERR_UNKNOWN_FILE_EXTENSION` for `apps/desktop/scripts/prepare-bundle.ts` because package script used plain `node scripts/prepare-bundle.ts` under Node 22.12.
- Later commercial/package/artifact/upload/publish stages were skipped; GitHub Release `v1.1.0` is absent.
- Narrow repair: `prepare:bundle` now uses `node --experimental-strip-types scripts/prepare-bundle.ts`; no provenance logic or release policy changed.
- Targeted failed-stage verification PASS / exit 0 using project-local verified FFmpeg/ffprobe: FFmpeg 6.1.1, Whisper, YuNet, Noto Sans and `bundle-manifest.json` staged; bundle size 313.0 MB.
- A temporary `tsx` experiment was fully reverted; `package-lock.json` returned to original bytes and no new dependency remains.
- Evidence: `docs/evidence/release/TVE-REL-008-RELEASE-WORKFLOW-REPAIR.md`.
- Side-effect guard: remote `v1.1.0` tag exists; Release absent. Do not blindly recreate/re-push tag. Move it only after hotfix merge and a fresh no-Release guard.

## Latest TVE-REL-008 package argument failure / repair
- PR #4 MERGED to personal `main` at `14912c71d3ff2f43a036de1a31909e3c2882f21c`; repaired provenance-launcher head `75f08e6` had CI PASS before merge.
- Guarded remote tag `v1.1.0` currently peels to `14912c71`; GitHub Release `v1.1.0` remains ABSENT.
- Corrected Release run `38128610356` on exact SHA `14912c71` retained PASS for checkout, Node setup, release validation, lockfile install, core+MCP+renderer build, pinned FFmpeg, provenance staging, and commercial gates.
- FAIL only at `Package intentionally unsigned Windows NSIS + ZIP for current commercial lane`.
- GitHub log proves `npm run dist --workspace synthcut-by-relo -- --publish never` resolved to `electron-builder --win never`, causing `Unknown target: never`.
- Repair: package scripts now embed `--publish never`; workflow package steps no longer forward `--publish` through npm. Separate `publish-release` remains the only GitHub Release publication path.
- Verification: `git diff --check` PASS; static package/workflow semantic check `REL008_PACKAGE_COMMAND_STATIC=PASS`; installed electron-builder 26.15.3 source declares `publish` and allowed choice `never`. Two optional local parser/help probes timed out with no output, left no process, were not retried, and are not counted as PASS evidence.
- Evidence: `docs/evidence/release/TVE-REL-008-PACKAGE-ARG-REPAIR.md`.
- No full package/release rerun was performed locally; prior REL-001..007 and run-38128610356 PASS stages remain retained.

## Latest TVE-REL-008 validator contract failure / repair
- PR #5 MERGED to personal `main` at `f79ef1096ea0282f3dfe6617825ca147136b4dbc`; merge-tree parity PASS against CI-PASS head `bc45331a76f6a43f02fe05901fc5d127b40e1a94`.
- Remote annotated tag `v1.1.0` was guarded-moved to peel to `f79ef109` only after GitHub auth PASS, Release absence, and no active Release run were verified.
- Release run `38131284821` on exact SHA `f79ef109` completed FAILURE at `Validate release identity, versions and source state`; checkout/setup PASS and all later stages were skipped.
- Exact failure: validator required removed token `npm run dist --workspace synthcut-by-relo -- --publish never`.
- Root cause: stale validator contract after the package-argument hotfix, not a packaging regression.
- Repair: validator now requires non-forwarding workflow calls, rejects any `-- --publish never`, and requires `dist`/`dist:commercial` scripts to embed `--publish never`.
- Tag-mode local validator simulation PASS / exit 0 with marker `REL005_RELEASE_VALIDATION_PASS version=1.1.0 tag=v1.1.0 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`.
- Evidence: `docs/evidence/release/TVE-REL-008-VALIDATOR-CONTRACT-REPAIR.md`.
- No package/release pipeline was rerun locally; REL-001..007 remain PASS.

## Latest TVE-REL-008 post-package clean-gate failure / repair
- PR #6 CI run `38133008905` SUCCESS on exact validator-repair head `868cde9`; PR #6 MERGED to personal `main@bbab9a06` with merge-tree parity PASS.
- After auth + Release absence + no-active-Release-run guard PASS, `v1.1.0` was guarded-moved to peel to `bbab9a06`.
- Release run `38133316488` retained PASS through release validation, dependencies, build, pinned FFmpeg, provenance staging, commercial gates, and `Package intentionally unsigned Windows NSIS + ZIP for current commercial lane`.
- FAIL only at `Assemble and validate release artifact set`.
- Exact root failure: post-package `validate-release --require-clean` observed only tracked path `packages/skill-installer/bin/synthcut.mjs` dirty, so `RELEASE_METADATA.json` was not written. The following artifact-validator missing-metadata error is downstream fallout.
- `publish-release` was skipped; no GitHub Release was created by the failed run.
- Narrow repair: a post-package fail-closed gate allows at most the exact known workspace-bin path, restores only that path from `HEAD`, verifies zero remaining tracked dirt, then leaves the existing `--require-clean` validator in force. Any other tracked mutation still fails.
- Release validator now requires the restore-step name, exact allowed path and `POST_PACKAGE_TRACKED_CLEAN_GATE=PASS` marker.
- Targeted disposable-repo smokes: `REL008_ALLOWED_DIRTY_RESTORE=PASS`; `REL008_UNEXPECTED_DIRTY_REJECT=PASS`.
- Tag-mode static validator: PASS / `REL005_RELEASE_VALIDATION_PASS ... cleanRequired=false`.
- Evidence: `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`.
- No local package/build rerun was performed for this repair.

## NEXT_EXACT_ACTION
Review/commit only the post-package clean-gate repair + evidence/state, push only to personal, open one hotfix PR and monitor its automatic CI. If CI PASSes, merge to personal main and verify merge-tree parity. Then re-check GitHub Release `v1.1.0` absence, exact current tag target, GitHub auth and absence of active Release runs before any guarded tag move. Never manually create a duplicate Release, never publish upstream, and do not manually rerun REL-001..007 or retained PASS stages from run `38133316488`.