# Vietnamese STT reference-source note

Date: 2026-10-07
Status: VALIDATED FOR OBJECTIVE ASR BENCHMARK; NOT SUFFICIENT FOR HUMAN EDIT-AUDITION GOLD

Candidate corpus: `FluidInference/fleurs-full`, Vietnamese `vi_vn` test data extracted from Google FLEURS.

Why retained:
- real human speech recordings;
- benchmark/reference transcriptions supplied with the dataset;
- Vietnamese language directory contains 857 samples;
- upstream page states source is Google FLEURS test split;
- license shown as CC-BY-4.0;
- directory format exposes `{lang_code}.trans.txt` plus 16 kHz mono WAV files.

Local bounded benchmark subset:
- 51 utterances;
- 639.96 seconds of Vietnamese speech;
- objective utterance-independent ASR comparison completed for multilingual `small` and `large-v3-turbo` with explicit `language=vi`.

FLEURS is accepted as objective lexical ASR benchmark evidence for this DESIGN spike. It is **not** treated as sufficient proof of the project-specific human-reviewed long-form edit-boundary/cut-audition gate.

A separate continuous Vietnamese review pack now exists at `.spike-temp/vi-stt/human-review-pack/` so a human can review >=10 minutes of transcript and audition 20 candidate cuts. Until that review is completed, `TVE-SPIKE-VI-STT` remains BLOCKED and this note must not be cited as human-audition PASS.
