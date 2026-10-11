# PROJECT_STATE

Project: Tang AI Video Editor on SynthCut base
Root: `E:\SynthCut`
Branch: `chatgpt/phase7-commercial-release`
HEAD baseline: `af92f20` (`personal/main` MAIN VERIFIED before Phase-7 changes)

## Canonical lifecycle
`docs/process/PROJECT_LIFECYCLE_V1.md`
Global contract: `docs/CHATCODE_GLOBAL_MULTI_PROJECT_EXECUTION_LAW.md` §19 + §20.

## Current lifecycle phase
`RELEASE & OPERATE — ACTIVE; TVE-REL-006 PASS; TVE-REL-007 PARTIAL PASS — REMOTION_LICENSE_GATE=PASS / WINDOWS_SIGNING_PROVIDER_INTEGRATION=PASS / WINDOWS_SIGNING_GATE BLOCKED_EXTERNAL`

## Phase gates
- DISCOVER: PASS — retained
- DEFINE: V1 FROZEN + commercial release scope amendment PASS — `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- RESEARCH: V1 PASS + commercial redistribution audit PASS WITH HARD GATES — `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- DESIGN: V1 FROZEN + release ADR ACCEPTED — `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- PLAN IMPLEMENTATION: V1 PASS + Phase-7 release plan FROZEN — `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
- BUILD & VERIFY: PASS — prior product baseline remains MAIN VERIFIED at `personal/main@af92f20`
- RELEASE & OPERATE: ACTIVE — REL-001/002 PASS; REL-003 COMMITTED `e051b8d`; REL-004 COMMITTED `20c8ff9`; REL-005 COMMITTED `227535b`; REL-006 PASS with evidence `docs/evidence/release/TVE-REL-006.md`; REL-007 Remotion sub-gate PASS + SSL.com IV/eSigner provider integration PASS / external certificate issuance and real signed candidate BLOCKED_EXTERNAL; publication remains prohibited
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
`TVE-REL-007 — PARTIAL PASS: REMOTION_LICENSE_GATE=PASS; WINDOWS_SIGNING_PROVIDER_INTEGRATION=PASS; WINDOWS_SIGNING_GATE BLOCKED_EXTERNAL`

Release baseline summary:
- prior product/runtime Build & Verify remains MAIN VERIFIED at `personal/main@af92f20`;
- user authorized Windows GitHub Release on the personal fork plus commercial-distribution hardening (`B+C`);
- REL-001 commercial scope/audit/ADR/plan is PASS;
- REL-002 fork identity/updater ownership is PASS with evidence `docs/evidence/release/TVE-REL-002.md`;
- REL-003 provenance/source compliance is PASS/COMMITTED `e051b8d` with `docs/evidence/release/TVE-REL-003.md`;
- REL-004 packaging/release-tool security hardening is PASS/COMMITTED `20c8ff9` with `docs/evidence/release/TVE-REL-004.md`;
- REL-005 release workflow/version hardening is PASS/COMMITTED `227535b` with `docs/evidence/release/TVE-REL-005.md`;
- REL-006 local packaged acceptance is PASS with `docs/evidence/release/TVE-REL-006.md`; accepted candidate manifest source commit is `225a987`, installer/ZIP integrity PASS, packaged MCP/core/resource resolution PASS, save/open PASS, representative H.264+AAC export PASS, installer exit 0 and installed launch PASS;
- `REMOTION_LICENSE_GATE=PASS` with evidence `docs/evidence/release/TVE-REL-007-REMOTION.md`; SSL.com IV + eSigner provider/repository integration is PREPARED/PASS with `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`; public commercial-ready publication is now fail-closed only on external certificate/eSigner issuance plus a real signed-candidate verification at REL-007.

## Hard gate
`RELEASE_IMPLEMENTATION_ALLOWED=true` for dependency-ready REL-002..006 tasks.

`PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until REL-007 PASS. This authorization is task/dependency scoped and does not permit skipping license/signing gates or rerunning prior IMP/E2E stages.

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

## Latest TVE-REL-007 blocker verification
- Status: `PARTIAL PASS / BLOCKED_EXTERNAL` — Remotion sub-gate PASS; SSL.com IV + eSigner provider/repository integration PASS; real certificate issuance/signed candidate still pending.
- Evidence: `docs/evidence/release/TVE-REL-007-REMOTION.md` + `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md` + `docs/evidence/release/TVE-REL-007-BLOCKER.md`.
- `REMOTION_LICENSE_GATE=PASS` / basis `FREE_LICENSE_ELIGIBLE`; durable evidence is `docs/evidence/release/TVE-REL-007-REMOTION.md`.
- Selected signing provider path: SSL.com Individual Validated Code Signing + eSigner Cloud Signing. Repository integration is PREPARED/PASS and does not persist a private signing key.
- `.github/workflows/release.yml` is fail-closed for release tags, pins eSigner CKA `v1.1.2` by SHA-256, loads the issued certificate into the runner certificate store, and requires a commercial electron-builder config with `forceCodeSigning=true`.
- Verification PASS: canonical release validator; positive commercial signing-config load; missing-input fail-closed test; workflow YAML parse; official eSigner CKA installer SHA-256 match and Authenticode `Valid` signed by SSL Corp.
- GitHub repository variables are configured: `REMOTION_COMMERCIAL_BASIS_APPROVED=true`, `WINDOWS_SIGNING_PROVIDER=sslcom-esigner`, `WINDOWS_SIGNING_APPROVED=false`.
- External issuance is still absent: no issued SSL.com IV/eSigner publisher certificate and therefore no `ESIGNER_USERNAME`, `ESIGNER_PASSWORD`, `ESIGNER_TOTP_SECRET`, or issued `WINDOWS_SIGN_PUBLISHER_NAME` is available to CI.
- Accepted REL-006 installer remains `NotSigned`; no real signed candidate was built.
- `WINDOWS_SIGNING_GATE=PASS` is still absent, so `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false`.
- No REL-006 stage was rerun and no tag/push/release/publish/deploy side effect occurred.

## NEXT_EXACT_ACTION
Product owner completes SSL.com IV Code Signing + eSigner purchase and individual identity validation. After issuance, configure GitHub Actions secrets `ESIGNER_USERNAME`, `ESIGNER_PASSWORD`, `ESIGNER_TOTP_SECRET`, set `WINDOWS_SIGN_PUBLISHER_NAME` from the issued certificate, then set `WINDOWS_SIGNING_APPROVED=true` and execute only the REL-007 signed-candidate path. Verify installer + packaged app Authenticode `Valid`, expected publisher, and RFC3161 timestamp before REL-007 PASS. Do not repeat REL-006, Remotion, provider research, or provider integration; do not publish before `WINDOWS_SIGNING_GATE=PASS`.
