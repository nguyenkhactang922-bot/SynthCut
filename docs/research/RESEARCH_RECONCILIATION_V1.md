# Research Reconciliation v1

Status: PASS FOR DESIGN RE-AUDIT
Date: 2026-10-06
Canonical lifecycle phase: 3 — RESEARCH
Inputs:
- `docs/discovery/PRODUCT_DISCOVERY_V1.md`
- `docs/define/PRODUCT_DEFINITION_V1.md`

## Required research chain
Solution Research -> Repo/Tool/Framework Search -> License/Security Audit -> Candidate Comparison.

## 1. Solution Research — evidence mapping
Research already evaluated these solution classes/patterns:
- AI-native NLE with shared agent/UI timeline;
- deterministic frame-based edit core;
- FFmpeg local render execution;
- proxy/cache/background jobs for long-form;
- transcript/silence/scene/visual indexes;
- bounded long-form read model;
- agent checkpoint/dry-run/audit patterns;
- OTIO/interchange rather than making CapCut a runtime dependency.

Evidence: `SYNTHCUT_BASE_REPO_AUDIT_V1.md`, `RESEARCH_EVIDENCE_V1.md`, `REPO_TECH_COMPARISON_V1.md`.

## 2. Repo/Tool/Framework Search — evidence mapping
Candidates compared:
- SynthCut;
- WeftCut;
- dawn-cut;
- tjameswilliams/ai-video-editor;
- MakeMyClip/editor;
- OpenTimelineIO as interchange rather than NLE base.

No discovery/definition requirement creates a reason to invalidate this candidate set. SynthCut remains the strongest base candidate because it already exposes a shared UI/MCP editor core, local FFmpeg execution, transcript/media analysis, proxy/cache/jobs and Windows desktop path.

## 3. License/Security Audit — evidence mapping
- SynthCut base: GPL-3.0-or-later.
- Remotion: separate source-available terms; acceptable for current personal-use scope, kept as explicit provider boundary.
- Reference repos carry different licenses; direct code reuse requires provenance discipline.
- Dependency security baseline was measured; `TVE-SPIKE-DEPSEC-001` produced a non-force production-audit path to zero findings with regression checks, while dev/packaging findings remain tracked separately.

This satisfies RESEARCH for current personal-use scope; a commercial goal would reopen license research.

## 4. Candidate Comparison — evidence mapping
`REPO_TECH_COMPARISON_V1.md` evaluates base fit, license, Windows readiness, agent safety, long-form architecture and reuse role. Its conclusion remains consistent with current definition:
- SynthCut = base;
- WeftCut = agent ergonomics/checkpoint/preview reference;
- dawn-cut = deterministic command/invariant/audit reference;
- ai-video-editor = intelligence/provider reference for personal use;
- MakeMyClip = simple agent/FFmpeg surface reference;
- OTIO = interchange.

## 5. New delta discovered after earlier research
Premature `TVE-SPIKE-LF-001` produced a concrete Windows long-form risk:
- a 30-minute source and ~301-clip project assembled/saved/loaded correctly;
- first segmented preview failed with `ENAMETOOLONG` because the preview render command repeated the same source as hundreds of FFmpeg `-i` inputs even for a localized segment.

Research implication:
- this is evidence of a long-form command-construction/scoping limitation, not evidence that SynthCut must be abandoned;
- DESIGN must require segment/window rendering to construct bounded input/filter graphs or another command-size-safe strategy;
- base selection remains valid until a corrected disposable POC proves or disproves the narrow fix.

## 6. RESEARCH Exit Gate
- Solution research: PASS.
- Repo/tool/framework search: PASS.
- License audit: PASS for personal/non-commercial scope.
- Security audit: PASS for pre-freeze research; freeze security gate remains explicit.
- Candidate comparison: PASS.
- New long-form risk transferred to DESIGN with concrete evidence: PASS.

**RESEARCH = PASS FOR DESIGN RE-AUDIT.**

Do not rerun old candidate research unless scope/license/platform requirements change.
