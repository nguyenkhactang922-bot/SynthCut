# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-007 — External commercial authorization gates`
- STATUS: `INTERRUPTED / REL-007 PARTIAL PASS — REMOTION PASS / WINDOWS_SIGNING BLOCKED_EXTERNAL`
- CURRENT_STAGE: `REL-007 — REMOTION_LICENSE_GATE=PASS; SSL.com IV + eSigner provider/repository integration PREPARED/PASS; waiting only on external certificate purchase + identity validation + eSigner credential issuance`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from current Git HEAD (Git is authoritative); REL-006 acceptance/state commit: `f297abb`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-007 WINDOWS SIGNING PROVIDER INTEGRATION PREPARED/PASS` — selected SSL.com IV Code Signing + eSigner; release validator PASS; commercial signing config positive/fail-closed tests PASS; workflow YAML parse PASS; pinned eSigner CKA v1.1.2 hash + installer Authenticode PASS; GitHub repo variables synchronized. Evidence: `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`. `REMOTION_LICENSE_GATE=PASS` remains retained; REL-006 must not be rerun.
- PROCESS_PID: `NONE` for SynthCut REL-007 signed candidate
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` for active SynthCut task. Any visible unrelated PTY belongs to another project and must not be touched.
- LATEST_LOG: `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`
- LAST_EXIT_CODE: `N/A — no real signed-candidate process started`; repository/provider preparation checks PASS / exit 0.
- ARTIFACTS:
  - `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`
  - `docs/release/WINDOWS_SIGNING_SSL_COM.md`
  - `apps/desktop/electron-builder.commercial.cjs`
  - `.github/workflows/release.yml`
  - `docs/evidence/release/TVE-REL-007-REMOTION.md`
  - `docs/evidence/release/TVE-REL-007-BLOCKER.md`
  - `docs/evidence/release/TVE-REL-006.md`
  - `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe`
  - `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.zip`
  - `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe.blockmap`
  - `apps/desktop/build/rel006-rerun3-dist/latest.yml`
  - `apps/desktop/build/rel006-rerun3-dist/SHA256SUMS.txt`
- BLOCKERS:
  - `REMOTION_LICENSE_GATE=PASS`: owner explicitly declared on 2026-10-11 that the Tang AI Video Editor operator has at most 3 people and uses the current Remotion Free License. Evidence: `docs/evidence/release/TVE-REL-007-REMOTION.md`.
  - `WINDOWS_SIGNING_PROVIDER_INTEGRATION=PASS`: selected SSL.com IV + eSigner; workflow is fail-closed, eSigner CKA is version/hash pinned, commercial electron-builder config forces signing, and final Authenticode/publisher/timestamp verification is mandatory. Evidence: `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md`.
  - `WINDOWS_SIGNING_GATE=BLOCKED_EXTERNAL`: no SSL.com IV certificate/eSigner account credential has been purchased/issued yet; therefore `ESIGNER_USERNAME`, `ESIGNER_PASSWORD`, `ESIGNER_TOTP_SECRET` and issued `WINDOWS_SIGN_PUBLISHER_NAME` do not exist yet. Accepted REL-006 installer remains `NotSigned`.
  - GitHub repo variables are already set: `REMOTION_COMMERCIAL_BASIS_APPROVED=true`, `WINDOWS_SIGNING_PROVIDER=sslcom-esigner`, `WINDOWS_SIGNING_APPROVED=false`.
  - Therefore `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until a real signed candidate verifies and `WINDOWS_SIGNING_GATE=PASS`.
- NEXT_EXACT_ACTION: Product owner completes SSL.com IV Code Signing + eSigner purchase and individual identity validation. After issuance, configure GitHub Actions secrets `ESIGNER_USERNAME`, `ESIGNER_PASSWORD`, `ESIGNER_TOTP_SECRET`; set non-secret variable `WINDOWS_SIGN_PUBLISHER_NAME` to the issued certificate simple/common name; then set `WINDOWS_SIGNING_APPROVED=true` and run only the REL-007 signed-candidate tag/build path. Verify installer + packaged app Authenticode `Valid`, expected publisher and RFC3161 timestamp before REL-007 PASS. Do not repeat REL-006, Remotion, provider research, or provider integration.
- DO_NOT_REPEAT:
  - DISCOVER / original DEFINE / original RESEARCH;
  - completed DESIGN spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - TVE-IMP-001..011;
  - TVE-E2E-001 feature/main verification;
  - PR #1 push/review/merge/main verification;
  - TVE-REL-001..006;
  - REL-007 Remotion sub-gate;
  - REL-007 signing-provider comparison/selection/integration;
  - unrelated `.spike-temp/`, `.tmp/`, dataset scratch, or other project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gates
- Prior product/runtime baseline remains `MAIN_VERIFIED=true` at `personal/main@af92f20`.
- `TVE-REL-006=PASS`.
- `REMOTION_LICENSE_GATE=PASS`.
- `WINDOWS_SIGNING_PROVIDER_INTEGRATION=PASS`.
- `WINDOWS_SIGNING_GATE=BLOCKED_EXTERNAL`.
- `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until REL-007 PASS.
- REL-008 GitHub Release publication remains blocked by REL-007.
