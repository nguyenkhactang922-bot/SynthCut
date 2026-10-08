# TVE-IMP-007 — 300-clip timeline viewport culling / virtualization

Status: **PASS / VERIFIED**
Branch: `chatgpt/ai-video-editor-design`
Base HEAD at task verification: `52039c5f7e4b9f40cf5b637548a8ec690f64ff3b`

## Scope
Productionize the frozen `TVE-SPIKE-UI-300` viewport-culling strategy in the real desktop Timeline without changing the authoritative project/EDL model.

Production files:
- `apps/desktop/src/timeline.tsx`

Task verification harness:
- `apps/desktop/scripts/smoke-timeline-virtualization.mjs`

## Implementation
- Added rAF-throttled horizontal `scrollLeft` state.
- Computes visible time window from `scrollLeft`, viewport width and pixels-per-second, with a bounded 12-second buffer.
- Renders only clip blocks intersecting the visible window, while always retaining the selected/actively dragged clip.
- Renders only visible text/graphics/caption element bars.
- Renders only ruler ticks in the visible window + buffer.
- Keeps full `laneSegs`, full authoritative `Project`, duration and snap target semantics; virtualization is display-only.

## Static verification
After the final production-source repair (including ruler tick culling):
- desktop `tsc --noEmit`: **PASS / exit 0**
- renderer Vite production build: **PASS / exit 0** (recorded run: 11.86 s)
- focused `git diff --check`: **PASS / exit 0**

These gates were not rerun after harness-only diagnostic edits because `timeline.tsx` did not change.

## Runtime verification
Harness uses the real production `Timeline` component in Electron with an authoritative 300-clip / 1800-second fixture and one element bar per clip.

Several early harness runs were rejected as evidence because they exposed harness/environment defects rather than production behavior:
- generated launcher syntax error;
- absolute Vite `/assets/...` URLs under `file://`;
- hidden-window requestAnimationFrame throttling;
- non-deterministic Electron occlusion/background scheduling;
- diagnostic instrumentation producing per-render console traffic.

A profiler-only diagnostic (not acceptance evidence) showed that initial `Timeline()` JavaScript/model computation was ~148 ms and subsequent Timeline renders were sub-millisecond, so no additional production rewrite was justified from the noisy runs.

Final acceptance was rerun with all diagnostic instrumentation removed and the stable harness environment retained.

### Final clean acceptance result
Marker: `UI300_PRODUCTION_RESULT`
Exit code: `0`
Status: `PASS`

Observed metrics:
- authoritative clip count: **300**
- first paint: **185 ms** (`<= 5000 ms`)
- initial rendered clip DOM: **6**
- max rendered clip DOM during 30 s trace: **10**
- initial rendered element bars: **6**
- max rendered element bars: **10**
- interaction samples: **391**
- interaction p95: **6.2 ms** (`<= 100 ms`)
- interaction max: **7.7 ms**
- long task count: **0**
- longest long task: **0 ms** (`<= 500 ms`)
- selected visible: **1**
- selected after scrolling offscreen: **1**
- move commit delay: **0.2 ms**
- drag reflection: **6.2 ms** (`<= 250 ms`)
- renderer crashed: **false**
- failures: **[]**

## Acceptance verdict
PASS:
- full 300-clip project remains authoritative;
- DOM is bounded to the visible horizontal window + buffer;
- visible/offscreen selection survives culling;
- drag/move reflection meets threshold;
- pan/zoom/scrub p95 meets threshold;
- no normal long task >500 ms in the final clean trace;
- no renderer crash/OOM;
- static TypeScript/build gates pass.

## Review
Focused production diff reviewed. The change does not introduce a second timeline model, alter persistence/render truth, or weaken snapping/state semantics. Historical unrelated staged/WIP files are outside this task scope and must not be absorbed by the task commit.
