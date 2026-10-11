# Windows Commercial Signing — SSL.com IV + eSigner

Status: **OPTIONAL FUTURE HARDENING / DEFERRED BY OWNER**
Date: 2026-10-11
Owner: Tang AI Video Editor product owner

## Selected path
If the owner later enables a trusted-signed lane, the prepared option is **SSL.com Individual Validated (IV) Code Signing + eSigner Cloud Signing**. The current public commercial lane remains intentionally unsigned and does not depend on this provider.

Why this path:
- supports an individual publisher without requiring business registration;
- uses cloud HSM-backed signing suitable for GitHub Actions;
- avoids committing or exporting a private signing key into the repository;
- works with the existing electron-builder v26 Windows packaging path;
- permits a deterministic publisher identity to be verified by Authenticode and electron-updater.

Current official references checked 2026-10-11:
- https://www.ssl.com/products/software-integrity/code-signing/iv/
- https://www.ssl.com/products/software-integrity/signing-service/
- https://www.ssl.com/how-to/how-to-integrate-esigner-cka-with-ci-cd-tools-for-automated-code-signing/
- https://www.electron.build/v26/docs/features/code-signing/code-signing-win/

## Current external purchase/validation facts
At the time of selection, SSL.com lists:
- IV Code Signing: USD 129/year for a one-year certificate;
- eSigner Tier 1: USD 15/month for 240 signings, with the first 30 days of eSigner included for new certificates;
- standard identity validation typically takes 3–5 business days after the required identity/account information is complete.

Prices and validation rules are external and must be rechecked before payment.

## External owner actions required
These actions require the publisher's own payment and identity authority and cannot be completed by repository automation:
1. Create/use an SSL.com account owned by the publisher.
2. Purchase **IV Code Signing** and select **eSigner Cloud Signing**.
3. Complete SSL.com's individual identity validation.
4. Activate eSigner and configure its authenticator/TOTP credential.
5. Record the exact certificate simple/common name shown by the issued code-signing certificate.

Do not place identity documents, payment information, passwords, TOTP seeds, private keys, or screenshots containing secrets in the repository.

## GitHub repository configuration
Already set:
- `REMOTION_COMMERCIAL_BASIS_APPROVED=true`
- `WINDOWS_SIGNING_PROVIDER=deferred`
- `WINDOWS_SIGNING_APPROVED=false`

When the owner explicitly re-enables the optional signed lane, set `WINDOWS_SIGNING_PROVIDER=sslcom-esigner` only after the provider credentials/certificate are actually available.

After issuance, configure these GitHub Actions secrets out-of-band:
- `ESIGNER_USERNAME`
- `ESIGNER_PASSWORD`
- `ESIGNER_TOTP_SECRET`

Configure this non-secret GitHub Actions variable from the issued certificate:
- `WINDOWS_SIGN_PUBLISHER_NAME=<exact certificate simple/common name>`

Only after the eSigner account/certificate can actually be loaded by CI, set:
- `WINDOWS_SIGNING_APPROVED=true`

## Repository implementation
`.github/workflows/release.yml` is prepared to:
1. fail closed on a release tag unless Remotion/signing approval and provider variables are correct;
2. download the pinned SSL.com eSigner CKA installer;
3. verify its SHA-256 before installation;
4. configure eSigner CKA from GitHub Secrets;
5. load the code-signing certificate into the Windows CurrentUser certificate store;
6. require exactly one code-signing certificate matching `WINDOWS_SIGN_PUBLISHER_NAME`;
7. export its SHA-1 thumbprint only as ephemeral CI environment state;
8. run `npm run dist:commercial --workspace apps/desktop` (the script itself enforces `--publish never`);
9. use `apps/desktop/electron-builder.commercial.cjs` with `forceCodeSigning=true`, SHA-256 signing and SSL.com's RFC3161 timestamp server;
10. verify the installer and packaged application executable have `Authenticode Status=Valid`, the expected publisher, and a timestamp before publication can run.

Pinned eSigner CKA artifact:
- release: `v1.1.2`
- installer: `SSL.COM.eSigner.CKA_1.1.2_build_202600624.exe`
- SHA-256: `3f088403139505ddfb0ed3b56b72893f92c865f98b382753a1e1c695a5cece35`

Local verification on 2026-10-11:
- downloaded from the official `SSLcom/eSignerCKA` GitHub release;
- SHA-256 matched the pinned value;
- installer Authenticode status: `Valid`;
- installer signer: `SSL Corp`.

## Exit gate
`WINDOWS_SIGNING_GATE=PASS` only after a real release candidate built with the issued certificate satisfies all of:
- installer Authenticode `Valid`;
- packaged application executable Authenticode `Valid`;
- signer simple/common name equals `WINDOWS_SIGN_PUBLISHER_NAME`;
- RFC3161 timestamp present;
- artifact validator/provenance checks remain PASS.

This gate is required only for the optional signed lane. The owner-approved unsigned commercial lane uses its separate Remotion + Supabase + unsigned-risk acceptance gates and must verify Authenticode status exactly `NotSigned`.
