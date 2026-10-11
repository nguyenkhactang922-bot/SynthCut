# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `REL-007 PASS / REL-008 ELIGIBLE — pre-publication review + side-effect guard required`
- CURRENT_STAGE: `REL-007 unsigned-commercial amendment, Supabase desktop entitlement integration, packaged runtime persistence proof, and full 1.1.0 unsigned NSIS/ZIP proof are PASS; no public release has been created yet`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from current Git HEAD (Git is authoritative); pre-REL-007 baseline was `1b28fd47c8354e9061e502eb0af350edc2ae4b80`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-007=PASS` for the owner-approved unsigned commercial lane. Evidence: `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md`.
- PROCESS_PID: `NONE` for SynthCut build/package/release task
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: prior full 1.1.0 dist PTY completed with exit code 0; no active SynthCut release PTY remains
- LATEST_LOG: `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md`
- LAST_EXIT_CODE: `0` for full `1.1.0` unsigned `npm run dist -- --publish never`; artifact/signature/hash verification also PASS / exit 0
- ARTIFACTS:
  - `apps/desktop/build/dist/Tang-AI-Video-Editor-1.1.0.exe` — 397,651,986 B — SHA-256 `867fb75aceecab263ad0a5b3914f55ce71772dfa6aa923749b689dc1ecad6451`
  - `apps/desktop/build/dist/Tang-AI-Video-Editor-1.1.0.zip` — 505,858,328 B — SHA-256 `2ff621e45d4c7d78211282beec983fecc66ea6f2f635f074aa8ece53d2d004f2`
  - `apps/desktop/build/dist/Tang-AI-Video-Editor-1.1.0.exe.blockmap`
  - `apps/desktop/build/dist/latest.yml`
  - `apps/desktop/build/dist/SHA256SUMS.txt`
  - `docs/evidence/release/TVE-REL-007-UNSIGNED-SUPABASE.md`
  - `docs/evidence/release/TVE-SUPABASE-LICENSE-BACKEND.md`
  - Supabase Edge Function `tve-license-authority` (project `ljygpbxkxmsuhdfpfgml`)
- BLOCKERS: `NONE` for REL-007. REL-008 still requires reviewed committed source plus side-effect guard proving no existing `v1.1.0` tag/release collision and valid GitHub write auth before any push/tag/release action.
- NEXT_EXACT_ACTION: review the exact REL-007 diff, run final diff/static checks without rerunning already-PASS runtime/package stages, commit the REL-007 lane, then inspect remote branch/tag/release/auth state. Only if collision/auth checks PASS, push/review/merge according to repository workflow and create the fork-only `v1.1.0` release path. Never publish to upstream `Relo-video/SynthCut`.
- DO_NOT_REPEAT:
  - DISCOVER / original DEFINE / original RESEARCH;
  - completed DESIGN spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - TVE-IMP-001..011;
  - TVE-E2E-001 feature/main verification;
  - PR #1 push/review/merge/main verification;
  - TVE-REL-001..006;
  - REL-007 Remotion, Supabase backend provisioning, signing-provider research, desktop entitlement runtime activation/restart proof, and full 1.1.0 local dist;
  - unrelated `.spike-temp/`, `.tmp/`, historical rel006 build outputs, dataset scratch, or other project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gates
- Prior product/runtime baseline remains `MAIN_VERIFIED=true` at `personal/main@af92f20`.
- `TVE-REL-001..007=PASS` for the current unsigned commercial lane.
- `REMOTION_LICENSE_GATE=PASS`.
- `SUPABASE_LICENSE_BACKEND=PASS`.
- `UNSIGNED_COMMERCIAL_RELEASE_APPROVED=true`.
- Installer and packaged application are intentionally `NotSigned`; owner accepts `Unknown publisher` / SmartScreen risk.
- Trusted Windows signing remains optional future hardening and is not the current lane gate.
- `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=true` only through the frozen unsigned lane and only after REL-008 entry checks (reviewed commit, fork-only target, no collision, valid GitHub auth) pass.
- REL-009 remains blocked until REL-008 publishes a valid update feed/release.
