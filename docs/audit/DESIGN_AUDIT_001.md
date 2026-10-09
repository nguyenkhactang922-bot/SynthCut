# DESIGN AUDIT 001 — Conditional Pre-Spike Audit

Status: PASS TO SPIKES — document remediation re-audited; architecture still NOT FROZEN
Date: 2026-10-06

## Scope
Audit the brief, research evidence, ADR-001, living design, task queue, and verified SynthCut baseline before any spike or production implementation.

## Stop rule
This audit may become `PASS TO SPIKES` only when:
1. brief, ADR, design, and base behavior contain no material contradiction;
2. every high-risk unknown has a spike ID;
3. every spike has measurable pass/fail thresholds before execution;
4. acceptance criteria cover long-form context, concurrency, Vietnamese STT, UI scale, and dependency integrity;
5. architecture FREEZE remains blocked until required spikes PASS.

## Independent rounds

### R1 — Problem/solution fit
PASS. SynthCut already supplies the NLE execution substrate. Extension is better supported than replacing the editor core.

### R2 — Source of truth
PASS WITH INVARIANT. The flat SynthCut `Project` remains authoritative. Chapter/scene/beat is derived, revision-aware metadata only and can never become independent render truth.

### R3 — 30-minute / 300-clip scale
OPEN -> required spikes. Basic 300-clip planning is cheap, but actual FFmpeg throughput, memory, and non-virtualized timeline responsiveness are not proven.

### R4 — MCP/context scale
OPEN -> required spike. Current full transcript/timeline reads can be large. Design direction `index -> locate -> expand -> edit` is correct, but the brief lacks a bounded-context acceptance criterion.

### R5 — AI mutation concurrency
MATERIAL GAP. The design contains revision guard, dry-run, checkpoint, and audit concepts, but the brief does not yet require stale-plan fail-closed behavior or coherent-batch rollback/audit.

### R6 — Vietnamese STT
MATERIAL GAP. Upstream defaults are English-only. Vietnamese projects must explicitly use a multilingual model and `vi`; quality must be measured.

### R7 — Dependency integrity
FREEZE BLOCKER. Current production dependency audit contains an unresolved critical finding plus high-severity findings. These require classification/remediation evidence before freeze. No blind forced mass-upgrade is allowed.

### R8 — License/provenance
PASS WITH RULES. Current personal/non-commercial use fits the selected base; direct reuse from differently licensed reference repos must remain traceable. A future commercial goal requires a new license review.

### R9 — QA truth
PASS. Structural state is not enough; exact rendered frames/preview and final media checks remain the verification truth.

### R10 — Lifecycle
PASS. `IMPLEMENTATION_ALLOWED=false`; spikes are evidence, not production code.

## Required document remediation
- F-001 HIGH: add bounded-context acceptance criterion.
- F-002 HIGH: add stale-plan/revision-guard acceptance criterion.
- F-003 HIGH: add coherent AI-batch checkpoint/audit/rollback acceptance criterion.
- F-004 HIGH: add measurable 300-clip UI acceptance criterion.
- F-005 HIGH: add Vietnamese multilingual STT acceptance criterion.
- F-006 FREEZE BLOCKER: add dependency-integrity acceptance gate.
- F-007 MEDIUM: choose persistence location for derived Tang metadata before freeze; spike may use disposable sidecar metadata.
- F-008 MEDIUM: speaker diarization is deferred from v1 unless later evidence makes it necessary.

## Spike thresholds

### TVE-SPIKE-LF-001
Fixture: 30:00, 1920x1080/30fps, about 300 clips with representative audio and some overlays/effects.
PASS requires:
- create/assemble/save/load/summary without data loss or crash;
- save and reload each <=5 s after media metadata is available;
- exact preview path succeeds and measured throughput is recorded;
- after cache warm-up, a localized <=10 s visual edit leaves >=90% of unrelated video segments reusable;
- exact frame in an unchanged remote region needs zero new segment video renders or equivalent cache hit;
- 20 localized edit/verify cycles show no crash or unbounded memory growth; post-warm RSS at cycle 20 <=125% of post-warm baseline unless a bounded intentional allocation explains it;
- background export control returns <=5 s, reports progress, can cancel cleanly;
- one 30-minute 1080p MP4 export completes and passes ffprobe checks.

### TVE-SPIKE-UI-300
PASS requires:
- core-state available -> usable timeline first paint <=5 s;
- 30 s zoom/pan/scrub interaction trace p95 <=100 ms;
- no single main-thread task >500 ms during normal interaction sequence;
- drag/trim commit reflects authoritative updated state <=250 ms after release under normal local RPC conditions;
- no renderer crash/OOM;
- if current UI fails, a disposable viewport-culling/virtualization prototype must demonstrate a path to PASS.

### TVE-SPIKE-MCP-CONTEXT
PASS requires:
- default overview/range/transcript-window responses <=64 KiB serialized JSON each;
- three representative long-form tasks complete without fetching the entire transcript after indexing;
- returned ranges resolve deterministically to current clip IDs/frame ranges;
- stale project revision prevents plan application;
- tested edit precision matches the existing full-state tools.

### TVE-SPIKE-VI-STT
Fixture: >=10 minutes representative Vietnamese speech, human-checked transcript, >=20 edit boundaries.
PASS requires:
- multilingual model only, language explicitly `vi`;
- normalized WER <=20%;
- key-content word recall >=95% on a declared keyword/name/number set;
- p95 reviewed word-boundary timing error <=500 ms;
- >=19/20 sample transcript-driven cuts pass human audition without clipped phonemes or obviously rushed joins;
- throughput/memory recorded; if highest-accuracy model is too slow, design records a draft/final two-tier model policy.

### TVE-SPIKE-DEPSEC-001
PASS requires:
- zero unreviewed critical production dependency findings;
- each high production finding classified by dependency chain, reachability, and affected path;
- every reachable high is fixed or has an explicit mitigation/acceptance rationale before freeze;
- dependency changes pass build/typecheck and relevant core/MCP/security smokes;
- no forced mass-upgrade without compatibility evidence.

## Re-audit after document remediation
Re-read of the audit-remediated brief and living design confirms:
- F-001 bounded-context AC is now explicit (`AC-14`) and <=64 KiB default-read target is recorded in the living design;
- F-002 stale-plan/revision guard is now explicit (`AC-15`);
- F-003 recoverable/auditable AI batch boundary is now explicit (`AC-16` plus design safe-mutation gate);
- F-004 300-clip UI responsiveness is now explicit (`AC-17` plus fixed spike thresholds);
- F-005 Vietnamese multilingual STT is now explicit (`AC-18` plus fixed spike thresholds);
- F-006 dependency-integrity gate is now explicit (`AC-A08` plus fixed spike thresholds).

F-007 remains a pre-freeze design choice, not a spike-entry blocker: disposable sidecar metadata is permitted for spike-only evidence, but persistent metadata location must be decided before freeze. F-008 is resolved as deferred from v1 unless new evidence requires speaker diarization.

No new contradiction was introduced. The authoritative flat core timeline, revision-aware derived hierarchy, MCP mutation boundary, rendered-truth QA and implementation lock remain consistent across brief/ADR/design.

## Current verdict
`PASS TO SPIKES`.

This verdict authorizes only the bounded spike lane. Architecture and acceptance criteria are **not FROZEN**; production implementation remains prohibited until all required spikes PASS, their evidence is reconciled into the living design, and `TVE-FRZ-001` passes.
