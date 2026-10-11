# COMMERCIAL REDISTRIBUTION AUDIT V1

Status: PASS WITH HARD GATES
Date: 2026-10-09
Re-entry trigger: user authorized `B + C` after the previous V1 personal/noncommercial freeze.

## Executive finding
Commercial distribution is technically and legally possible **conditionally**, but the current package/release configuration is not yet fit to publish as the user's commercial fork.

The safe path is:

`GPL commercial distribution + fork-specific identity/update feed + exact source/provenance + Remotion license gate + release-tool security gate + trusted signing for stable commercial release`.

The old personal/noncommercial decision in ADR-001 D-018 is no longer sufficient for the new scope and is superseded for distribution matters by ADR-002.

## Input
- `LICENSE`, `THIRD_PARTY_LICENSES.md`, package manifests and lockfile.
- `apps/desktop/package.json`, Electron main process, bundle staging script and release workflow.
- Existing dependency/security evidence from `TVE-IMP-009`.
- Current upstream/public license documentation checked on 2026-10-09.

## Entry Gate
PASS: commercial distribution was explicitly identified in the old freeze as a License/Security reopening trigger.

## Work
Audit commercial rights/obligations, third-party redistribution boundaries, package identity, update ownership, signing, release automation and known packaging-chain security risk.

## Findings

### F1 — GPL-3.0-or-later permits commercial sale, but not proprietary stripping
**Verdict: PASS WITH OBLIGATIONS.**

GNU GPL guidance permits charging money for GPL software. Distribution of binaries must preserve GPL rights and provide the corresponding source under the applicable GPLv3 terms. A recipient must retain the right to modify and redistribute the GPL-covered program.

Project consequence:
- the fork may be sold or bundled with paid support;
- the distributed covered work remains GPL-3.0-or-later;
- the exact source/tag used for each release must remain obtainable;
- do not add an EULA that removes GPL rights.

Authoritative references:
- https://www.gnu.org/licenses/gpl-3.0.html
- https://www.gnu.org/licenses/gpl-faq.en.html

### F2 — Remotion is a real commercial license boundary
**Verdict: CONDITIONAL / RELEASE GATE.**

The lockfile contains Remotion 4.0.481 and the core imports `@remotion/bundler`, `@remotion/renderer` and `remotion` in the motion-graphics path. Therefore a normal packaged build contains a Remotion-governed runtime dependency path even though Chrome Headless Shell downloads later.

Current Remotion public pricing says individuals and companies up to 3 people can use it commercially under the free license, while companies/collaborations of 4+ require a Company License; automation/video-product use has its own Company License pricing model. The exact current terms must control at release time.

Project consequence: before publishing a binary that contains Remotion, record one explicit basis:
- `FREE_LICENSE_ELIGIBLE`, or
- `PAID_COMPANY_OR_ENTERPRISE_LICENSE`, or
- `REMOTION_EXCLUDED_FROM_RELEASE_BUILD` proven by dependency/package audit.

Reference:
- https://www.remotion.dev/docs/license/pricing

### F3 — Bundled FFmpeg provenance is not release-grade yet
**Verdict: FAIL FOR COMMERCIAL_READY UNTIL HARDENED.**

The release workflow currently runs `choco install ffmpeg -y` without a pinned package/build version. `prepare-bundle.ts` then copies whatever `ffmpeg.exe` and `ffprobe.exe` resolve on PATH. That is adequate for development convenience but weak release provenance because the exact redistributed GPL binary can change over time.

Project consequence:
- capture exact FFmpeg version/build/package source in the bundle manifest;
- pin or otherwise deterministically select the release build;
- provide the corresponding-source path for that exact redistributed binary;
- include the provenance record in release evidence.

### F4 — Current packaged identity points at upstream Relo
**Verdict: FAIL / MUST REBRAND FOR FORK RELEASE.**

`apps/desktop/package.json` currently contains:
- `appId = com.relo.synthcut`;
- `productName = SynthCut by Relo`;
- GitHub publish owner `Relo-video`;
- copyright `Relo`;
- installer shortcut/uninstall identity `SynthCut by Relo`.

`apps/desktop/electron/main.cjs` repeats the Relo display name and AppUserModelID and the updater dialog names SynthCut.

Publishing this unchanged from the user's fork would produce identity/update ambiguity and could direct updater metadata at the upstream project.

Required direction:
- fork identity `Tang AI Video Editor`;
- distinct app id / AppUserModelID;
- publish provider owner `nguyenkhactang922-bot`, repo `SynthCut`;
- preserve upstream copyright/license/provenance notices separately.

### F5 — Fork release repository is ready as a source host
**Verdict: PASS.**

GitHub inspection on 2026-10-09:
- repository: `nguyenkhactang922-bot/SynthCut`;
- visibility: PUBLIC;
- fork of `Relo-video/SynthCut`;
- default branch: `main`;
- current release list: empty.

This is suitable as the source/release host once the release gates pass.

### F6 — Existing updater/release workflow must be fork-hardened
**Verdict: PARTIAL.**

Strengths:
- NSIS + ZIP already configured;
- release workflow builds artifacts and includes `.blockmap`, `latest.yml` and SHA256 checksums;
- tag publication is explicit in the GitHub workflow.

Gaps:
- package publish metadata points to upstream;
- docs still describe upstream identity;
- no commercial source-compliance manifest is emitted;
- stable commercial release signing is not enforced;
- release workflow stages an unpinned FFmpeg package.

### F7 — Trusted code signing is a commercial-quality gate
**Verdict: EXTERNAL CREDENTIAL GATE.**

Current builds can be unsigned. electron-builder supports Windows Authenticode signing when credentials are configured. For a stable commercial release, require a trusted signing path rather than silently shipping unsigned.

Accepted implementation families:
- OV/EV certificate / HSM-backed signing;
- Azure Trusted Signing;
- an approved trustworthy OSS signing service if its terms fit the fork.

Self-signed certificates are test-only.

Reference:
- https://www.electron.build/v26/docs/features/code-signing/code-signing-win/

### F8 — Release-tool dependency security must be reopened
**Verdict: REQUIRED.**

`TVE-IMP-009` proved production runtime audit = 0 but intentionally carried 11 high + 1 critical findings in the Electron packaging/dev chain. That was acceptable under the old frozen implementation scope, but packaging is now the active production surface. Therefore release hardening must rerun the packaging-chain audit and remediate/upgrade where practical before stable commercial release.

This does **not** reopen completed runtime implementation tasks; it is a Phase-7 release-tool concern.

### F9 — NPM publication under the upstream namespace is not authorized
**Verdict: OUT OF SCOPE.**

`packages/skill-installer/package.json` is named `@relo-video/synthcut`. The new authorization covers GitHub Releases of the user's fork, not publishing into the upstream `@relo-video` npm namespace. Do not attempt npm publication under that name.

## Exit Gate
PASS WITH HARD GATES because the commercial path and blockers are now explicit and actionable. No public commercial binary is authorized until the queue closes the license/provenance/security/identity gates.

## Artifact
`docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`

## Evidence
- local repository/configuration evidence listed above;
- current GNU GPL documentation;
- current Remotion license/pricing documentation;
- current electron-builder signing/publish documentation;
- GitHub fork metadata.

## Owner / Authority
ChatGPT Web owns the audit judgment. Product owner chooses the commercial operating model and supplies external licensing/signing authority where required.

## Risks / Open Questions
- Remotion commercial eligibility/license basis is not yet recorded.
- Trusted signing credentials/service are not yet configured.
- Exact FFmpeg release provenance is not pinned yet.
- Upstream icon/artwork/trademark presentation still needs a release-brand audit while license/provenance notices remain preserved.

## Loopback
- New third-party license fact -> rerun only License/Security audit.
- Packaging dependency change -> Phase-7 package-security task.
- Branding/channel change -> commercial release DEFINE/ADR.
- Product runtime contradiction -> owning IMP task only.
