# TVE-REL-004 — Release-tool dependency security hardening

Status: PASS / VERIFIED
Date: 2026-10-09
Branch: `chatgpt/phase7-commercial-release`
Baseline task HEAD: `e051b8d`
Prior product baseline retained: `personal/main@af92f20` MAIN VERIFIED

## Input
- Carry-over dependency-security evidence: `docs/evidence/implementation/TVE-IMP-009.md`.
- Phase-7 release plan: `docs/plan/PHASE7_RELEASE_PLAN_V1.md`.
- Current release tool manifest/lockfile: `apps/desktop/package.json`, `package-lock.json`.
- REL-003 provenance baseline committed at `e051b8d`.

## Entry Gate
PASS:
- REL-003 is committed at `e051b8d`.
- Production dependency audit remained 0 findings before this task and was rechecked after materialization.
- Only the dev/release packaging chain was reopened; prior product runtime IMP/E2E gates were not rerun.
- Git root was `E:/SynthCut` for all task mutations/tests.

## Work
1. Reproduced the carried full audit and persisted it as `.tmp/rel004-audit-before.json`.
2. Confirmed baseline release-tool risk: 12 findings = 11 high + 1 critical, centered on `electron-builder@25.1.8` and its build-only dependency graph.
3. Evaluated npm's remediation target `electron-builder@26.15.3` and package metadata before mutation.
4. Performed a narrow, explicit, non-force upgrade of only the desktop release tool declaration:
   - `electron-builder`: `^25.1.8` → `^26.15.3`;
   - regenerated the affected dev dependency graph in `package-lock.json`;
   - no `npm audit fix --force` was used.
5. Materialized the updated tree with scripts disabled for dependency convergence.
6. Re-ran production/full audits and inspected the exact residual dependency graph.
7. Ran root build + typecheck and an unpacked Windows package smoke with electron-builder 26.15.3.
8. Inspected the unpacked runtime tree to determine whether the residual vulnerable build-tool packages ship to end users.
9. Checked compliance resources and executable signing state without publishing or installing anything.

## Output
A verified release-tool dependency decision:
- `electron-builder@26.15.3` is selected for this release lane;
- previous critical/high packaging findings are eliminated;
- production audit remains 0;
- the remaining 8 moderate findings are explicitly accepted as residual build-time-only risk pending an upstream-compatible fix;
- build/typecheck/unpacked packaging are proven compatible with the upgraded toolchain.

## Exit Gate
PASS under the frozen REL-004 rule: no blocker-level vulnerability is accepted silently and every residual finding has documented exposure/rationale.

Measured security delta:
- baseline full audit: `12` findings = `11 high + 1 critical`;
- final full audit: `8` findings = `8 moderate`, `0 high`, `0 critical`;
- final production-only audit: `0` findings.

Compatibility gates:
- root build: PASS / exit 0;
- root typecheck: PASS / exit 0;
- unpacked Windows package smoke: PASS / exit 0 using electron-builder `26.15.3`;
- compliance resources present in unpacked image;
- no product runtime IMP/E2E stage was reopened.

## Artifact
Tracked:
- `apps/desktop/package.json`
- `package-lock.json`
- this evidence record
- synchronized `CURRENT_HANDOFF.md`, `PROJECT_STATE.md`, `tasks/TASK_QUEUE.md`

Runtime/local evidence:
- `.tmp/rel004-audit-before.json`
- `.tmp/rel004-audit-after.json`
- `apps/desktop/build/rel004-smoke/win-unpacked/`
- package-smoke PTY `pty_25a88433303bae79a0a4dea96c2420454896`

## Evidence
### Baseline full audit
PTY: `pty_20071ac26e47c567ceb075bf8e1b910c1185`.
Inner npm audit exit: `1` (expected for vulnerable baseline).
Persisted artifact: `.tmp/rel004-audit-before.json`.

Parsed baseline metadata:
- info: 0
- low: 0
- moderate: 0
- high: 11
- critical: 1
- total: 12

Affected release/dev packages included:
`@electron/rebuild`, `app-builder-lib`, `builder-util`, `builder-util-runtime`, `cacache`, `dmg-builder`, `electron-builder`, `electron-builder-squirrel-windows`, `electron-publish`, `make-fetch-happen`, `node-gyp`, `tar`.

### Narrow remediation
Candidate: `electron-builder@26.15.3`.
Registry metadata check showed Node `>=14.0.0`; direct release-tool dependencies converge to `app-builder-lib/dmg-builder/builder-util 26.15.3` and `builder-util-runtime 9.7.0`.

Mutation command was explicit/non-force and package-scoped. Materialized resulting tree includes:
- `electron-builder@26.15.3`;
- `app-builder-lib@26.15.3`;
- `@electron/rebuild@4.2.1`;
- `node-gyp@12.4.0`;
- `tar@7.5.22`;
- `builder-util-runtime@9.7.0`.

### Final audit
Persisted artifact: `.tmp/rel004-audit-after.json`.
Parsed final metadata:
- info: 0
- low: 0
- moderate: 8
- high: 0
- critical: 0
- total: 8

Residual chain:
`app-builder-lib@26.15.3 → @electron/get@3.1.0 → global-agent@3.0.0 → roarr@2.15.4 → sprintf-js@1.1.3`, plus the corresponding electron-builder wrapper packages reported by npm.

The direct underlying advisory is the `sprintf-js` denial-of-service issue (`GHSA-hp3w-g68c-fv3c`) for `sprintf-js <=1.1.3`.

### Residual-risk decision
The residual 8 moderate findings are accepted for REL-004 because:
1. no high/critical finding remains;
2. production-only audit is 0;
3. the vulnerable release-tool packages are not included in the unpacked application runtime;
4. unpacked inspection showed `electron-builder`, `app-builder-lib`, `@electron/get`, `roarr`, and `sprintf-js` are absent from `resources/app/node_modules`;
5. the runtime does contain `global-agent`, but the shipped copy is `4.1.3` from the ONNX runtime dependency path, not the vulnerable packaging copy `3.0.0`;
6. npm's reported downgrade target `electron-builder@26.5.0` is rejected because the prior audit evidence places that older range back inside the known high-severity electron-builder findings;
7. the newer v26 registry tag `26.17.0` still depends on `@electron/get ^3.0.0`, so it does not remove this residual chain;
8. `sprintf-js` has no published fixed version newer than `1.1.3` at this verification point;
9. moving to a prerelease `27.x alpha` toolchain is not justified for a stable Windows release merely to chase a build-only moderate advisory.

This is a bounded build-time residual-risk acceptance, not a claim that the full audit is clean.

### Production audit
`npm audit --omit=dev --json`: PASS / exit `0`, total findings `0`.

### Regression gates
- `npm run build`: PASS / exit `0`.
- `npm run typecheck`: PASS / exit `0`.

### Unpacked package smoke
PTY: `pty_25a88433303bae79a0a4dea96c2420454896`.
Command target: project-local `apps/desktop/build/rel004-smoke`.
Result: PASS / exit `0`.
Marker: `REL004_PACK_SMOKE_EXIT=0`.
Observed builder version: `26.15.3`.
Observed Windows target: x64 / Electron `42.4.1` / `win-unpacked` output.

Runtime-image checks:
- `electron-builder`: absent;
- `app-builder-lib`: absent;
- `@electron/get`: absent;
- `roarr`: absent;
- `sprintf-js`: absent;
- `global-agent`: present as safe runtime copy `4.1.3`;
- `LICENSE`: present;
- `THIRD_PARTY_LICENSES.md`: present;
- `SOURCE_OFFER.md`: present;
- `resources/aive/bundle-manifest.json`: present;
- `Tang AI Video Editor.exe`: present, size `232,375,296` bytes.

Signing check: `Get-AuthenticodeSignature` returned `NotSigned`. This is expected and remains a hard REL-007 blocker; REL-004 does not claim trusted signing.

The smoke also emits an electron-builder warning that `asar=false` is strongly discouraged. This pre-existing packaging configuration is not a security regression introduced by REL-004; it is carried as a release-packaging hardening consideration into REL-005/REL-006 rather than silently ignored.

## Owner / Authority
ChatGPT Web owns the REL-004 risk/verification judgment; FileMCP-E executed the dependency, audit, build, typecheck, package-smoke and runtime-image checks. Upstream package maintainers remain authority for future advisory fixes.

## Risks / Open Questions
- Full dev audit is not zero: 8 moderate build-tool findings remain and must stay visible in release documentation/state.
- A future stable electron-builder/@electron/get release that removes the vulnerable chain should reopen REL-004 for a narrow upgrade.
- `asar=false` remains a packaging-hardening consideration for the following release tasks.
- Trusted code signing is still absent and remains REL-007, not REL-004.
- Remotion commercial/redistribution basis remains REL-007.

## Loopback
- New high/critical release-tool advisory or exploitable runtime inclusion → REL-004.
- Packaging incompatibility after release-workflow/config changes → owning REL-005/006 first, REL-004 only if dependency-owned.
- Product runtime regression → reopen only the owning IMP task.
- Trusted-signing or Remotion-license failure → REL-007.
