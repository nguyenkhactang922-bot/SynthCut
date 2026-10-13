# PROJECT_STATE

Project: Tang AI Video Editor on SynthCut base
Root: `E:\SynthCut`
Branch: `chatgpt/phase7-commercial-release`
HEAD baseline: `af92f20` (`personal/main` MAIN VERIFIED before Phase-7 changes)

## Canonical lifecycle
`docs/process/PROJECT_LIFECYCLE_V1.md`
Global contract: `docs/CHATCODE_GLOBAL_MULTI_PROJECT_EXECUTION_LAW.md` §19 + §20.

## Current lifecycle phase
`RELEASE & OPERATE - ACTIVE; TVE-REL-001..008 PASS retained; v1.1.3 release-forward PASS/PUBLISHED/VERIFIED; TVE-REL-009 final owned-core updater E2E + shared-core defer runtime proof ACTIVE`

## Phase gates
- DISCOVER: PASS — retained
- DEFINE: V1 FROZEN + commercial release scope amendment PASS — `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- RESEARCH: V1 PASS + commercial redistribution audit PASS WITH HARD GATES — `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- DESIGN: V1 FROZEN + release ADR ACCEPTED — `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- PLAN IMPLEMENTATION: V1 PASS + Phase-7 release plan FROZEN — `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
- BUILD & VERIFY: PASS — prior product baseline remains MAIN VERIFIED at `personal/main@af92f20`
- RELEASE & OPERATE: ACTIVE - REL-001..008 PASS retained; `v1.1.0` remains immutable published evidence; REL-009 source PR #9 + state PR #10 are CI/merge PASS; `v1.1.1` release-forward is published/verified from personal `main@452dd263`; installed updater E2E is ACTIVE
- RELEASE & OPERATE: ACTIVE - REL-001..008 PASS retained; `v1.1.0` and `v1.1.1` remain immutable published evidence; REL-009 source/state review + release-forward PASS; first updater transition produced an incomplete install tree because the old app attached to a pre-existing shared core; rerun only the updater-transition stage in an isolated owned-core environment

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
`TVE-REL-009 - RUNNING / controlled owned-core updater E2E retry active on dedicated port 48721; v1.1.3 release-forward PASS retained`

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

## Latest TVE-REL-008 provenance clean-gate timing failure / repair
- Post-package clean hotfix commit `ee10c86` was pushed; PR #7 automatic CI `build-and-smoke` PASSed and PR #7 MERGED to personal `main@f9ea9ab3278c2158593508feec21fbf92f7e1ce7`.
- Remote annotated tag `v1.1.0` currently peels to `f9ea9ab`; GitHub Release `v1.1.0` remains ABSENT (release-by-tag API returned 404).
- Release run `38134667267` PASSed initial clean validation, dependency install, build, pinned FFmpeg, provenance staging command, commercial gates, intentionally unsigned Windows packaging, and the post-package tracked-clean restore gate.
- The assemble stage's own `validate-release --require-clean` also PASSed, proving the previous post-package repair worked.
- FAIL only at artifact provenance validation: `RELEASE_ARTIFACT_VALIDATION_FAIL: release bundle manifest must come from a clean tracked source state`.
- Root cause: `prepare-bundle.ts` sampled `sourceTrackedDirty` before the post-package restore. The known workspace-bin mutation therefore entered `BUNDLE_MANIFEST.json` as `true` even though the worktree was later cleaned.
- Narrow repair: add the same fail-closed exact-path restore gate immediately before provenance manifest generation, retain the post-package gate, and require validator ordering `pre-provenance clean < provenance staging < post-package clean < assemble`.
- Targeted smoke PASS: `REL008_PRE_PROVENANCE_CLEAN=PASS`; `REL008_MANIFEST_DIRTY_FLAG_FALSE=PASS`; `REL008_POST_PACKAGE_CLEAN=PASS`; `REL008_UNEXPECTED_MUTATION_REJECT=PASS`.
- Tag-mode static validator PASS; `git diff --check` PASS.
- Evidence: `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`.
- No full build/package/release rerun was performed locally; retained PASS stages remain retained.
- Repair implementation/evidence/state commit: `9ec5ccd4065ec9949152f513d6ac6bc747bafeec`; push to `personal/chatgpt/phase7-commercial-release` PASS. No open hotfix PR existed at the push checkpoint.
- PR #8 automatic CI run `38136588599`: SUCCESS on exact reviewed head `5a543150172aa5c7ddd7f7b1c2ffcf857c80f968`; PR #8 MERGED at `ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`; merge-tree parity PASS (`ce31bfdd^{tree} == 5a54315^{tree}`).
- Tag retry side-effect guard PASS: GitHub auth valid; GitHub Release `v1.1.0` absent/404; personal `main=ce31bfdd`; prior tag peel `f9ea9ab`; no active Release run. Existing `v1.1.0` was guarded-moved once to `ce31bfdd`.
- Release run `38137052906` completed SUCCESS on exact `headSha=ce31bfdd024331fbdb05d0b78e21df0e8b8e13fb`; both `windows` and `publish-release` jobs PASSed.
- GitHub Release `v1.1.0` is published on `nguyenkhactang922-bot/SynthCut`; release id `409639821`; published at `2026-10-11T11:59:06Z`.
- `BUNDLE_MANIFEST.json`: `sourceCommit=ce31bfdd...`, `sourceTrackedDirty=false`; `RELEASE_METADATA.json.status=PASS`; `latest.yml` points to version `1.1.0` / EXE size `397652429`.
- Public-download verification under `.tmp/rel008-public-download`: EXE SHA-256 `6c7c0691505413c3c793d231e570f3ab8cd96a2691eeadcf2ae25b4088c04da5`; ZIP SHA-256 `ace00154ce63479a93d3838c382e57ad449373888afdaf0d0e9200a5d25891fa`; both exactly match `SHA256SUMS.txt` and GitHub asset digests. REL-008=PASS. Evidence: `docs/evidence/release/TVE-REL-008.md`.

## Latest TVE-REL-009 updater identity preflight
- Retained installed old fork build `.tmp/rel006-installed4` is version `1.0.6` and its `app-update.yml` correctly targets `nguyenkhactang922-bot/SynthCut` but uses `updaterCacheDirName: synthcut-by-relo-updater`.
- Current desktop package name remains `synthcut-by-relo`; current generated app-update.yml therefore uses the same cache namespace.
- Upstream `origin/main:apps/desktop/package.json` also uses package name `synthcut-by-relo`.
- Installed electron-builder code derives updater cache identity as `sanitizedName.toLowerCase() + "-updater"` and NSIS uses it for update installer/package storage.
- Bounded updater-identity repair completed locally: desktop private package `tang-ai-video-editor`, release-forward version `1.1.1`, live workspace selectors switched to `--workspace apps/desktop`, lockfile identity/version synchronized, validator hardened against stale upstream desktop identity.
- Recovered existing full package evidence instead of rebuilding: `rel009-identity-dist` contains 1.1.1 EXE/ZIP/blockmap/latest.yml/SHA256SUMS; generated `app-update.yml` targets `nguyenkhactang922-bot/SynthCut` with `updaterCacheDirName: tang-ai-video-editor-updater`.
- Verification PASS: EXE SHA-256 `bf9e9b03ac8d2745e7b3d7a5c58c8ad24c70af50e7f53434c8f52650c74ac218`; ZIP SHA-256 `dd5081f1ec4c0e415d99b464e0990136f93f36c90c1e76bff75e6f445b06d3e0`; both match SHA256SUMS; installer/app `NotSigned`; tag-mode validator v1.1.1 PASS; root typecheck PASS; root build PASS; `git diff --check` PASS. Evidence: `docs/evidence/release/TVE-REL-009-UPDATER-IDENTITY-REPAIR.md`.

## Latest TVE-REL-009 updater install-integrity failure
- `v1.1.1` release-forward is PASS on `personal/main@452dd263`; Release workflow `38161855081` SUCCESS.
- First updater attempt downloaded the correct public v1.1.1 installer and changed the controlled install executable to `1.1.1.0`.
- Post-update install tree is incomplete: `resources/app/node_modules` retains only `@aive`; `electron-updater` is absent; relaunch log reports `electron-updater unavailable`.
- Existing fresh v1.1.1 install is healthy: `1.1.1.0`, `NotSigned`, 224 top-level production module directories, `electron-updater` present, personal-fork feed + `tang-ai-video-editor-updater`.
- Old 1.0.6 updater log proves the app attached to an already-running core on port 4789 before update. By contract an attached/shared core is left alive on app quit, so the first E2E did not satisfy isolated updater-install preconditions.
- REL-009 is FAIL at update-install integrity. Only the updater-transition stage may be rerun using the accepted existing 1.0.6 installer and an isolated owned core.
- Evidence: `docs/evidence/release/TVE-REL-009-UPDATER-INSTALL-INTEGRITY-FAIL.md`.

## Latest TVE-REL-009 updater coordination repair
- Existing owned-core `probe2` evidence disproves the shared-core-only hypothesis: old 1.0.6 started its own core on dedicated port 48643, downloaded v1.1.1, and still produced an incomplete install tree.
- Installed `electron-updater` source confirms `quitAndInstall()` starts `install()`/NSIS before `app.quit()`, while the desktop previously killed its owned core only during app quit. This creates a real asar=false file-lock race.
- v1.1.2 repair disables `autoInstallOnAppQuit`, defers install when attached to a shared core, and for an owned core waits for child exit before invoking `quitAndInstall(false, true)`.
- Coordination is isolated in `apps/desktop/electron/update-coordinator.cjs`; deterministic smoke covers shared defer, owned-core ordering, already-stopped core, and timeout fail-closed. CI now includes this smoke.
- LOCAL VERIFY PASS: node checks, `REL009_UPDATER_COORDINATION_SMOKE=PASS`, root typecheck, root build, release validator `version=1.1.2 tag=v1.1.2`, CI YAML parse, and `git diff --check`.
- Evidence: `docs/evidence/release/TVE-REL-009-UPDATER-COORDINATION-REPAIR.md`.
- Repair commit `2c19c93b386436cf941c46d4373034025957be88` was pushed and reviewed through PR #11; CI run `38232873973` SUCCESS; PR #11 MERGED to personal `main@196dccb6affae074d66c9233d97086b384e40609`; merge-tree parity PASS.
- Guarded `v1.1.2` publication succeeded through Release run `38237764462`; both `windows` and `publish-release` jobs PASSed.
- `v1.1.2^{}` peel, personal main, bundle source and release metadata source all equal `196dccb6affae074d66c9233d97086b384e40609`; `sourceTrackedDirty=false`.
- `latest.yml` version `1.1.2`; EXE SHA-256 `19e99f06f3c09200045b924d2361e853bab500eb21c836653dde30d4ae8ff046`; ZIP SHA-256 `0c59b5bbbd83f12c4fe99ad5455dd15345a5eb8cb7b261136cd5c409970fb14b`; GitHub asset digests match.
- Existing controlled fixed lower-version fixture `.tmp/rel009-fixed-lower-dist` is version `1.1.1`, package/cache identity `tang-ai-video-editor` / `tang-ai-video-editor-updater`, coordinator present, 224 production module directories, `electron-updater` present, installer SHA-256 `0474e36d6a3d563b151e7015d7b1ebaf881c6cf8767e3b929306d9fe7721315e`, intentionally NotSigned.
- Evidence: `docs/evidence/release/TVE-REL-009-V112-RELEASE-FORWARD.md`.
- REL-009 remains RUNNING only for the fixed-code runtime updater E2E plus shared-core defer proof.

## Latest TVE-REL-009 packaged core-readiness failure / repair
- Fixed-code owned-core E2E against the retained lower fixture failed before updater install: lower app PID `128244` spawned core PID `136700` on dedicated port `48712`; core was healthy and wrote authoritative `server.json`, but desktop never reached `[aive] started core` and later quit. No updater install side effect occurred. Evidence: `docs/evidence/release/TVE-REL-009-PACKAGED-CORE-READY-FAIL.md`.
- Root cause: launcher previously depended exclusively on child stdout JSON ready. Packaged runtime can publish matching `server.json` + healthy `/health` while stdout ready is not delivered to the Electron parent.
- Narrow repair keeps stdout ready as fast path and adds fail-closed fallback requiring `server.json.pid === child.pid`, valid port and `/health` PASS; mismatched PID is rejected; failed startup cleans its spawned child.
- New deterministic smoke `scripts/release/smoke-core-launcher-ready-fallback.cjs` PASSes positive no-stdout-ready and negative PID-mismatch/cleanup paths; CI includes the smoke.
- Test-only packaged runtime proof under `.tmp/rel009-ready-runtime-smoke` PASSed: desktop logged `[aive] started core on port 48713`; core PID `98564`; `/health=200`; cleanup PASS.
- Release-forward version bumped consistently to `1.1.3` in the five canonical manifests and only corresponding workspace-version fields in `package-lock.json`.
- Local verification PASS: launcher/smoke node checks, `REL009_CORE_READY_FALLBACK_SMOKE=PASS`, CI YAML parse, tag-mode release validator `version=1.1.3`, root typecheck exit 0, root build exit 0, `git diff --check` PASS.
- Evidence: `docs/evidence/release/TVE-REL-009-PACKAGED-CORE-READY-REPAIR.md`.
- REL-009 remains FAIL/REPAIR until reviewed v1.1.3 publication and owned-core + shared-core runtime updater E2E PASS.

## Latest TVE-REL-009 v1.1.3 release-forward verification
- Existing Release run `38275741580` completed SUCCESS on exact `headSha=e40af75653375317b2d154b4190fd3cb2a8c17bd`; both `windows` and `publish-release` jobs PASSed.
- GitHub Release `v1.1.3` is published, non-draft/non-prerelease; `v1.1.3^{}` and `personal/main` both equal `e40af756...`.
- `BUNDLE_MANIFEST.json`: `sourceCommit=e40af756...`, `sourceTrackedDirty=false`.
- `RELEASE_METADATA.json`: `status=PASS`, `desktopPackageName=tang-ai-video-editor`, `updaterCacheDirName=tang-ai-video-editor-updater`.
- Public EXE independently downloaded under `.tmp/rel009-v113-public`: 397654405 bytes; SHA-256 `82e603edb796d1251d99c6f537110ff2a19fb2b3c34a130dbe0438d3cb3d26f4`; Authenticode `NotSigned` as required by the current lane.
- Public ZIP SHA-256 from release metadata/SHA256SUMS: `33879805fd0a4565a3d20681728c790639a893934b120cb0382fb7a08382ef87`.
- Evidence: `docs/evidence/release/TVE-REL-009-V113-RELEASE-FORWARD.md`.
- Release-forward substage PASS; REL-009 remains incomplete only for owned-core updater runtime E2E + shared-core defer proof.

## NEXT_EXACT_ACTION
Diagnose the packaged Electron child-launch discrepancy before rerunning updater E2E. Compare the lower EXE/build identity and effective ELECTRON_RUN_AS_NODE/RunAsNode behavior against the accepted .tmp/rel009-ready-runtime-smoke invocation. Prove the actual child command can run @aive/core/dist/cli.js and create matching server.json plus /health on a fresh project-local diagnostic port. Repair only the demonstrated cause and add focused packaged-launch evidence. Then retry only the owned-core updater transition in a fresh run root; after it PASSes, run the separate shared-core defer-without-mutation proof. Do not rerun or republish v1.1.0–v1.1.3.


## Latest TVE-REL-009 v1.1.3 owned-core runtime attempt — 2026-10-13

Classification: **FAIL** for the owned-core startup prerequisite; REL-009 overall remains incomplete. No earlier PASS checkpoint is invalidated.

- Git root: E:/SynthCut; branch: chatgpt/phase7-commercial-release; pre-sync HEAD: ae938c3.
- v1.1.3 release-forward remains PASS and immutable; no release/tag/push/publish operation was repeated.
- Controlled lower install PASS: .tmp/rel009-v113-lower-install-result.json; installer exit 0; lower version 1.1.1.0; 224 top-level production modules; electron-updater present; personal-fork feed/cache identity verified.
- Patched test-install core-launcher.cjs matches current source SHA-256 c04888b151a34e2659a422b2874c919d66835802dffa06373c2757379720c94d.
- Owned-core attempt failed before updater activity: error window said “Could not start the editor core” / “Timed out waiting for editor core to start”; dedicated port 48712 had no listener; core-data server.json absent; no update/download/installer/version-change evidence.
- Failure evidence: docs/evidence/release/TVE-REL-009-V113-OWNED-E2E-FAIL.md; raw logs under .tmp/rel009-v113-owned-e2e/logs/.
- Control diagnostic: packaged @aive/core/dist/cli.js starts under system Node and publishes ready on diagnostic port 48715. Direct invocation of the packaged Electron executable with the CLI did not produce Node-mode readiness. Treat RunAsNode/fuse/launch-mode as a hypothesis, not a confirmed root cause.
- All test-owned app processes and diagnostic processes were stopped; no active SynthCut updater process remains. Unrelated project PTYs were not touched.

### NEXT_EXACT_ACTION

Diagnose the packaged Electron child-launch discrepancy before rerunning updater E2E. Compare the lower EXE/build identity and effective ELECTRON_RUN_AS_NODE/RunAsNode behavior against the accepted .tmp/rel009-ready-runtime-smoke invocation. Prove the actual child command can run @aive/core/dist/cli.js and create matching server.json plus /health on a fresh project-local diagnostic port. Repair only the demonstrated cause and add focused packaged-launch evidence. Then retry only the owned-core updater transition in a fresh run root; after it PASSes, run the separate shared-core defer-without-mutation proof. Do not rerun or republish v1.1.0–v1.1.3.

## REL-009 follow-up diagnostic checkpoint — 2026-10-13

The RunAsNode-disabled hypothesis is not supported: the lower installed EXE reports RunAsNode Enabled. A Node-driven spawn of that same Electron executable with the packaged core CLI passes ready/server.json on port 48716; the installed core-launcher passes readiness + /health with the same child executable and all bundled asset paths on ports 48717 and 48719. Bundled ffmpeg/ffprobe also pass direct version probes. These controls do not close the original desktop-main failure: the actual app still produced a core-start timeout and no server.json in its controlled data root.

NEXT_EXACT_ACTION: instrument the actual desktop main at module load and immediately before ensureCore, capture process.execPath, AIVE_DATA_DIR, AIVE_PORT and whether applyBundledAssetEnv completes, then compare the effective main-process environment/startup path with the passing Node-driven launcher control. Repair only the demonstrated discrepancy. Do not rerun updater E2E before the focused packaged-main startup proof passes.

## REL-009 current runtime — RUNNING
- Single active harness: .tmp/rel009-v113-owned-e2e2.ps1; FileMCP PTY pty_e38df6f3a21835ed6039b651e3a496daa5df; host PID 10760.
- Lower app PID 123544; owned core PID 143260; dedicated port 48721.
- Observed PASS markers: REL009_OWNED_CORE_STARTED=PASS and REL009_UPDATE_AVAILABLE=PASS version=1.1.3.
- Next: monitor the same PTY for Restart now, core exit before NSIS, public installer hash, complete module tree, license revalidation, and unchanged project/user state. Do not duplicate/restart this run.
