# TVE-PLAN-003 — Requirement / Test / Evidence Traceability Plan v1

Status: PASS
Date: 2026-10-07
Depends on: TVE-PLAN-001, TVE-PLAN-002
Frozen source: `docs/audit/TVE-FRZ-001_FREEZE_RECORD.md`

## Input
Frozen ACs, frozen design decisions, dependency graph, decomposed production tasks, existing smoke inventory.

## Entry Gate
- TVE-FRZ-001 PASS.
- Dependency Graph PASS.
- Task Decomposition PASS.
- No production code claimed.

## Work
Map every frozen product/architecture requirement to design mechanism, implementation task(s), test/runtime proof, evidence artifact, and final verification gate. Identify orphan requirements or tasks with no requirement/risk rationale.

## Output — frozen forward trace

| Requirement | Frozen design mechanism | Implementation task(s) | Required test/runtime proof | Durable evidence | Final gate |
|---|---|---|---|---|---|
| AC-01 non-destructive local import | existing MediaAsset/EDL retained | existing core + E2E | core import smoke; source hash/mtime unchanged | E2E-001 | MAIN VERIFIED |
| AC-02 same UI/MCP state | one core RPC/project truth | IMP-003, IMP-010, E2E | MCP mutation visible in desktop/timeline state; same project/revision | IMP-003/010 + E2E evidence | MAIN VERIFIED |
| AC-03 word-level timing | Whisper index; VI policy | IMP-008 | Vietnamese word/segment timing structural checks; transcript smoke | IMP-008 | E2E |
| AC-04 silence/scene deterministic candidates | existing analysis tools retained | IMP-010 + existing core | scene/silence smoke; plan uses explicit candidate ranges | IMP-010/E2E | E2E |
| AC-05 NLE editing surface | existing SynthCut core/UI retained | regression responsibility across all IMPs | existing core/edit/multitrack/effects/text/audio smokes | per-task regression + E2E | MAIN VERIFIED |
| AC-06 proxy preview/full-res final | existing proxy + bounded render | IMP-006 | proxy smoke + 30m final source export | IMP-006 | E2E |
| AC-07 observable/cancelable long work | JobManager retained | IMP-006, IMP-011 | smoke-jobs + background LF progress/cancel + cleanup | IMP-006/011 | E2E |
| AC-08 incremental cache | intersecting segment cache | IMP-006 | localized edit >=90% unrelated reuse; remote cache hit | IMP-006 | E2E |
| AC-09 AI verifies rendered truth | inspect frame/preview evidence loop | IMP-011, IMP-010 | structural + get_frame/inspect_timeline + preview | IMP-011 | E2E |
| AC-10 save/load/crash recovery | `.aive` authoritative + sidecar subordinate | IMP-001, IMP-005 | save/load/restart/recovery; sidecar stale/corrupt safety | IMP-001/005 | E2E |
| AC-11 200–300 clips/no flatten | flat authoritative EDL + derived index | IMP-002, IMP-006, IMP-007 | 300-clip read/render/UI project | IMP-002/006/007 | E2E |
| AC-12 local YouTube MP4 | FFmpeg final mux | IMP-006 | 1800s 1920x1080 30fps H264+AAC ffprobe | IMP-006 | E2E |
| AC-13 implementation traceability | batch/evidence records + this plan | IMP-005, IMP-011, all tasks | evidence link completeness; final trace audit | per-task + final audit | LEARN Final Traceability |
| AC-14 bounded AI reads | overview/range/transcript window <=64 KiB | IMP-002, IMP-003 | byte-size measurements; 3 localized tasks no full transcript | IMP-002/003 | E2E |
| AC-15 stale-plan fail-closed | revision precondition | IMP-004, IMP-005 | stale plan zero mutation; current plan valid | IMP-004/005 | E2E |
| AC-16 recoverable coherent batch | checkpoint + audit + restore | IMP-005 | forced mid-batch failure restore; success audit; restart | IMP-005 | E2E |
| AC-17 300-clip UI gates | viewport culling/virtualization | IMP-007 | first paint <=5s; p95 <=100ms; no >500ms task; commit <=250ms | IMP-007 | E2E |
| AC-18 Vietnamese STT | large-v3-turbo + explicit vi + 120ms fail-closed guard | IMP-008 | production policy tests; frozen 20 cut samples; WER evidence retained; preview/audio QA | IMP-008 | E2E |
| AC-19 no required CapCut runtime | local SynthCut/Tang path | all local tasks + E2E | process/dependency inspection while import→edit→preview→export completes | E2E-001 | E2E/MAIN VERIFIED |
| AC-A01 reuse strengths | extension-first | all tasks | code review shows targeted extension, no gratuitous core rewrite | review evidence | MAIN VERIFIED |
| AC-A02 one source truth | `.aive` core only | IMP-001, IMP-002, IMP-004/005 | sidecar deletion/corruption cannot change edit truth; no direct JSON mutation | IMP-001/005 | E2E |
| AC-A03 frame determinism | frames at project boundary | IMP-002, IMP-004/005, IMP-010 | range/plan deterministic frame assertions | per-task | E2E |
| AC-A04 licenses/provenance | frozen license boundary | IMP-009 + release review | notice/license diff review; no untracked copied noncommercial code | IMP-009 + package audit | Phase 7 |
| AC-A05 no production code before Freeze | lifecycle lock | governance/history | Git evidence: design-phase production diff empty; freeze before IMP claims | FRZ record + Git diff | satisfied pre-code |
| AC-A06 bounded spikes | disposable POC lane | governance/history | `.spike-temp` not production/staged promotion | freeze audit | satisfied |
| AC-A07 derived hierarchy only | `<project>.tang.json` revision-aware read model | IMP-001, IMP-002, IMP-010 | stale sidecar invalidation; hierarchy refs resolve to core IDs/frames | IMP-001/002/010 | E2E |
| AC-A08 dependency integrity | non-force remediation | IMP-009 | npm audit --omit=dev; build/typecheck/security smoke | IMP-009 | MAIN VERIFIED |
| AC-A09 no silent POC promotion | fresh production implementation + normal tests | every IMP | review diff against `.spike-temp`; no copied POC without explicit task review | per-task review | MAIN VERIFIED |

## Cross-cutting test matrix

### Static / build
- `npm run typecheck`
- `npm run build`
- workspace-specific typecheck/build after narrow edits.

### Existing risk-based smokes to reuse
- `packages/core/scripts/smoke-security.ts`
- `packages/core/scripts/smoke-jobs.ts`
- `packages/core/scripts/smoke-cache.ts`
- `packages/core/scripts/smoke.ts`
- `packages/mcp/scripts/smoke.ts`
- `packages/core/scripts/smoke-textedit.ts`
- `packages/core/scripts/smoke-media.ts`
- `packages/core/scripts/smoke-toolsurface.ts`
- `packages/core/scripts/smoke-export.ts`
- `packages/core/scripts/smoke-proxy.ts`
- applicable multitrack/effects/audio/text/caption smokes after touched paths.

### New implementation-specific smokes required
- `smoke-tang-metadata` — sidecar schema/revision/corruption/restart.
- `smoke-bounded-context` — byte budgets/range precision/stale index.
- `smoke-edit-plan` — preconditions/dry-run/stale zero-mutation.
- `smoke-safe-batch` — checkpoint/failure restore/success audit/restart.
- `smoke-longform-production` — exact 30m/~300 clip/cache/jobs/final export.
- `smoke-ui-300` or equivalent desktop performance harness.
- `smoke-vi-policy` — model/language/cut guard/safe-noop.
- `smoke-editorial-orchestration` — bounded read → plan → safe apply → QA contract.
- `smoke-evidence-loop` — structural/rendered/delivery refs.

Names may be adjusted to repo conventions during each claimed task; required behavior may not be weakened.

## Negative/error-path trace
- stale project revision → IMP-004/005 reject before mutation.
- malformed/stale Tang sidecar → IMP-001 ignore/invalidate safely.
- mid-batch failure → IMP-005 restore checkpoint.
- insufficient transcript-cut gap → IMP-008 SAFE_NOOP/review-needed.
- render cancellation → IMP-006 JobManager cancel + partial cleanup.
- missing/offline media → existing core behavior regression-tested where touched.
- oversized default context response → IMP-002 test FAIL.
- UI offscreen clip interaction regression → IMP-007 test FAIL.

## Exit Gate
PASS:
- every AC-01..19 has implementation/test/evidence/final-gate trace;
- every AC-A01..A09 has trace;
- no production task is orphaned from a frozen requirement/risk;
- negative paths are assigned;
- final E2E convergence is explicit.

## Artifact
`docs/plan/TRACEABILITY_PLAN_V1.md`

## Evidence
Frozen AC list, freeze record, dependency graph, task decomposition, current `docs/TESTING.md` smoke inventory.

## Owner / Authority
ChatGPT Web owns traceability. FileMCP-E executes later tests/evidence. Product owner must explicitly authorize any future weakening/change to product ACs.

## Risks / Open Questions
- performance gates can vary by machine; evidence must record environment and compare against frozen thresholds.
- existing smoke names may need narrow additions rather than monolithic reruns.
- Phase 7 packaged-app proof is separate from implementation E2E and must not be falsely claimed early.

## Loopback
- orphan requirement -> Task Decomposition;
- hidden prerequisite -> Dependency Graph;
- untestable/ambiguous requirement -> Freeze/DEFINE as appropriate;
- no gaps -> authorize TVE-PLAN-004 Production Task Queue.
