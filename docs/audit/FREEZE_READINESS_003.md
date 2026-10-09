# DESIGN AUDIT 003 — Freeze Readiness Consolidation

Status: HOLD — ONE EMPIRICAL BLOCKER REMAINS
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Lifecycle: Phase 4 DESIGN only. `IMPLEMENTATION_ALLOWED=false`.

## Purpose
Reconcile every currently available DESIGN spike/decision into a single pre-Freeze gate so `TVE-FRZ-001` can execute without redoing already valid work.

## Evidence reconciled
- `docs/adr/ADR-001_BASE_ARCHITECTURE.md` including A-001/A-002/A-003;
- `docs/design/TANG_AI_VIDEO_EDITOR_DESIGN.md`;
- `docs/evidence/spikes/TVE-SPIKE-DEPSEC-001.md`;
- `docs/evidence/spikes/TVE-SPIKE-MCP-CONTEXT.md`;
- `docs/evidence/spikes/TVE-SPIKE-UI-300.md`;
- `docs/evidence/spikes/TVE-SPIKE-LF-001.md`;
- `docs/evidence/spikes/TVE-SPIKE-SAFE-BATCH-001.md`;
- product brief / definition / research reconciliation.

## Freeze decision register

| Decision / blocker | Status | Evidence / decision |
| --- | --- | --- |
| Base editor / timeline / renderer | RESOLVED | SynthCut remains base; single authoritative `.aive` timeline; FFmpeg retained. |
| Windows long-form command-size risk | RESOLVED AT POC LEVEL | LF-001 bounded segment/window execution; max 3 inputs / ~1,583 chars in measured final path. |
| 30-minute / ~300-clip runtime | RESOLVED AT POC LEVEL | Exact 1800s preview/final export, cache locality, RSS, progress/cancel and ffprobe PASS. |
| 300-clip timeline UI | RESOLVED AT POC LEVEL | viewport-culling disposable POC passed fixed UI gates. |
| Bounded long-form MCP context | RESOLVED AT POC LEVEL | default bounded read surfaces <=64 KiB and representative edit flow evidence retained. |
| Coherent AI batch safety | RESOLVED AT POC LEVEL | pre-batch `.aive` checkpoint + revision precondition + audit record restored semantic state after simulated mid-batch failure, including fresh-engine save/reload verification. |
| Derived Tang metadata persistence | RESOLVED | `<project>.tang.json` sidecar, rebuildable, revision-aware, never edit/render truth. |
| Production dependency remediation feasibility | RESOLVED AT POC LEVEL | lockfile-only non-force candidate reached `npm audit --omit=dev` = 0 and passed build/typecheck/security regressions. Production promotion remains a traced post-Freeze task. |
| Packaging toolchain vulnerabilities | ACCEPTED TRACKED RISK | remaining full-audit chain is dev/packaging centered on `electron-builder`; must be hardened before installer MAIN VERIFIED. |
| No required CapCut runtime | RESOLVED AS FROZEN CANDIDATE REQUIREMENT | AC-19 explicitly requires local import/timeline/preview/export without CapCut. LF POC used SynthCut/Tang local execution + FFmpeg only. CapCut/Premiere/Resolve remain optional interchange/finishing destinations. |
| Vietnamese STT model/quality | **BLOCKED** | gold reference required; no qualifying human-reviewed >=10-minute fixture has been proven. |
| Speaker diarization | DEFERRED FROM V1 | not required unless later evidence reopens the requirement. |

## Requirement / evidence trace — freeze candidate

| Requirement | Pre-Freeze status | Evidence / binding decision |
| --- | --- | --- |
| AC-01 local non-destructive import | READY | SynthCut core import/project model research evidence. |
| AC-02 UI + MCP same state | READY | `RESEARCH_EVIDENCE_V1` shared-source-of-truth verification. |
| AC-03 transcript word timing | **BLOCKED FOR VI DEFAULT** | core supports word timing; Vietnamese accuracy/timing still requires VI-STT gold fixture. |
| AC-04 silence/scene deterministic candidates | READY | existing core analysis surface retained. |
| AC-05 multi-track editing surface | READY | base-repo audit + retained core. |
| AC-06 long-form preview/full-res delivery | READY AT DESIGN POC LEVEL | LF-001 bounded preview/final evidence. |
| AC-07 observable/cancelable long jobs | READY AT DESIGN POC LEVEL | LF background job progress/cancel PASS. |
| AC-08 localized render cache reuse | READY AT DESIGN POC LEVEL | 299/300 unchanged segment keys reusable; remote frame zero new render / one cache hit. |
| AC-09 rendered QA evidence | READY | `renderFrame`/preview verification retained; LF/UI POCs use rendered truth. |
| AC-10 save/load/crash recovery | READY | engine save/load/recovery code + LF save/load evidence. |
| AC-11 200–300 clips / rough cut | READY AT DESIGN POC LEVEL | LF 300-clip fixture and UI-300 evidence. |
| AC-12 local YouTube MP4 | READY AT DESIGN POC LEVEL | independent ffprobe: 1800s, 1920x1080, 30fps, H.264 + AAC. |
| AC-13 implementation traceability | BOUND FOR PHASE 5/6 | must become production task/test/evidence mapping after Freeze. |
| AC-14 bounded long-form AI reads | READY AT DESIGN POC LEVEL | MCP-CONTEXT PASS. |
| AC-15 stale-plan fail closed | READY AS DESIGN REQUIREMENT | revision-based stale-plan gate retained; implementation task required after Freeze. |
| AC-16 coherent batch recoverability/audit | READY AT DESIGN POC LEVEL | `TVE-SPIKE-SAFE-BATCH-001` PASS. |
| AC-17 300-clip UI gates | READY AT DESIGN POC LEVEL | UI-300 viewport-culling POC PASS. |
| AC-18 Vietnamese multilingual STT | **BLOCKED** | no gold fixture; cannot freeze default model/quality claim. |
| AC-19 no required CapCut runtime | READY | explicit brief requirement + local LF execution evidence. |

## Vietnamese fixture search result
Workspace inspection found a candidate Vietnamese video/SRT pair with sufficient duration:
- video duration measured by ffprobe: ~616.987 seconds (~10m17s);
- corresponding Vietnamese SRT extends beyond the 10-minute mark.

However, provenance available in the workspace does **not** establish that this transcript/timing is human-reviewed. File naming/location indicates it may be generated/translated pipeline output. Therefore it is **not accepted as gold reference** for WER/timing/cut-audition measurements.

Do not fabricate or self-certify the gold transcript.

## Remaining VI-STT fixed gate
A qualifying fixture must contain:
- >=10 minutes representative Vietnamese speech;
- human-reviewed reference transcript;
- >=20 reviewed edit boundaries;
- declared keyword/name/number recall set.

The spike must use multilingual models only and explicit `language="vi"`, then compare a practical model with a higher-accuracy candidate. PASS thresholds remain those fixed by `DESIGN_AUDIT_001` / living design:
- normalized WER <=20%;
- key-content word recall >=95%;
- p95 reviewed boundary timing error <=500 ms;
- >=19/20 cut auditions acceptable under the frozen padding/breathing-room policy.

## Risk register carried into Freeze candidate
1. **VI-STT gold fixture** — BLOCKER; cannot waive silently.
2. **Production dependency lockfile hardening** — implementation task required immediately after Phase 5 authorizes production mutation; exact candidate must be re-applied and regression-tested.
3. **electron-builder packaging chain** — tracked release hardening before installer MAIN VERIFIED.
4. **Viewport culling** — production implementation task required; current base UI itself did not pass 300-clip gates without the disposable POC.
5. **Bounded A/V long-form execution** — production implementation task required; naive upstream 300-input path remains unacceptable on Windows.
6. **Batch checkpoint/audit orchestration** — production implementation task required; current proof is disposable orchestration evidence.
7. **Git identity** — repository commit workflow blocker, not an architecture-freeze blocker; do not invent identity.

## Verdict
`TVE-FRZ-001` is **NOT AUTHORIZED YET**.

All currently resolvable non-Vietnamese freeze decisions are reconciled. The remaining architecture/acceptance blocker is `TVE-SPIKE-VI-STT` gold-fixture evidence. Once that spike PASSes, perform a narrow final Freeze audit against this document plus the VI-STT evidence; do not rerun DISCOVER/DEFINE/RESEARCH or already-PASS spikes unless contradictory evidence appears.
