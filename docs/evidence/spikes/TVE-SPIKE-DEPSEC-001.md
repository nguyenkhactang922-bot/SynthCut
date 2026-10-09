# TVE-SPIKE-DEPSEC-001 — Dependency Integrity Evidence

Status: PASS FOR SPIKE HYPOTHESIS
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Nature: disposable dependency-remediation experiment; not production implementation.

## Hypothesis
Critical/high production dependency findings can be removed or explicitly classified without destabilizing the SynthCut core/MCP/UI build.

## Baseline evidence
After clean lockfile install:
- full audit: 32 findings = 5 moderate, 25 high, 2 critical;
- production-only audit (`npm audit --omit=dev`): 15 findings = 5 moderate, 9 high, 1 critical;
- the critical production chain reached `proxy-addr` through `express -> @modelcontextprotocol/sdk -> @aive/mcp`.

## Candidate remediation
Command used for the disposable candidate:
`npm audit fix --package-lock-only`

Rules observed:
- no `--force`;
- no direct source-code changes;
- no package.json major upgrade;
- lockfile transitive versions only.

Representative production transitive updates proposed/applied by npm included patched/newer compatible versions of:
- `proxy-addr` 2.0.7 -> 2.0.8;
- `@hono/node-server` 1.19.14 -> 1.19.17;
- `adm-zip` 0.5.17 -> 0.6.1;
- `fast-uri` 3.1.2 -> 3.1.8;
- `ip-address` 10.2.0 -> 10.7.3;
- `js-yaml` 4.2.0 -> 4.3.2;
- `nanoid` patched in both dependency locations;
- `onnxruntime-node` / `onnxruntime-common` 1.26.0 -> 1.30.0;
- `postcss`, `source-map-js`, `qs`, `hono`, browserslist data packages and related compatible transitive packages.

Lockfile candidate diff size: 119 insertions / 114 deletions in `package-lock.json`.

## Production audit after candidate
`npm audit --omit=dev --json` result:
- moderate: 0
- high: 0
- critical: 0
- total: 0

**PASS: production dependency gate can be satisfied without a forced major upgrade.**

## Regression evidence after candidate
1. `npm ci --ignore-scripts` — PASS.
2. `npm run build` — PASS.
   - core TypeScript build PASS;
   - MCP TypeScript build PASS;
   - desktop Vite production build PASS.
3. `npm run typecheck` — PASS.
4. `apps/desktop/scripts/smoke-composite.ts` — PASS.
5. `packages/core/scripts/smoke-clip-tokenizer.ts` — PASS.
6. `packages/core/scripts/smoke-security.ts` — PASS using an existing workspace-local FFmpeg 6.1.1 binary as test execution dependency.
   - session-token discovery/auth PASS;
   - unauthenticated health redaction PASS;
   - file allowlist + traversal rejection PASS;
   - imported-asset serving/token requirement PASS;
   - WebSocket token enforcement PASS.
7. MCP end-to-end smoke reached: core start -> MCP connect -> 94 tools -> editing guide -> two imports -> edit -> timeline summary successfully. Its export step could not resolve FFmpeg under the restricted child-process PATH in this FileMCP execution environment; the same FFmpeg binary works in core security smoke. This is recorded as environment evidence, not attributed to the dependency update.

## Remaining full-audit findings
After the production fixes, full `npm audit` still reports:
- high: 11
- critical: 1
- total: 12

All remaining listed packages are in the **development/packaging toolchain** chain centered on direct devDependency `electron-builder@25.1.8`, including:
- `electron-builder`, `app-builder-lib`, `builder-util`, `builder-util-runtime`, `dmg-builder`, `electron-publish`, `electron-builder-squirrel-windows`;
- `@electron/rebuild`, `node-gyp`, `cacache`, `make-fetch-happen`;
- critical `tar` transitive dependency.

`npm audit` proposes `electron-builder@26.15.3`, marked as a SemVer-major/breaking upgrade, to clear that chain.

### Classification
- not present in production-only audit after candidate;
- used by build/package tooling rather than the installed editor's normal runtime dependency graph;
- still relevant to developer/installer build integrity and therefore **tracked**, not dismissed.

### Decision for current architecture freeze gate
The current freeze criterion is production dependency integrity. The build-toolchain chain is a reviewed packaging risk, not an unreviewed production runtime critical.

Before installer/packaging is declared MAIN VERIFIED, create a normal post-freeze hardening task to evaluate `electron-builder 26.15.3+` (or then-current fixed compatible version) with installer build/smoke evidence. Do not force-upgrade it during this architecture spike.

## Reachability notes
The previously reported production `proxy-addr` chain is transitive through the MCP SDK/Express dependency graph. SynthCut's MCP process uses stdio transport in `packages/mcp/src/index.ts`, not an application-created Express HTTP MCP endpoint, but the safest outcome is still the tested patched transitive version rather than relying solely on reachability arguments.

## Spike verdict
PASS.

The hypothesis is proven: a non-force lockfile-only remediation reaches zero production audit findings and passes build/typecheck/core security regressions.

## Promotion rule
This spike is evidence only. The candidate lockfile change must **not** silently become production implementation. After architecture FREEZE/task decomposition, the exact dependency-lock hardening must be reapplied under a traced implementation task, followed by the same audit/build/typecheck/security regression gates.

## Follow-up risk
`electron-builder` packaging-toolchain upgrade remains a planned hardening item before installer MAIN VERIFIED.
