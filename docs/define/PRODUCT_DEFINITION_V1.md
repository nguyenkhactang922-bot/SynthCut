# Product Definition v1

Status: FROZEN — TVE-FRZ-001 PASS (2026-10-07)
Date: 2026-10-06
Canonical lifecycle phase: 2 — DEFINE
Discovery source: `docs/discovery/PRODUCT_DISCOVERY_V1.md`
Canonical brief source: `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`

## 1. Brief
Personal-use, Windows-first AI-native long-form video editor. Local footage remains source media; ChatGPT/MCP is intended to be the primary operator; a visible NLE timeline remains available for inspection/correction; final video is rendered locally. CapCut/Premiere may be interchange/finishing options but are not required runtime dependencies.

## 2. Scope

### In scope for v1 freeze
- Windows desktop workflow.
- Personal/non-commercial use.
- One local raw/rough-cut MP4 as a minimal input path.
- 200–300 ordered source clips as an alternative project shape.
- Around 30 minutes at 1080p/30fps as the initial long-form scale target.
- Non-destructive shared timeline controlled by UI and ChatGPT/MCP.
- Import, save/load, crash recovery and manual timeline inspection.
- Transcript-driven editing with Vietnamese path.
- Silence/scene candidate detection.
- Trim/split/ripple/move, multi-track video/audio, B-roll/overlays, captions/text, music/audio control, transitions/transforms/keyframes and export where supported by the selected base.
- Proxy/preview/cache/background-job behavior needed for long-form use.
- Bounded AI context reads and stale-revision mutation protection.
- Rendered preview/frame QA before final export.
- Final local MP4 suitable for YouTube.
- Evidence/traceability sufficient to recover from chat interruption and prove requirements.

### Out of scope for initial freeze
- Commercial redistribution strategy.
- Cloud-first upload/editor dependency.
- Rebuilding a full NLE from scratch when a suitable base exists.
- Mandatory generative-video creation.
- Mandatory speaker diarization unless later evidence makes it required.
- Replacing FFmpeg solely for preference.
- Claiming package/release/deploy readiness before BUILD & VERIFY completes.

## 3. Constraints

### Product constraints
C-P01 — AI is primary operator, but manual timeline correction must remain possible.
C-P02 — CapCut is not a required runtime dependency.
C-P03 — Source media must remain non-destructively referenced.
C-P04 — Workflow must support both one-file rough cut and shot-level projects.

### Platform/runtime constraints
C-R01 — Windows is the first supported platform.
C-R02 — Long-running operations must be observable/cancelable and leave durable evidence.
C-R03 — Windows process/command-line/path limits are real constraints; long-form design must not assume arbitrarily large generated command lines. The premature LF POC exposed `ENAMETOOLONG` with ~300 repeated FFmpeg inputs, so this is now an explicit design risk rather than an implementation surprise.
C-R04 — Output artifacts/temp/cache/logs created by this project remain inside `E:\SynthCut` under the containment law.

### Data/state constraints
C-D01 — One authoritative non-destructive edit state; no shadow timeline.
C-D02 — Timing remains deterministic/frame-based at the project boundary unless a later ADR changes it.
C-D03 — Derived chapter/scene/beat/index data is rebuildable/revision-aware and cannot become independent render truth.
C-D04 — AI plans must fail closed when project revision is stale or be explicitly re-resolved.

### AI/context constraints
C-AI01 — Ordinary long-form reads must be bounded; whole transcript/state is not the default localized-edit path.
C-AI02 — Coherent AI batches require a recoverable boundary plus operation audit/rollback path.
C-AI03 — Vietnamese edit timing cannot use an English-only model default.

### License/security constraints
C-L01 — SynthCut GPL-3.0-or-later obligations and third-party licenses/provenance must remain documented.
C-L02 — Remotion remains an explicit optional/provider license boundary for current personal use.
C-S01 — No unreviewed critical production dependency finding may remain at Freeze.
C-S02 — Dependency remediation must avoid blind forced mass upgrades and must carry regression evidence.

### Process constraints
C-G01 — Canonical 8-phase lifecycle is mandatory.
C-G02 — Production code is forbidden until DESIGN is FROZEN and PLAN IMPLEMENTATION is PASS.
C-G03 — Spike/POC code is disposable evidence, never silently promoted.
C-G04 — Valid prior evidence is retained; it is rerun only when changed requirements or contradictory evidence make it stale.

## 4. Acceptance Criteria
The canonical detailed AC list remains in `docs/brief/TANG_AI_VIDEO_EDITOR_BRIEF_V1.md`. This definition normalizes discovery-to-AC traceability.

| Discovery hypothesis/problem | Definition acceptance evidence |
|---|---|
| I-H01 one local MP4 | AC-01, AC-12 |
| I-H02 200–300 ordered clips | AC-11, AC-17 |
| I-H03 natural-language brief | primary workflow + AI edit-plan design; must become frozen plan contract before implementation |
| I-H05 Vietnamese path | AC-18 |
| I-H06 derived local indexes | AC-03, AC-04, AC-06 |
| I-H07 bounded context | AC-14 |
| I-H08 one UI/AI edit truth | AC-02, AC-A02 |
| I-H09 revision-safe plans | AC-15, AC-16 |
| I-H10 derived hierarchy only | AC-A07 |
| O-H01 local YouTube MP4 | AC-12 |
| O-H02 preview/evidence | AC-07, AC-09, AC-13 |
| O-H03 no required CapCut runtime | AC-19 |
| O-H04 visible manual timeline | AC-02, AC-05, AC-17 |
| P-D05 long-form scale | AC-06, AC-08, AC-11, AC-17 plus LF spike gate |
| P-D06 long work survives chat pacing | AC-07 plus durable handoff/process law |
| E-H01 evidence before claims | AC-13, AC-A05, AC-A06, AC-A09 |

## 5. Definition Gaps Transferred Forward
- `no required CapCut runtime` is now explicit as AC-19 and must remain in frozen traceability.
- Windows command-size scalability is resolved at DESIGN POC level by `TVE-SPIKE-LF-001`; production implementation remains deferred until Freeze + Phase 5 PASS.
- Derived Tang metadata persistence is decided in ADR/design as a rebuildable project-adjacent sidecar; production schema implementation remains deferred until Freeze + Phase 5 PASS.
- Vietnamese model tier/accuracy is governed by revised AC-18: automated reference-backed validation is the DESIGN freeze gate; human listening is optional spot-check evidence rather than a mandatory prerequisite. Existing model benchmarks remain valid evidence and must not be rerun solely because the acceptance protocol changed.

## 5A. AC-18 requirement amendment — 2026-10-07
The prior mandatory human-review/cut-audition prerequisite is superseded for v1 personal use. The automated Vietnamese DESIGN gate is now:
- >=10 minutes reference-backed Vietnamese speech;
- multilingual Whisper only with explicit `language=vi`;
- normalized WER <=20%;
- deterministic frozen rare/key-token recall >=75%;
- p95 utterance-end timing error <=1.5 s with every sampled timing finite and within its utterance duration;
- 20/20 deterministic cut-boundary samples resolve fail-closed under the breathing-room policy: retain >=120 ms guard on each side for a performed cut; if the candidate gap is too small, return NOOP/review-needed rather than forcing a cut;
- throughput and peak memory are recorded.
Human listening remains available as optional product QA and can reopen the policy if contradictory evidence appears.

## 6. DEFINE Exit Gate
- Brief: PASS.
- Scope: PASS.
- Constraints: PASS.
- Measurable acceptance criteria exist and are trace-mapped: PASS; final thresholds were reconciled through DESIGN evidence and frozen by `TVE-FRZ-001`.
- No production implementation authorization before Phase 5 PASS: confirmed.

**DEFINE = FROZEN FOR V1 IMPLEMENTATION PLANNING.**
