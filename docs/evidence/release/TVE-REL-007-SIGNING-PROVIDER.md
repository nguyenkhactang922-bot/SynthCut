# TVE-REL-007 — Windows Signing Provider Preparation Evidence

Status: **PARTIAL PASS — PROVIDER/REPOSITORY INTEGRATION PREPARED; EXTERNAL ISSUANCE PENDING**
Date: 2026-10-11
Branch: `chatgpt/phase7-commercial-release`
Dependency: `REMOTION_LICENSE_GATE=PASS`, `TVE-REL-006 PASS`

## Input
- Current release workflow and electron-builder v26 package configuration.
- Current official Microsoft, electron-builder, SSL.com and SignPath documentation checked 2026-10-11.
- Public fork metadata/release state from `nguyenkhactang922-bot/SynthCut`.

## Decision
Selected first-release signing path: **SSL.com IV Code Signing + eSigner Cloud Signing**.

Rationale:
- supports an individual publisher without business registration;
- eSigner is cloud-HSM backed and integrates with GitHub Actions;
- avoids repository/private-key persistence;
- can drive the existing Windows/electron-builder v26 path;
- does not depend on Azure Artifact Signing individual geographic eligibility;
- SignPath Foundation free OSS signing was not selected for the current gate because the fork currently has no GitHub Releases and the Foundation conditions require an OSS project to already be released in the form to be signed.

## Work completed
1. Added `apps/desktop/electron-builder.commercial.cjs`.
2. Added `dist:commercial` desktop script.
3. Reworked `.github/workflows/release.yml` to use a fail-closed SSL.com eSigner release-tag path.
4. Pinned eSigner CKA `v1.1.2` installer and SHA-256.
5. Added eSigner secret/publisher checks and certificate-store selection.
6. Added `forceCodeSigning=true`, SHA-256 signing and RFC3161 timestamp configuration.
7. Added final Authenticode/publisher/timestamp verification for the NSIS installer and packaged app executable.
8. Hardened `scripts/release/validate-release.mjs` so the signing/provider wiring is part of release validation.
9. Configured GitHub repository variables:
   - `REMOTION_COMMERCIAL_BASIS_APPROVED=true`
   - `WINDOWS_SIGNING_PROVIDER=sslcom-esigner`
   - `WINDOWS_SIGNING_APPROVED=false`
10. Wrote operator runbook `docs/release/WINDOWS_SIGNING_SSL_COM.md`.

## Verification
- `node scripts/release/validate-release.mjs` -> PASS / exit 0.
- Commercial config positive static load with dummy thumbprint/publisher -> `COMMERCIAL_SIGNING_CONFIG_PASS` / exit 0.
- Commercial config missing-credential negative test -> `COMMERCIAL_SIGNING_CONFIG_FAIL_CLOSED_PASS` / exit 0.
- `.github/workflows/release.yml` parsed successfully with PyYAML -> `RELEASE_YAML_PARSE_PASS` / exit 0.
- Official eSigner CKA installer download verification:
  - version `v1.1.2`;
  - SHA-256 `3f088403139505ddfb0ed3b56b72893f92c865f98b382753a1e1c695a5cece35` -> MATCH;
  - Authenticode status -> `Valid`;
  - signer certificate subject includes `CN=SSL Corp`.
- GitHub variable readback confirmed Remotion=true, provider=sslcom-esigner, signing-approved=false.

## External blocker still present
The repository cannot create or purchase a publicly trusted publisher identity. The following require the product owner's own payment and identity authority:
- SSL.com account/order;
- IV certificate purchase;
- identity validation;
- eSigner activation/authenticator setup;
- resulting account credentials/TOTP and issued certificate publisher name.

No certificate/account secrets exist yet, therefore no real signed candidate was built and `WINDOWS_SIGNING_GATE=PASS` is **not** claimed.

## Exit Gate
Repository/provider integration: **PASS**.
External certificate/service acquisition: **BLOCKED_EXTERNAL**.
Overall `TVE-REL-007`: **PARTIAL PASS / BLOCKED_EXTERNAL**.

## Next Exact Action
Product owner completes SSL.com IV + eSigner purchase/identity issuance. Then configure GitHub secrets `ESIGNER_USERNAME`, `ESIGNER_PASSWORD`, `ESIGNER_TOTP_SECRET`, set `WINDOWS_SIGN_PUBLISHER_NAME`, change `WINDOWS_SIGNING_APPROVED=true`, and run only the REL-007 signed-candidate path. Do not repeat REL-006 or Remotion.
