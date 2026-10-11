# COMMERCIAL RELEASE SCOPE V1

Status: FROZEN SCOPE AMENDMENT
Date: 2026-10-09
Authorization: user selected `B + C`
Baseline retained: `personal/main@af92f20` remains MAIN VERIFIED for the prior V1 Build & Verify scope.

## Decision
The project is authorized to enter a new release/commercial-distribution lane with both goals:

1. **B — Fork GitHub Release:** build Windows NSIS installer + ZIP and publish through the user's public fork `nguyenkhactang922-bot/SynthCut`, including updater metadata required by `electron-updater`.
2. **C — Commercial-distribution hardening:** make the distributable fork suitable for commercial sale/support without pretending it is proprietary or ignoring upstream/third-party obligations.

This scope change does not invalidate prior implementation evidence. It reopens only the lifecycle gates affected by the new distribution/commercial requirement.

## Input
- MAIN VERIFIED baseline `personal/main@af92f20`.
- Existing GPL-3.0-or-later repository and third-party license inventory.
- Existing Windows electron-builder NSIS + ZIP packaging path.
- Existing GitHub Release workflow and updater path.
- User authorization `B + C`.

## Entry Gate
PASS:
- prior Build & Verify is MAIN VERIFIED;
- fork exists and is public;
- no fork release has yet been published;
- commercial redistribution was explicitly out of the old freeze, so a scoped re-entry is required rather than silent packaging.

## Work
Define the exact release/commercial boundary before packaging or publication.

## Output / Authorized release profile
- **Product identity:** `Tang AI Video Editor` on the SynthCut GPL base.
- **Platform:** Windows desktop only for this release lane.
- **Artifacts:** NSIS installer + ZIP + SHA256SUMS + updater metadata (`latest.yml`, `.blockmap`) where applicable.
- **Release host:** GitHub Releases on `nguyenkhactang922-bot/SynthCut` only.
- **Source host:** the same public fork/tag must expose the complete corresponding project source used to build each released binary.
- **License:** remain `GPL-3.0-or-later`; commercial charging/support is allowed only while recipient GPL rights and source-access obligations are preserved.
- **Updater:** fork builds update from the user's fork, never from `Relo-video/SynthCut`.
- **Brand separation:** fork package identity must not impersonate the upstream Relo product identity. Upstream copyright/license/provenance notices remain preserved.
- **Version lane:** first fork commercial release series targets `1.1.0`; candidate validation may use prerelease versions before the stable tag.
- **NPM:** publishing the upstream-owned `@relo-video/synthcut` package name is out of scope unless separately authorized and renamed.
- **macOS/Linux:** out of scope for this release lane.

## Commercial hard gates
A public binary may not be called `COMMERCIAL_READY` until all applicable gates pass:

1. **GPL/source gate:** exact release source/tag and license notices are public and traceable to the binary.
2. **FFmpeg source/provenance gate:** the exact bundled FFmpeg build/version/source provenance is captured and a corresponding-source path is provided.
3. **Remotion gate:** one of the following is recorded before redistribution of a build containing Remotion:
   - eligibility under the current free Remotion terms; or
   - a valid paid/company/enterprise Remotion license basis; or
   - a release build that demonstrably excludes Remotion and its governed runtime packages.
4. **Packaging-security gate:** release tooling security findings are re-audited/remediated or explicitly resolved with evidence.
5. **Brand/update gate:** product name, app id, installer strings and update feed point to the fork identity.
6. **Publisher trust / unsigned-distribution gate:** trusted Windows code signing remains the preferred future path, but the product owner explicitly authorizes an unsigned commercial release for the current lane. Before publication, release evidence must record that the installer/app are intentionally `NotSigned`, that Windows may display `Unknown publisher` / Microsoft Defender SmartScreen warnings, and that this risk is accepted rather than misrepresented as signed/trusted. Supabase entitlement licensing does not replace Authenticode.
7. **Runtime package gate:** packaged installer/ZIP smoke, install/launch, bundled-resource, updater and artifact-integrity checks pass.

## Exit Gate
PASS when this scope is reflected in RESEARCH/ADR/Phase-7 task planning and no release action is permitted to bypass the commercial hard gates.

## Artifact
`docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`

## Evidence
- Repo package/release configuration.
- GPL v3 and GNU GPL FAQ commercial-distribution guidance.
- Current Remotion license/pricing documentation.
- electron-builder Windows signing/publishing documentation.
- Existing project MAIN verification evidence.

## Owner / Authority
- Product scope: user.
- Lifecycle/technical interpretation and verification: ChatGPT Web.
- Legal/license facts cannot be waived by implementation convenience.

## Risks / Open Questions
- Remotion eligibility/license basis is an external commercial fact that must be recorded before distributing a Remotion-containing commercial build.
- Trusted Windows signing requires an external signing identity/service/credential.
- Upstream artwork/trademark identity must not be presented as if this fork were an official Relo release.

## Loopback
- License contradiction -> RESEARCH / License-Security Audit.
- Product identity/channel change -> DEFINE release scope.
- Packaging/runtime failure -> only the owning Phase-7 task.
- Product-code contradiction -> owning IMP task; prior MAIN VERIFIED evidence is otherwise retained.
