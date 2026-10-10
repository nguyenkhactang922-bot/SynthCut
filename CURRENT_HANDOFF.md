# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-007 — External commercial authorization gates`
- STATUS: `INTERRUPTED / REL-007 BLOCKED_EXTERNAL`
- CURRENT_STAGE: `REL-007 — repository signing integration PREPARED/PASS; waiting on explicit owner Remotion eligibility/license basis + real trusted Windows signing credential/service`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: resolve from current Git HEAD (Git is authoritative); REL-006 acceptance/state commit: `f297abb`
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1` (`personal/main` MAIN VERIFIED before Phase-7 changes)
- LAST_VERIFIED_CHECKPOINT: `TVE-REL-006 PASS` — NSIS+ZIP artifact integrity PASS; package manifest clean at `225a987`; packaged MCP/core/bundled-resource smoke PASS; project save/open PASS; representative H.264+AAC export PASS; installer exit 0; installed desktop launch PASS; fork update metadata/hashes/provenance PASS. Evidence: `docs/evidence/release/TVE-REL-006.md`.
- PROCESS_PID: `NONE` for SynthCut REL-006/007
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` for active SynthCut task. Any visible unrelated PTY belongs to another project and must not be touched.
- LATEST_LOG: `docs/evidence/release/TVE-REL-007-BLOCKER.md`
- LAST_EXIT_CODE: `N/A — no REL-007 process started`; last accepted runtime result remains REL-006 PASS / exit 0.
- ARTIFACTS:
  - `docs/evidence/release/TVE-REL-007-BLOCKER.md`
  - `docs/evidence/release/TVE-REL-006.md`
  - `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe`
  - `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.zip`
  - `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe.blockmap`
  - `apps/desktop/build/rel006-rerun3-dist/latest.yml`
  - `apps/desktop/build/rel006-rerun3-dist/SHA256SUMS.txt`
  - `apps/desktop/build/rel006-rerun3-dist/win-unpacked/`
  - `.tmp/rel006-install4-exit.json`
  - `.tmp/rel006-installed4/`
  - `.tmp/rel006-packaged-project.aive`
  - `.tmp/rel006-packaged-project.tang.json`
  - `.tmp/rel006-packaged-export-av.mp4`
- BLOCKERS:
  - `REMOTION_LICENSE_GATE`: official Remotion terms checked 2026-10-10 allow commercial/automation use for individuals or teams up to 3, but ADR-002 forbids inferring operator/team size; no owner eligibility declaration or paid license basis is recorded.
  - `WINDOWS_SIGNING_GATE`: repository workflow is now prepared to consume `WIN_CSC_LINK` + `WIN_CSC_KEY_PASSWORD` and fail fast when commercial tag signing secrets are absent, but no real trusted signing identity/service or credential is configured; accepted installer remains `NotSigned`.
  - Therefore `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false`.
- NEXT_EXACT_ACTION: Obtain the two remaining owner/provider inputs only: (1) an explicit Remotion eligibility/license basis (commercial intent alone is insufficient; operator/team eligibility must be stated or a paid basis supplied), and (2) a real trusted Windows signing certificate/service. For the certificate path, configure repository secrets `WIN_CSC_LINK` and `WIN_CSC_KEY_PASSWORD` out-of-band; then build and verify only the REL-007 signed candidate. Do not repeat REL-006 and do not publish before both gates PASS.
- DO_NOT_REPEAT:
  - DISCOVER / original DEFINE / original RESEARCH;
  - completed DESIGN spikes and `TVE-FRZ-001`;
  - TVE-PLAN-001..004;
  - TVE-IMP-001..011;
  - TVE-E2E-001 feature/main verification;
  - PR #1 push/review/merge/main verification;
  - TVE-REL-001..005;
  - TVE-REL-006 package/install/runtime acceptance;
  - unrelated `.spike-temp/`, `.tmp/`, dataset scratch, or other project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20 ten-field contract.

## Hard gates
- Prior product/runtime baseline remains `MAIN_VERIFIED=true` at `personal/main@af92f20`.
- `TVE-REL-006=PASS`.
- `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until REL-007 PASS.
- REL-008 GitHub Release publication remains blocked by REL-007.
