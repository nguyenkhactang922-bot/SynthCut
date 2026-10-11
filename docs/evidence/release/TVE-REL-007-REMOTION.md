# TVE-REL-007 — Remotion Commercial Basis Evidence

Status: **PASS**
Date: 2026-10-11
Branch: `chatgpt/phase7-commercial-release`
Dependency: `TVE-REL-006 PASS`

## Input
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md` D-002-5.
- `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`.
- Current official Remotion License FAQ / pricing checked 2026-10-11.
- Product-owner declaration received 2026-10-11: `Tôi xác nhận operator của Tang AI Video Editor có tối đa 3 người và dùng Remotion theo Free License hiện hành.`

## Entry Gate
PASS: REL-006 is already PASS, the product owner supplied the previously missing operator-size/license-basis declaration, and the then-current official Remotion terms were rechecked.

## Work
1. Rechecked current official Remotion licensing terms.
2. Matched the owner's declared operator size (`<=3`) to the Free License eligibility rule.
3. Confirmed the current FAQ allows commercial use and automation for Free-License-eligible users.
4. Recorded only non-secret compliance evidence; no license key, password, private credential, or paid account data is stored.

## Output
`REMOTION_LICENSE_GATE=PASS`

Basis: `FREE_LICENSE_ELIGIBLE`

The owner explicitly declares that the operator of Tang AI Video Editor has no more than 3 people and elects to use Remotion under the current Free License. Current Remotion documentation states that individuals and organizations/teams of up to 3 people are eligible for the Free License, including commercial use and automation.

Official references checked 2026-10-11:
- https://www.remotion.dev/docs/license/pricing
- https://www.remotion.dev/docs/license/faq

## Exit Gate
PASS for the Remotion sub-gate only.

This does **not** make TVE-REL-007 complete because `WINDOWS_SIGNING_GATE` is still blocked until a real trusted Windows signing certificate/service signs the candidate and Authenticode verification passes.

## Artifact
`docs/evidence/release/TVE-REL-007-REMOTION.md`

## Evidence
- Explicit product-owner declaration dated 2026-10-11.
- Current official Remotion pricing/FAQ rechecked 2026-10-11.
- ADR-002 D-002-5 requirement to avoid inferred eligibility is now satisfied by explicit owner evidence.

## Owner / Authority
- Product owner is authoritative for actual operator/team size and chosen license basis.
- Remotion controls the applicable license terms.
- ChatGPT Web/FileMCP-E verifies consistency and records non-secret evidence only.

## Risks / Open Questions
- Eligibility must be revisited if the operator/team grows beyond the current Free License threshold or Remotion terms materially change before a future release.
- This record is not legal advice and does not waive any later license change.
- Windows trusted signing remains unresolved.

## Loopback
- Operator/team grows or Remotion terms change -> reopen only the Remotion license sub-gate / RESEARCH slice as required.
- Signing credential becomes available -> continue only the Windows signing sub-gate of TVE-REL-007.
