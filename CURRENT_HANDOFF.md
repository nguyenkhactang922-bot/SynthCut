# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-007 — External commercial authorization gates`
- STATUS: `INTERRUPTED / REL-007 STRATEGY CHANGE — REMOTION PASS / SUPABASE LICENSE BACKEND PASS / PAID SIGNING DECLINED`
- CURRENT_STAGE: `REL-007 — owner declined paid Windows signing on 2026-10-11; Supabase commercial license backend + founder key are provisioned/PASS; current ADR still requires trusted signing, so an unsigned-commercial release amendment is required before publication`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from current Git HEAD (Git is authoritative); REL-006 acceptance/state commit: `f297abb`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE SUPABASE COMMERCIAL LICENSE BACKEND PASS` — isolated `tve_license_*` tables created with RLS/direct public grants removed; transactional activation RPC PASS; Edge Function `tve-license-authority` deployed and real HTTPS validation PASS; 3-device limit PASS; test activations cleaned; founder/admin commercial key created with prefix `TAIVE-F3E3Y`, maxDevices=3, no expiry, activeDevices=0. Evidence: `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md`. Plaintext key is not stored in Git.
- PROCESS_PID: `NONE` for SynthCut release/licensing task
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` for active SynthCut task. Any visible unrelated PTY belongs to another project and must not be touched.
- LATEST_LOG: `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md`
- LAST_EXIT_CODE: `PASS` for Supabase database/Edge Function verification; no release publication process started.
- ARTIFACTS:
  - `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md`
  - Supabase Edge Function `tve-license-authority` (project `ljygpbxkxmsuhdfpfgml`)
  - `docs/evidence/release/TVE-REL-007-SIGNING-PROVIDER.md` (retained optional future signing path)
  - `docs/release/WINDOWS_SIGNING_SSL_COM.md`
  - `apps/desktop/electron-builder.commercial.cjs`
  - `.github/workflows/release.yml`
  - `docs/evidence/release/TVE-REL-007-REMOTION.md`
  - `docs/evidence/release/TVE-REL-007-BLOCKER.md`
  - `docs/evidence/release/TVE-REL-006.md`
- BLOCKERS:
  - `REMOTION_LICENSE_GATE=PASS`: owner explicitly declared on 2026-10-11 that the Tang AI Video Editor operator has at most 3 people and uses the current Remotion Free License. Evidence: `docs/evidence/release/TVE-REL-007-REMOTION.md`.
  - `SUPABASE_LICENSE_BACKEND=PASS`: commercial key authority exists and founder/admin key is active with 3-device limit; plaintext key is not stored in repo. Evidence: `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md`.
  - `PAID_WINDOWS_SIGNING_DECLINED_BY_OWNER=true` as of 2026-10-11. SSL.com/eSigner integration remains retained as an optional future path, not the active next action.
  - `WINDOWS_SIGNING_GATE` is still not PASS under current ADR; Supabase licensing does not replace Authenticode. Accepted REL-006 installer remains `NotSigned`.
  - Therefore `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` under the current frozen ADR until the release acceptance criteria are amended for an unsigned commercial path or trusted signing is later supplied.
- NEXT_EXACT_ACTION: perform a bounded DEFINE/ADR/PLAN amendment for an unsigned commercial distribution path (explicitly accepting `Unknown publisher` / SmartScreen risk), then integrate the desktop app with `tve-license-authority` and verify activation/startup/device-limit behavior. Do not repeat REL-006, Remotion, Supabase backend provisioning, provider research, or eSigner integration.
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
- `SUPABASE_LICENSE_BACKEND=PASS`.
- `PAID_WINDOWS_SIGNING_DECLINED_BY_OWNER=true`.
- `WINDOWS_SIGNING_PROVIDER_INTEGRATION=PASS` remains retained only as an optional future path.
- Under current ADR, `WINDOWS_SIGNING_GATE=PASS` is absent and `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false`.
- REL-008 remains blocked until a bounded amendment explicitly permits unsigned commercial distribution or trusted signing is later supplied.