# TVE-IMP-009 — Dependency hardening promotion

Status: PASS / READY FOR TASK-SCOPED COMMIT
Date: 2026-10-09
Branch: `chatgpt/ai-video-editor-design`
Baseline task HEAD: `5409b4e75840a8bd6c55dd9550c9909505ec3e95`

## Scope
Promote the frozen `TVE-SPIKE-DEPSEC-001` non-force dependency remediation into production without changing application source or forcing the separately tracked `electron-builder` major upgrade.

## Entry evidence
- Frozen spike: `docs/evidence/spikes/TVE-SPIKE-DEPSEC-001.md`.
- Current task baseline production audit: 16 findings = 5 moderate / 10 high / 1 critical.
- Current task baseline full audit: 33 findings = 5 moderate / 26 high / 2 critical.
- Remediation command already executed for this task before this evidence record: `npm audit fix --package-lock-only` with **no `--force`**.
- Candidate mutation: `package-lock.json` only; `package.json` unchanged.

## Materialization recovery
The earlier `npm ci --ignore-scripts` process was referenced by handoff, but on resume its PID/session no longer existed and no terminal exit/result marker was available. It was **not rerun** and is **not claimed PASS**.

Instead, the materialized tree was verified directly:
- `npm ls --omit=dev --json` — PASS / exit 0.
- Observed patched production tree includes `@modelcontextprotocol/sdk@1.32.1`, `nanoid@5.1.16`, `onnxruntime-node@1.30.0`, and other lockfile-selected compatible updates.

This proves the current `node_modules` tree is usable and consistent enough for the following audit/build/test gates without inventing an install result.

## Security audit after materialization
### Production-only
`npm audit --omit=dev --json` — PASS / exit 0:
- info 0
- low 0
- moderate 0
- high 0
- critical 0
- total 0

### Full audit
`npm audit --json` — expected nonzero exit because tracked dev/packaging risk remains:
- high 11
- critical 1
- total 12

All remaining findings are in the development/packaging chain centered on `electron-builder`, including `app-builder-lib`, `builder-util`, `builder-util-runtime`, `dmg-builder`, `electron-publish`, `electron-builder-squirrel-windows`, `@electron/rebuild`, `node-gyp`, `cacache`, `make-fetch-happen`, and `tar`.

npm proposes `electron-builder@26.15.3` and marks that remediation as semver-major. Per frozen scope, IMP-009 does **not** use `--force` and does **not** promote that major upgrade. The risk remains explicitly carried to packaging/release convergence before installer MAIN VERIFIED.

## Regression gates on hardened tree
1. `npm run build` — PASS / exit 0.
   - `@aive/core` TypeScript build PASS.
   - `@aive/mcp` TypeScript build PASS.
   - desktop Vite production renderer build PASS.
2. `npm run typecheck` — PASS / exit 0.
3. `npm exec -- tsx apps/desktop/scripts/smoke-composite.ts` — PASS / exit 0; all compositor checks green.
4. `npm exec -- tsx packages/core/scripts/smoke-clip-tokenizer.ts` — PASS / exit 0; tokenizer/cosine checks green.
5. `packages/core/scripts/smoke-security.ts` — PASS / exit 0 using project-local `E:\SynthCut\.spike-temp\lf001-corrected\ffmpeg.exe` and `ffprobe.exe` through child-process environment variables.
   - token discovery PASS;
   - `/rpc` authentication PASS;
   - `/health` redaction PASS;
   - `/file` allowlist/traversal protections PASS;
   - imported asset serving/token requirement PASS;
   - WebSocket authentication PASS.

A first attempt to launch the security smoke through FileMCP environment overrides was rejected before process start because `AIVE_FFMPEG` was not allowlisted. A later tool response returned 502; process inspection confirmed no smoke/FFmpeg process survived before the successful PTY rerun. No duplicate test process was created.

## Diff/architecture constraints
- `package.json`: unchanged.
- application/core/MCP/desktop source: unchanged by IMP-009.
- dependency remediation: lockfile-only, non-force.
- unrelated `packages/skill-installer/bin/synthcut.mjs`, `.spike-temp/`, `.tmp/`, dataset scratch, and historical staged governance work are outside task scope and must not be absorbed by the task commit.

## Acceptance verdict
PASS for `TVE-IMP-009`:
- current dependency graph was revalidated against frozen DEPSEC evidence;
- production audit is 0 findings;
- build/typecheck/security and retained DEPSEC regressions pass;
- no forced major dependency change was used;
- the remaining 12 dev/packaging findings are explicitly classified and deferred to the required packaging/release hardening gate.

## Next lifecycle action
Run focused diff/diff-check and task-scoped commit of only `package-lock.json` + this evidence file. After commit, sync `CURRENT_HANDOFF.md`, `PROJECT_STATE.md`, and `tasks/TASK_QUEUE.md` with the real commit hash, then claim the next dependency-ready serialized task (`TVE-IMP-010`).
