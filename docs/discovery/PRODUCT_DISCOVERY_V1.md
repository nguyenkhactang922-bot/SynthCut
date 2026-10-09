# Product Discovery v1

Status: PASS FOR DEFINE
Date: 2026-10-06
Canonical lifecycle phase: 1 — DISCOVER

## 1. Raw Idea
Build a personal Windows AI-native video editing workflow where local footage can be edited primarily by conversational instructions from ChatGPT/MCP while retaining a visible professional timeline for review and manual correction. The target includes long-form YouTube-style work around 30 minutes and projects represented either by one raw/rough-cut video or by roughly 200–300 ordered shots.

This is a product intent, not yet a commitment to SynthCut or any implementation technology.

## 2. Problem Discovery

### P-D01 — Manual NLE operation is the bottleneck
Traditional editors expose powerful timeline primitives but require the user to repeatedly locate timestamps, split, trim, ripple, move, caption, mix and inspect by hand. The desired workflow moves routine decision/execution work to an AI operator without removing human review.

### P-D02 — AI planning without execution is insufficient
A prompt that only produces an edit checklist still forces the user back into CapCut/Premiere. The desired system must be able to inspect the current project, mutate the same edit state the user sees, render evidence and iterate.

### P-D03 — Long-form context does not fit naive whole-project prompting
A 30-minute transcript/timeline can be large. Localized edits should not require repeatedly shipping the entire transcript/timeline state into an AI context.

### P-D04 — AI and human must not diverge into separate timelines
If ChatGPT edits a shadow representation while the desktop UI shows another state, reconciliation becomes unsafe. The product needs one authoritative non-destructive edit state.

### P-D05 — 200–300 shot projects create scale pressure
The system must remain usable when a story is already assembled from hundreds of generated or recorded shots. UI rendering, render graph construction, caching and command size are all possible scale limits.

### P-D06 — Long-running local work must survive conversational pacing
Preview/export/transcription can outlive a chat turn. Work must be observable, cancelable and resumable from durable project/runtime state rather than tied to one synchronous chat response.

### P-D07 — Local/private media should remain local by default
The base workflow should not require uploading the entire source video to a cloud editor merely to perform ordinary editing operations.

### P-D08 — Vietnamese transcript-driven editing needs language-specific proof
English-safe defaults cannot be assumed to provide acceptable Vietnamese word timing or cut boundaries.

### P-D09 — User still needs a visible editor surface
Full automation must not eliminate inspectability. The user should be able to see the timeline, preview the result, correct individual edits and understand what the agent changed.

## 3. Discovery Research

### Existing workflow patterns observed
- A creator may start from one continuous raw/rough-cut MP4.
- A creator may instead have ~200–300 ordered shots that are already story-ordered before final polish.
- Final editing commonly consists of trim/ripple, pacing, B-roll/overlays, captions, music/audio balance, transitions/effects and export.
- Flattening hundreds of shots into one MP4 early makes later shot-level replacement harder; keeping shot identity in a non-destructive timeline is preferable when possible.

### Existing solution patterns found in repository research
- AI-native NLE: same timeline can be exposed to AI tools rather than only producing a textual edit plan.
- Frame-based non-destructive timeline: edits can remain deterministic and source-safe.
- Local FFmpeg execution: timeline decisions can be rendered without requiring CapCut as a runtime dependency.
- Proxy/cache/background jobs: long-form work can be made interactive if scale behavior is proven.
- Transcript/silence/scene indexes: AI can locate candidate edit ranges without watching every source frame continuously.
- Bounded read/index pattern: `index -> locate -> expand -> edit` can keep AI context localized.
- Checkpoint/dry-run/audit patterns from comparison repos can make agent mutation safer.

Discovery research does not yet choose the base technology; candidate selection belongs to RESEARCH/ADR.

## 4. I/O Hypotheses

### Inputs
I-H01 — Minimal source input can be exactly one local MP4 around 30 minutes.

I-H02 — Alternative source input can be 200–300 ordered clips without requiring destructive pre-flattening.

I-H03 — User intent input is a natural-language edit brief containing goals, preserve/remove rules, pacing/style preferences and output target.

I-H04 — Optional local assets may include B-roll, images, music, logos and subtitle/style references.

I-H05 — Project language may be Vietnamese and should explicitly influence transcription/model selection.

### Derived inputs / indexes
I-H06 — Metadata, thumbnails/proxies, transcript words/timestamps, silence regions, scene boundaries and searchable visual descriptors can be derived locally and rebuilt from source media.

I-H07 — Long-form AI reasoning can use bounded project/chapter/range/transcript-window reads instead of whole-state reads for ordinary localized tasks.

### Intermediate state
I-H08 — One non-destructive project/timeline can remain authoritative for both UI and agent operations.

I-H09 — AI mutations can be represented as reviewable plans with project revision preconditions, then applied through normal editor commands.

I-H10 — Derived chapter/scene/beat metadata can remain an index/read model rather than becoming a second edit truth.

### Outputs
O-H01 — Primary user output is a locally rendered standard MP4 suitable for YouTube.

O-H02 — Intermediate outputs include preview video/frames, transcript/index artifacts, edit-plan/audit records and job progress.

O-H03 — The user can obtain a usable final video without CapCut being a required runtime step.

O-H04 — The visible timeline remains available as a manual correction surface even when ChatGPT is the primary operator.

### Evidence outputs
E-H01 — Every high-risk capability must leave measurable test/runtime evidence before it becomes a frozen requirement or MAIN VERIFIED claim.

E-H02 — Long-running stages must leave durable process/log/artifact/result markers so chat loss does not force a restart.

## 5. Discovery Questions Transferred Forward
The following are not silently answered in DISCOVER:
- Which repository/framework is the best base?
- Can 300-clip timeline UI meet interaction gates?
- Can 30-minute preview/export avoid Windows command/path/process limits?
- Which multilingual Whisper tier meets Vietnamese timing/accuracy needs?
- Which agent checkpoint/audit strategy is cheapest while preserving one edit truth?
- What persistent location/schema should derived Tang metadata use?

These become DEFINE constraints/acceptance targets and RESEARCH/DESIGN risks.

## 6. DISCOVER Exit Gate
- Raw idea explicit: PASS.
- Problem stated independently of a chosen repository: PASS.
- Discovery research identifies workflow/solution patterns without selecting technology: PASS.
- Inputs, intermediate state, outputs and evidence outputs are explicit hypotheses: PASS.
- Material unknowns transferred forward rather than assumed: PASS.

**DISCOVER = PASS FOR DEFINE.**
