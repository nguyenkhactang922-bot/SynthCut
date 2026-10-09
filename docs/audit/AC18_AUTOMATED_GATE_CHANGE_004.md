# AC-18 AUTOMATED VI-STT GATE CHANGE AUDIT 004

Status: PASS — REQUIREMENT CHANGE RECONCILED; AUTOMATED VALIDATION PASS
Date: 2026-10-07
Lifecycle rollback point: DEFINE / Acceptance Criteria, then DESIGN ADR reconciliation
Implementation authorization: `IMPLEMENTATION_ALLOWED=false`

## Input
- Existing AC-18 requiring mandatory human-reviewed Vietnamese transcript/boundaries/cut audition before DESIGN Freeze.
- Existing `small` and `large-v3-turbo` Vietnamese FLEURS benchmark evidence.
- Existing 20-sample cut-boundary pack.
- Explicit product-owner approval to replace mandatory human review with independent automated validation; human listening becomes optional spot-check QA.

## Entry Gate
- DISCOVER/DEFINE/RESEARCH prior evidence remains valid.
- No production implementation is authorized.
- Existing model benchmark artifacts are present and complete.
- Requirement change is explicit; it is not a silent waiver.

## Work
1. Amend AC-18 in the product brief/definition.
2. Amend ADR D-010 and add ADR A-005.
3. Reconcile living design Vietnamese STT policy and pre-freeze gate.
4. Retain historical human-review pack/evidence as optional QA; do not fabricate human review.
5. Run one deterministic automated validator over existing benchmark + boundary artifacts without rerunning model inference.

## Output
Revised AC-18 automated gate:
- >=10 minutes reference-backed Vietnamese speech;
- multilingual Whisper only; explicit `language=vi`;
- normalized WER <=20%;
- deterministic frozen rare/key-token recall >=75%;
- p95 utterance-end timing error <=1.5 s;
- timing samples finite/in-range and raw token timing structurally valid;
- 20/20 deterministic cut-boundary samples resolve fail-closed under >=120 ms retained guard on each side when a cut is performed; insufficient gaps become NOOP/review-needed rather than forced unsafe cuts;
- throughput and peak memory recorded;
- human listening is optional spot-check QA, not a DESIGN Freeze prerequisite.

## Exit Gate
PASS only if the deterministic automated validator produces a durable PASS artifact satisfying every revised AC-18 item. Otherwise VI-STT remains FAIL/BLOCKED and only the failed automated gate may be repaired/re-run.

## Artifact
- `docs/audit/AC18_AUTOMATED_GATE_CHANGE_004.md`
- planned validator: `.spike-temp/vi-stt/validate-automated-vi-stt.mjs`
- planned result: `.spike-temp/vi-stt/automated-validation.json`

## Evidence
Retained, not rerun:
- `.spike-temp/vi-stt/results/small-utterance/benchmark-result.json`
- `.spike-temp/vi-stt/results/large-v3-turbo-utterance/benchmark-result.json`
- `.spike-temp/vi-stt/human-review-pack/cut_audition_review.tsv`
- `docs/evidence/spikes/TVE-SPIKE-VI-STT.md`

## Owner / Authority
Product owner explicitly approved replacing mandatory human review with automated validation and optional human spot-check. Architecture/process authority remains the canonical lifecycle and ADR.

## Risks / Open Questions
- Automated validation does not prove subjective listening quality; production preview/audio QA remains required.
- Rare/key-token recall is a deterministic diagnostic over a difficult frozen set, not a semantic-quality guarantee.
- Utterance-end timing is a locator-quality metric; production cuts must still use the fail-closed breathing-room resolver rather than raw timestamps directly.

## Loopback
- Validator FAIL -> remain in DESIGN; repair only the failed validation/policy item, preserving previous PASS evidence.
- Validator PASS -> reconcile VI-STT evidence -> execute narrow `TVE-FRZ-001` Freeze audit.
- Contradictory later audio evidence -> reopen DEFINE/ADR/VI-STT rather than silently weakening the frozen requirement.
