# TVE-SPIKE-VI-STT — Vietnamese transcription/edit timing evidence

Status: PASS FOR SPIKE HYPOTHESIS — REVISED AUTOMATED AC-18
Date: 2026-10-07
Lifecycle: Phase 4 DESIGN POC only. `IMPLEMENTATION_ALLOWED=false` until Freeze + Phase 5 PASS.

## Requirement-change provenance
The original pre-spike gate required mandatory human-reviewed transcript/boundaries and >=19/20 human cut auditions. On 2026-10-07 the product owner explicitly approved replacing that mandatory DESIGN prerequisite with independent automated validation; human listening remains optional spot-check QA.

The requirement change was applied through DEFINE and ADR before the new validator ran:
- `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md` AC-18;
- `docs/define/PRODUCT_DEFINITION_V1.md` §5A;
- `docs/adr/ADR-001_BASE_ARCHITECTURE.md` D-010 + Amendment A-005;
- `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md` §11 / §23 / §25 / §27.4;
- `docs/audit/AC18_AUTOMATED_GATE_CHANGE_004.md`.

Historical human-review artifacts are retained as optional QA evidence and are not fabricated or relabeled as human-reviewed.

## Revised fixed automated gate
Before execution, AC-18 was fixed as:
- >=10 minutes reference-backed Vietnamese speech;
- multilingual Whisper only with explicit `language=vi`;
- normalized WER <=20%;
- deterministic frozen rare/key-token recall >=75%;
- p95 utterance-end timing error <=1.5 s;
- sampled timing finite/in-range and raw segment timing structurally valid;
- 20/20 deterministic cut-boundary samples resolve fail-closed under a breathing-room policy retaining >=120 ms guard on each side when a cut is performed;
- insufficient gaps return NOOP/review-needed rather than forcing an unsafe cut;
- throughput and peak memory recorded.

Human listening is optional spot-check QA, not a DESIGN Freeze prerequisite.

## Objective benchmark source
Corpus: Vietnamese FLEURS test material, documented in `docs/research/VI_STT_GOLD_FIXTURE_SOURCE_NOTE.md`.

Retained benchmark subset:
- 51 Vietnamese utterances;
- 639.96 seconds speech;
- utterance-independent inference protocol;
- explicit `language=vi`;
- 8 logical threads;
- deterministic 100-item rare/key-token set frozen before inference;
- 20 timing samples frozen before inference.

No model inference was rerun for the revised acceptance change.

## Invalidated historical protocol
A concatenated whole-stream attempt caused context carry/repetition across unrelated FLEURS utterances. That attempt remains invalidated and is not used. The accepted protocol processes utterances independently while loading the model once.

## Candidate comparison retained
### `small` multilingual
Evidence: `.spike-temp/vi-stt/results/small-utterance/benchmark-result.json`
- WER: `0.2134146341` — FAIL vs <=0.20;
- rare/key-token recall: `0.63`;
- timing p95: `1.56 s`;
- throughput: `1.321x` realtime audio;
- peak working set: `817,381,376` bytes.

Verdict: rejected as default Vietnamese edit-grade model because it fails the WER gate.

### `large-v3-turbo` multilingual
Evidence: `.spike-temp/vi-stt/results/large-v3-turbo-utterance/benchmark-result.json`
- WER: `0.0941734417` — PASS;
- deterministic rare/key-token recall: `0.79` — PASS vs revised >=0.75;
- utterance-end timing p95: `1.12 s` — PASS vs <=1.5 s;
- throughput: `0.419x` realtime audio;
- peak working set: `1,916,551,168` bytes.

Verdict: accepted frozen-candidate default Vietnamese edit-grade model for v1. A faster draft tier is not frozen because `small` fails the lexical gate.

## Automated cut/timing safety validator
Validator: `.spike-temp/vi-stt/validate-automated-vi-stt.mjs`
Result: `.spike-temp/vi-stt/automated-validation.json`
Model inference rerun: `false`
Process exit code: `0`
Result marker: `VI_STT_AUTOMATED_VALIDATION status=PASS`

Measured result:
- speech duration: `639.96 s`;
- WER: `0.09417344173441734`;
- rare/key-token recall: `0.79`;
- p95 utterance-end timing error: `1.120000000000001 s`;
- timing violations: `0`;
- boundary samples: `20`;
- cut samples: `20`;
- safely resolved: `20/20`;
- `SAFE_CUT`: `13`;
- `SAFE_NOOP`: `7`;
- throughput: `0.4192299705x` realtime;
- peak working set: `1,916,551,168` bytes.

Every automated gate in `automated-validation.json` is `true`:
- `speechDurationPass`;
- `multilingualExplicitViPass`;
- `werPass`;
- `rareKeyRecallPass`;
- `boundaryP95Pass`;
- `throughputMemoryRecordedPass`;
- `boundarySampleIntegrity`;
- `timingStructurePass`;
- `cutSafetyPass`.

The 7 zero/too-small gaps are not forced into artificial edits; they resolve as `SAFE_NOOP`, which is the required fail-closed behavior.

## Historical optional human-review pack
Location: `.spike-temp/vi-stt/human-review-pack/`

It remains available for optional product listening/spot-check:
- 20 coverage WAVs;
- 20 context WAVs;
- 20 cut-preview WAVs;
- review TSV files;
- `PACK_READY` marker.

At the last direct check the TSVs were `0/20` reviewed. That is not a blocker under revised AC-18 and must never be described as human-reviewed evidence.

## Final spike verdict
`TVE-SPIKE-VI-STT = PASS FOR SPIKE HYPOTHESIS` under the explicitly revised AC-18.

Architecture implications to reconcile/freeze:
1. default Vietnamese edit-grade model: multilingual `large-v3-turbo` with explicit `language=vi`;
2. `small` is not accepted as the default due to WER failure;
3. transcript timestamps are navigation/edit evidence, not sole truth;
4. automatic removal uses >=120 ms guard each side and fails closed to NOOP/review-needed when insufficient gap exists;
5. final production edits still require rendered audio/preview QA under the general QA loop;
6. human listening is optional spot-check and can reopen the policy if contradictory evidence appears.

## Do not repeat
- FLEURS acquisition/subset construction;
- scoring-set generation;
- `small` benchmark;
- `large-v3-turbo` benchmark;
- automated validator unless inputs/protocol/acceptance materially change;
- human-review pack generation unless its optional QA protocol changes.
