# TVE-SPIKE-UI-300 — 300-Clip Desktop Timeline Responsiveness

Status: BASELINE FAIL — DISPOSABLE VIRTUALIZATION PROTOTYPE REQUIRED
Date: 2026-10-06
Baseline HEAD: `96b1ca0e8b9935cc0d9561a3bc020f29bf9e88a0`
Nature: disposable performance harness only; no production Timeline changes.

## Fixed audit gates
From `docs/audit/DESIGN_AUDIT_001.md`:
- usable timeline first paint <=5 s;
- 30 s zoom/pan/scrub interaction p95 <=100 ms;
- no single main-thread task >500 ms during the normal interaction sequence;
- drag/trim commit reflected <=250 ms after release;
- no renderer crash/OOM;
- if baseline fails, a disposable viewport-culling/virtualization prototype must demonstrate a path to PASS.

## Fixture
- Electron desktop renderer;
- real production `apps/desktop/src/timeline.tsx` component;
- 300 sequential 6-second clips;
- 30 fps;
- 30-minute timeline;
- one authoritative synthetic asset reference;
- 1360x880 BrowserWindow;
- production CSS and playback/timeline helpers.

## Harness recovery / corrections
The pre-existing harness build was resumed rather than recreated. Execution initially failed only in harness mechanics:
1. synthetic JavaScript PointerEvents are not native active pointers, so Chromium rejected `setPointerCapture/releasePointerCapture`; harness main now no-ops capture for synthetic events only;
2. Electron attempted structured-clone of a function returned by the shim injection; fixed by returning primitive `true`;
3. harness result referenced undefined `durationSec`; corrected to `totalSec`;
4. long-task counter originally included startup/mount; reset immediately before the 30-second interaction trace so the gate measures normal interaction only.

None of these corrections change production Timeline code.

## Valid baseline result
Result marker: `UI_SPIKE_RESULT` with exit code 0.

Measured:
- first paint: **379.7 ms** — PASS;
- rendered clip blocks: **300**;
- trace duration: **32,876.5 ms**;
- interaction samples: **315**;
- interaction latency p95: **48.7 ms** — PASS;
- interaction latency max: **213.3 ms**;
- long task count during interaction: **105**;
- longest main-thread task: **1,660 ms** — **FAIL** (>500 ms);
- drag commit latency: **548.9 ms** — **FAIL** (>250 ms);
- renderer crash/OOM: none — PASS;
- JS heap at end: used ~21.7 MB, total ~72.2 MB, limit ~3.76 GB.

## Baseline verdict
**FAIL**.

The current non-virtualized production Timeline does not meet the fixed 300-clip responsiveness gate even though first paint and p95 interaction latency are acceptable. The two blocking measurements are long-task max and drag commit latency.

## Required next step
Create a disposable viewport-culling prototype derived from the current Timeline implementation, keeping the same authoritative 300-clip project state but rendering only clips intersecting the visible viewport plus a bounded buffer. Re-run the same harness. No production code may be changed or promoted during this spike.

## Disposable viewport-culling prototype
Prototype source was generated only under `.spike-temp/ui-harness/` from the current production Timeline and was never written into `apps/desktop/src/`.

Prototype changes were intentionally narrow:
- retain the same authoritative 300-clip `Project` and full `laneSegs` computation;
- retain production timeline duration/layout/drag/trim/snap behavior;
- track horizontal `scrollLeft`;
- render only clip blocks intersecting the visible time window plus a 12-second buffer on each side;
- leave the full project state untouched;
- no shadow timeline, no flattening, no production rewrite.

### Prototype result
Result marker: `UI_SPIKE_RESULT` with exit code 0.

Measured:
- first paint: **513.4 ms** — PASS;
- initial rendered clip blocks: **6** of 300 (authoritative state still contains all 300 clips);
- trace duration: **30,313.7 ms**;
- interaction samples: **363**;
- interaction latency p95: **11.8 ms** — PASS;
- interaction latency max: **309.8 ms**;
- long task count during interaction: **0**;
- longest main-thread task: **0 ms** — PASS;
- drag commit latency: **140.2 ms** — PASS;
- renderer crash/OOM: none; process exit code 0 — PASS;
- JS heap at end: used ~10.6 MB, total ~27.6 MB, limit ~3.76 GB.

Electron emitted one non-fatal GPU diagnostic (`GPU state invalid after WaitForGetOffsetInRange`) during shutdown/teardown, but the renderer did not crash, the result marker was produced, and process exit code was 0.

## Comparison
Baseline -> viewport-culling prototype:
- first paint: 379.7 ms -> 513.4 ms (both PASS; prototype still far below 5 s);
- p95 interaction: 48.7 ms -> 11.8 ms;
- long-task max: 1,660 ms -> 0 ms;
- drag commit: 548.9 ms -> 140.2 ms;
- rendered clip blocks: 300 -> 6 at initial viewport;
- end used JS heap: ~21.7 MB -> ~10.6 MB.

## Architecture consequence
The fixed gate is satisfied by a narrow horizontal viewport-culling strategy. Evidence does **not** justify replacing SynthCut's timeline model or UI architecture. Production implementation should preserve the authoritative project and add viewport-aware clip rendering (plus bounded indexing/memoization only as needed by later measured behavior).

## Final verdict
**PASS FOR SPIKE HYPOTHESIS.**

`TVE-SPIKE-UI-300` is complete. The baseline fails, but the required disposable virtualization/culling prototype proves a path that satisfies every fixed UI-300 acceptance threshold.
