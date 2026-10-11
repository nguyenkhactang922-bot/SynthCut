# TVE-REL-007 — External Commercial Authorization Blocker Evidence

Status: **PARTIAL PASS / BLOCKED_EXTERNAL — REMOTION PASS / WINDOWS SIGNING PENDING**
Date: 2026-10-10
Branch: `chatgpt/phase7-commercial-release`
Observed Git HEAD at verification: `513bafcb5a6711bb1fcbd9fd911d7332808bbdf4`
Dependency: `TVE-REL-006 PASS`

## Input
- `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
- `docs/evidence/release/TVE-REL-006.md`
- Current local certificate/signing environment state.
- Current official Remotion licensing documentation checked 2026-10-10.

## Entry Gate
PASS only to evaluate REL-007 blockers because REL-006 is PASS. REL-007 itself may not PASS until both external gates are evidenced.

## Work
1. Re-read current release scope/audit/ADR/queue.
2. Re-check official Remotion license/pricing and FAQ.
3. Search repository for a durable `REMOTION_LICENSE_GATE=PASS` or `WINDOWS_SIGNING_GATE=PASS` record.
4. Inspect local Windows code-signing certificate store and release-signing environment variables.
5. Re-check the accepted REL-006 installer Authenticode status.
6. Inspect runtime/PTYs to ensure no REL-007 process is already running.

## Output
REL-007 remains blocked on two external facts/authorities:

### REMOTION_LICENSE_GATE — BLOCKED_EXTERNAL
Official Remotion documentation checked 2026-10-10 states:
- individuals and organizations/teams of up to 3 people are eligible for the Free License;
- commercial use and automation are allowed for Free-License-eligible users;
- organizations of 4+ people require the applicable Company License.

Official references:
- https://www.remotion.dev/docs/license/pricing
- https://www.remotion.dev/docs/license/faq

Repository ADR-002 D-002-5 explicitly forbids an agent from inferring company/team size or license eligibility from chat style or repository ownership. No durable owner eligibility declaration or paid/company/enterprise license basis is present. Therefore the Remotion gate cannot be marked PASS.

### WINDOWS_SIGNING_GATE — BLOCKED_EXTERNAL
Local verification on 2026-10-10 found:
- accepted installer Authenticode status: `NotSigned`;
- no CurrentUser code-signing certificate with private key;
- `CSC_LINK`, `WIN_CSC_LINK`, `CSC_KEY_PASSWORD`, `WIN_CSC_KEY_PASSWORD`, `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_KEY_VAULT_URI` unset in the FileMCP execution environment.

No trusted signing identity/service is therefore available to create and verify the signed commercial candidate required by REL-007.

## Exit Gate
**NOT MET.** Required outputs remain:
- `REMOTION_LICENSE_GATE=PASS`
- `WINDOWS_SIGNING_GATE=PASS`

No public commercial release, tag publication, GitHub Release, deploy, or updater E2E is authorized before both outputs exist.

## Artifact
`docs/evidence/release/TVE-REL-007-BLOCKER.md`

## Evidence
- Official Remotion pricing and FAQ checked 2026-10-10.
- Repository search found the PASS marker only in the plan as a required future output, not as achieved evidence.
- Runtime process scan: no SynthCut REL-007 process running.
- Installer signature: `NotSigned`.
- Local signing certificate/private-key probe: none.
- Release signing environment probe: relevant variables unset.
- Tracked Git source was clean at verification; pre-existing untracked scratch/package evidence remains outside commit scope.

## Owner / Authority
- Product owner must declare the commercial operator eligibility basis or provide/authorize the applicable Remotion license basis.
- Product owner / trusted signing provider controls Windows signing identity/credential authority.
- ChatGPT Web/FileMCP-E may verify evidence but may not invent eligibility, credentials, certificates, or license authority.

## Risks / Open Questions
- Exact commercial operator/team headcount is not recorded and must not be inferred.
- If Free License eligibility does not apply, a valid Company/Enterprise basis or an explicitly approved Remotion-free release profile is required.
- Signing secrets/private keys must never be persisted in the repository.

## Loopback
- Owner declares Free License eligibility under current terms -> record basis and verify only the Remotion sub-gate.
- Owner provides paid Remotion basis -> record non-secret proof and verify only the Remotion sub-gate.
- Owner chooses Remotion-free distribution -> reopen only the required DEFINE/RESEARCH/DESIGN/PLAN slice before implementation; do not silently remove runtime dependencies.
- Trusted signing identity/service becomes available -> create/verify only the signed-candidate signing sub-gate.
- Until either external fact changes, do not rerun REL-006 or earlier IMP/E2E gates.

## 2026-10-11 technical signing-path preparation
The repository-side signing integration that does not require external credentials is now prepared:
- `.github/workflows/release.yml` passes `secrets.WIN_CSC_LINK` and `secrets.WIN_CSC_KEY_PASSWORD` to the Windows `electron-builder` package step;
- commercial tag publication fails early when either trusted-signing secret is absent;
- the existing post-build Authenticode verification remains mandatory before publication;
- `scripts/release/validate-release.mjs` now asserts that the signing-secret wiring and fail-fast markers remain present.

Verification:
- `node scripts/release/validate-release.mjs` -> PASS / exit 0 / marker `REL005_RELEASE_VALIDATION_PASS version=1.0.6 tag=v1.0.6 repo=nguyenkhactang922-bot/SynthCut cleanRequired=false`.
- An optional direct YAML parse probe could not run because no `yaml` Node module is installed in this repo (`MODULE_NOT_FOUND`). No dependency was added solely for that optional parser check; the canonical release validator PASS remains the accepted static check.

External gate status is unchanged:
- `REMOTION_LICENSE_GATE` still requires an explicit owner eligibility/license basis; commercial intent alone does not establish operator/team headcount.
- `WINDOWS_SIGNING_GATE` still requires a real trusted certificate/service and non-secret signature evidence. The workflow is ready to consume credentials, but none is available yet.

## 2026-10-11 Remotion sub-gate resolution
The product owner explicitly declared: `Tôi xác nhận operator của Tang AI Video Editor có tối đa 3 người và dùng Remotion theo Free License hiện hành.`

Current official Remotion pricing/FAQ were rechecked on 2026-10-11 and remain consistent with this declaration: individuals and organizations/teams of up to 3 people are eligible for the Free License, including commercial use and automation.

Result:
- `REMOTION_LICENSE_GATE=PASS`
- Basis: `FREE_LICENSE_ELIGIBLE`
- Durable evidence: `docs/evidence/release/TVE-REL-007-REMOTION.md`

REL-007 remains incomplete only because `WINDOWS_SIGNING_GATE` is still `BLOCKED_EXTERNAL`. `PUBLIC_COMMERCIAL_RELEASE_ALLOWED=false` until a real trusted signing identity/service is configured and the signed candidate verifies with valid Authenticode status.
