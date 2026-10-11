# CURRENT_HANDOFF

## CANONICAL RESUME BLOCK
- PROJECT_ROOT: `E:\SynthCut`
- ACTIVE_TASK: `TVE-REL-008 — GitHub Release publication`
- STATUS: `FAIL / PROVENANCE CLEAN-GATE TIMING REPAIRED LOCALLY — HOTFIX COMMIT/PR PENDING`
- CURRENT_STAGE: `Release run 38134667267 on reviewed personal main f9ea9ab completed FAILURE only at Assemble and validate release artifact set. All earlier steps including package and the post-package tracked-clean restore PASS and are retained. The in-stage validate-release --require-clean also PASSed. Exact failure: BUNDLE_MANIFEST.json had sourceTrackedDirty=true because provenance was generated before the known workspace-bin mutation was restored. A narrow pre-provenance fail-closed restore gate plus ordering contract is repaired locally and targeted smoke PASSes.`
- BRANCH: `chatgpt/phase7-commercial-release`
- HEAD: `ee10c86aa93ee35112da6dfe93356881e05f3a7c` plus current uncommitted provenance-timing repair; Git is authoritative
- HEAD_BASELINE: `af92f2018d287a14e4f3af03f6d00879d12a6ab1`
- LAST_VERIFIED_CHECKPOINT: `REL-008 provenance-timing local repair PASS` — pre-provenance known-path restore PASS; manifest dirty-flag simulation false PASS; retained post-package restore PASS; unexpected tracked mutation rejection PASS; tag-mode validator static PASS; `git diff --check` PASS. Evidence: `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`.
- PROCESS_PID: `NONE` for active SynthCut release work
- PROCESS_COMMAND: `NONE`
- PTY_SESSION: `NONE` for active SynthCut. Current workspace PTYs observed during resume belong to other projects/processes (`Tang Super Veo Studio`, Python/uv, Rust/cargo) and must not be touched.
- LATEST_LOG: `https://github.com/nguyenkhactang922-bot/SynthCut/actions/runs/38134667267`
- LAST_EXIT_CODE: `Release run 38134667267 = FAILURE`; failed stage `Assemble and validate release artifact set`; targeted provenance clean-gate smokes = `0/PASS`
- ARTIFACTS:
  - hotfix commit `ee10c86aa93ee35112da6dfe93356881e05f3a7c` — prior post-package clean-gate repair
  - PR #7 — CI PASS and MERGED to personal main at `f9ea9ab3278c2158593508feec21fbf92f7e1ce7`
  - remote annotated tag `v1.1.0` peels to `f9ea9ab`
  - Release run `38134667267` — FAILURE after package + post-package clean gate PASS
  - GitHub Release `v1.1.0` — ABSENT / API 404 after failed run
  - `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`
  - `docs/evidence/release/TVE-REL-008-POST-PACKAGE-CLEAN-GATE-REPAIR.md`
- BLOCKERS:
  - `REL-008` cannot PASS until this provenance-timing hotfix is reviewed/committed/pushed, one automatic-CI PR PASSes, merge/tree parity is verified, and a freshly guarded tag-triggered Release workflow publishes successfully.
  - Existing remote `v1.1.0` is a durable side effect. Do not move/re-push it until hotfix merge and fresh Release-absence/tag/auth/no-active-run guards PASS.
- NEXT_EXACT_ACTION: review only `.github/workflows/release.yml`, `scripts/release/validate-release.mjs`, `docs/evidence/release/TVE-REL-008-PROVENANCE-CLEAN-GATE-REPAIR.md`, and canonical state changes; verify focused diff + `git diff --check`; commit; push only to `personal`; open exactly one hotfix PR; monitor its automatic CI. If PASS, merge to personal main and verify tree parity. Then re-check GitHub Release `v1.1.0` absence + exact current tag target + GitHub auth + no active Release run before any guarded `v1.1.0` move. Never manually create a duplicate Release and never publish upstream.
- DO_NOT_REPEAT:
  - TVE-REL-001..007;
  - PR #2..#7 completed CI/merge work;
  - PASS stages through `Restore known workspace-bin mutation before post-package clean gate` in run `38134667267`;
  - prior failed Release runs `38133316488`, `38131284821`, `38128610356`, `38127692348`;
  - prior validator/package/provenance/post-package-clean hotfixes;
  - current targeted provenance timing smokes already PASS;
  - unrelated `.spike-temp/`, `.tmp/`, historical build dirs, datasets, or other-project PTYs.

## Lifecycle law
All work follows `docs/process/PROJECT_LIFECYCLE_V1.md` and global-law §20.

## Hard gates
- `TVE-REL-001..007=PASS` retained.
- PR #2..#7 are MERGED on personal fork; upstream remains untouched.
- Current release line remains `1.1.0`; unsigned/SmartScreen acceptance, Remotion basis and Supabase entitlement gates remain PASS.
- `v1.1.0` currently peels to reviewed personal `main@f9ea9ab`; GitHub Release remains absent after run `38134667267`.
- `TVE-REL-008` remains FAIL until corrected Release workflow + publication verification PASS.
- REL-009 remains blocked by REL-008.
