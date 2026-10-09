# TVE-IMP-008 — Vietnamese STT policy + fail-closed transcript-cut resolver

Status: PASS / VERIFIED BEFORE COMMIT
Date: 2026-10-09
Branch: `chatgpt/ai-video-editor-design`
Task input HEAD: `5afbb8f` (`TVE-IMP-008` already CLAIMED)

## Input
- frozen AC-18 and Freeze record;
- `docs/evidence/spikes/TVE-SPIKE-VI-STT.md` retained benchmark evidence;
- existing production Whisper/transcript-edit paths;
- frozen `.spike-temp/vi-stt/human-review-pack` audio/cut fixtures.

## Entry Gate
- DESIGN/FREEZE: PASS;
- PLAN IMPLEMENTATION: PASS;
- TVE-IMP-006: committed `52039c5`;
- TVE-IMP-007 serialized UI lane: committed `7741f69`;
- no active prior SynthCut process at resume.

## Work
Productionized the frozen Vietnamese policy without rerunning model inference:
- added `packages/core/src/whisper/policy.ts`;
- Vietnamese language aliases canonicalize to explicit `vi`;
- Vietnamese edit-grade model is fixed to multilingual `large-v3-turbo`;
- incompatible Vietnamese model overrides (including `small`/`.en`) fail closed;
- whole-asset transcript indexing and caption generation resolve model/language through the policy;
- `tighten_talk` can explicitly request `language=vi` for auto-indexing;
- Vietnamese transcript deletion/tightening applies a 120 ms per-side guard;
- insufficient guard returns SAFE_NOOP / `reviewNeeded` rather than forcing a cut;
- Vietnamese guarded removals disable later `padFrames` expansion so the retained breathing room cannot be consumed.

## Output
Deterministic production Vietnamese STT/edit-cut policy integrated into the authoritative core/RPC path; no parallel timeline or alternate mutation engine introduced.

## Exit Gate / results
PASS.

### Build/type gates
- `npm run build --workspace @aive/core`: PASS / exit 0.
- root `npm run typecheck` (core + MCP + desktop): PASS / exit 0.
- task-scope `git diff --check`: PASS / exit 0 (Git emitted only existing LF→CRLF working-copy warnings for `engine.ts`/`rpc.ts`; no whitespace errors).

### Production policy smoke
Command used the retained project-local FFmpeg/FFprobe copies only for preview QA and did **not** rerun Whisper inference.
Result marker: `TVE-IMP-008 VI POLICY SMOKE PASSED` / exit 0.

Verified:
- `vi-VN` → model `large-v3-turbo`, explicit `language=vi`;
- non-Vietnamese default remains `base.en/en`;
- explicit Vietnamese `small` override is rejected;
- `index_transcript`, `generate_captions`, and `tighten_talk` accept explicit `language=vi` policy inputs;
- frozen cut fixture count = 20;
- production resolver reproduces `SAFE_CUT=13`, `SAFE_NOOP=7`;
- all retained cut context/preview WAV fixtures are non-empty;
- a 50 ms-adjacent word resolves SAFE_NOOP/review-needed;
- an isolated word resolves SAFE_CUT;
- unsafe Vietnamese delete request performs zero cuts, zero timeline mutation, and returns `reviewNeeded`;
- safe Vietnamese delete request produces a real ripple cut and reported frame count matches the timeline delta.

### Retained benchmark contract
No model benchmark was rerun. Frozen DESIGN evidence remains:
- speech: 639.96 s;
- `large-v3-turbo` WER: `0.0941734417` <= 0.20;
- deterministic rare/key recall: `0.79` >= 0.75;
- timing p95: `1.12 s` <= 1.5 s;
- frozen automated cut samples: 13 safe cut / 7 safe no-op.

### Preview/audio QA
A retained Vietnamese context WAV (`cut_01_context.wav`, 8.900 s) was used as real media input.
Production `render_preview` was executed before and after one guarded SAFE_CUT:
- pre-cut preview: H.264 video + AAC audio, duration `8.900000 s`, size `168702` bytes;
- post-cut preview: H.264 video + AAC audio, duration `8.700000 s`, size `164702` bytes;
- rendered duration reduction exactly matches the 6-frame / 0.200 s safe cut;
- audio stream remains present after the cut.
Independent FFprobe calls confirmed both A/V artifacts.

## Artifact
Production/task files:
- `packages/core/src/whisper/policy.ts`;
- `packages/core/src/engine.ts`;
- `packages/core/src/rpc.ts`;
- `packages/core/scripts/smoke-vi-policy.ts`;
- this evidence file.

Runtime-only artifacts remain under `.tmp/tve-imp-008-smoke/` and are not commit scope.
Frozen fixtures under `.spike-temp/` remain evidence inputs and are not promoted to production source.

## Evidence
- core build exit 0;
- VI-policy smoke exit 0 + result marker;
- root typecheck exit 0;
- independent FFprobe output for pre/post preview;
- retained `TVE-SPIKE-VI-STT` benchmark evidence;
- focused source review confirmed the two core Whisper call sites both pass through `resolveTranscriptionPolicy`.

## Owner / Authority
- ChatGPT Web: implementation/review/verification authority under frozen design;
- FileMCP-E: local execution/evidence bridge;
- product owner required for any AC/model threshold change.

## Risks / Open Questions
- `large-v3-turbo` remains heavier than small models (~1.92 GB peak working set in retained benchmark); packaging/model-download UX is a later convergence/release concern.
- callers must identify Vietnamese requests with `language=vi` (or supported Vietnamese aliases); an unknown-language legacy transcript cannot safely be inferred as Vietnamese.
- optional human listening remains available and may reopen the policy if contradictory evidence appears.

## Loopback
- implementation defect → TVE-IMP-008 Code/Test only;
- contradictory model/cut evidence or AC threshold change → DEFINE/ADR per Freeze record;
- packaging/model-bundle issue → owning packaging/release task without rerunning the frozen model benchmark unless its inputs/protocol materially change.
