# ADR-002 — Commercial Release & Distribution Boundary

Status: ACCEPTED
Date: 2026-10-09
Supersedes for distribution scope: ADR-001 D-018 (`personal/noncommercial` only)
Does not supersede: the frozen editor/runtime architecture and MAIN VERIFIED evidence.

## Context
The user explicitly selected both:
- **B:** publish Windows artifacts through GitHub Releases on the personal fork; and
- **C:** prepare the project for commercial distribution.

The old frozen architecture deliberately excluded commercial redistribution and required a license-review re-entry if that goal changed. That trigger is now active.

## Decision

### D-002-1 — License model stays GPL-3.0-or-later
The fork may be sold commercially, but the covered distributed program remains GPL-3.0-or-later. Commercial value may come from distribution, support, services, integrations and other lawful offerings; the release must not remove recipient GPL rights.

### D-002-2 — Fork identity is separate from upstream identity
The distributed product identity will be **Tang AI Video Editor** while preserving upstream license/copyright/provenance notices.

The fork must use its own:
- product display name;
- Windows AppUserModelID/app id;
- installer shortcut/uninstall identity;
- GitHub update feed owner/repository.

It must not present itself as an official `Relo-video` release.

### D-002-3 — Release host and updater authority
Canonical release host: `nguyenkhactang922-bot/SynthCut` GitHub Releases.

The packaged `electron-updater` feed must resolve to that fork. The upstream `Relo-video/SynthCut` release feed is not an authorized update source for fork builds.

### D-002-4 — Windows release lane only
Phase 7 targets:
- NSIS installer;
- ZIP archive;
- updater metadata (`latest.yml`, `.blockmap`) where applicable;
- SHA256SUMS;
- source/provenance/license evidence.

macOS/Linux release packaging is not part of this lane.

### D-002-5 — Remotion is a fail-closed commercial gate
A public binary containing the Remotion dependency path may be released only when one explicit license basis is recorded:
- `FREE_LICENSE_ELIGIBLE` under then-current terms;
- `PAID_COMPANY_OR_ENTERPRISE_LICENSE`; or
- `REMOTION_EXCLUDED_FROM_RELEASE_BUILD`, verified by package/dependency evidence.

No agent may infer company size or license eligibility from chat style or repository ownership.

### D-002-6 — FFmpeg redistribution becomes deterministic and traceable
The release pipeline must not silently bundle an arbitrary FFmpeg found on PATH. The exact build/version/source provenance must be captured, and the release evidence must identify the corresponding-source route for the redistributed binary.

### D-002-7 — Stable commercial release requires trusted Windows signing
Unsigned builds are permitted only for local/CI package validation. A stable release labeled `COMMERCIAL_READY` requires a trusted code-signing path and verification of the resulting Authenticode signature.

The signing implementation may be OV/EV, Azure Trusted Signing, or another acceptable trusted service. Secrets/credentials must never be committed.

### D-002-8 — Release-tool security is in scope
The packaging/dev dependency findings previously carried by TVE-IMP-009 must be re-audited because Phase 7 now executes that toolchain in a production release role. Remediate or upgrade release tooling with risk-based verification before stable release.

### D-002-9 — No upstream npm namespace publication
Do not publish `@relo-video/synthcut` from this fork. Any future npm distribution requires a separately authorized fork-owned package identity.

### D-002-10 — Version line
The first fork commercial release line targets `1.1.0`. Pre-release candidates may use semver prerelease identifiers. A release tag must match the app version and point to a reviewed release commit.

## Alternatives considered

### A — Publish current package unchanged
Rejected. It keeps upstream Relo branding/update ownership and lacks commercial license/signing/provenance gates.

### B — Convert to proprietary/closed source
Rejected for this lane. The SynthCut-derived covered work is GPL-3.0-or-later and distribution must preserve the applicable GPL rights/obligations.

### C — Immediately remove Remotion
Deferred. The existing Remotion provider is isolated and may be commercially usable under a valid license basis. A replacement/removal path is required only if the chosen commercial operator cannot or will not satisfy Remotion terms.

### D — Publish binaries before signing and call them commercial-ready
Rejected. Unsigned artifacts can be used as test/RC evidence, but the stable commercial-ready verdict is gated on trusted signing.

## Consequences
Positive:
- fork releases cannot accidentally update from upstream;
- commercial distribution remains legally/operationally traceable;
- previous runtime architecture stays intact;
- release blockers become explicit rather than hidden.

Costs:
- release metadata/branding must change;
- package toolchain and bundled FFmpeg provenance must be hardened;
- stable release needs an external signing identity/service;
- Remotion eligibility/license basis must be recorded.

## Ten-field stage contract

### Input
Commercial scope amendment, audit evidence, MAIN VERIFIED baseline.

### Entry Gate
Commercial audit PASS WITH HARD GATES.

### Work
Choose the release identity, license boundary, update authority, provenance and signing policy.

### Output
This accepted ADR and the Phase-7 release plan.

### Exit Gate
No unresolved architecture contradiction; all remaining unknowns are represented as explicit release tasks/gates.

### Artifact
`docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`

### Evidence
Commercial redistribution audit + repository configuration + current upstream license/signing documentation.

### Owner / Authority
Product owner authorizes distribution intent; ChatGPT Web owns architecture/verification; third-party license issuers and signing providers control their external permissions.

### Risks / Open Questions
Remotion basis, signing authority, exact branded visual assets, and FFmpeg provenance remain task-level gates.

### Loopback
License contradiction -> RESEARCH. Identity/channel change -> DEFINE. Runtime defect -> owning IMP. Packaging defect -> Phase 7.
