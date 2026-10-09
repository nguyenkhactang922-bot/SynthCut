# TVE-REL-002 — Fork identity + updater ownership

Status: PASS / VERIFIED
Date: 2026-10-09
Branch: `chatgpt/phase7-commercial-release`
Baseline: `af92f20` (`personal/main` MAIN VERIFIED before Phase-7 changes)

## Input
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
- current desktop Electron/package/renderer identity.

## Entry Gate
PASS: `TVE-REL-001` commercial scope/audit/ADR/plan completed and fork identity direction is frozen.

## Work
Changed only the fork-distribution identity/update ownership surface:
- packaged display name -> `Tang AI Video Editor`;
- Windows app id/AppUserModelID -> `com.tang.aivideoeditor` (`.dev` for development);
- electron-builder GitHub publish provider -> `nguyenkhactang922-bot/SynthCut`;
- installer shortcut/uninstall names -> `Tang AI Video Editor`;
- artifact base name -> `Tang-AI-Video-Editor-${version}`;
- updater dialog uses the current fork `APP_NAME`;
- renderer HTML title -> `Tang AI Video Editor`;
- removed the visible/imported `relo-logo` and `SynthCut by Relo` header branding from the renderer;
- preserved `GPL-3.0-or-later` and upstream provenance wording rather than pretending the base is proprietary.

The internal workspace package name `synthcut-by-relo` was intentionally left unchanged in this task because it is an internal npm-workspace selector used by build scripts, not the distributed product identity. Renaming it would create unrelated dependency/build churn and is not required to stop upstream update/branding impersonation.

## Output
Fork-owned desktop identity and update feed configuration.

## Verification

### Static upstream-identity scan
Command scope: `apps/desktop/src`, `apps/desktop/electron`, `apps/desktop/index.html`, `apps/desktop/package.json`.

Forbidden identity patterns:
- `SynthCut by Relo`
- `by Relo`
- `com.relo.synthcut`
- `Relo-video`

Result: PASS — no matches in the distributed desktop source/config scope.

### Expected identity assertion
Parsed `apps/desktop/package.json` and asserted:
- `productName = Tang AI Video Editor`
- `appId = com.tang.aivideoeditor`
- publish owner = `nguyenkhactang922-bot`
- publish repo = `SynthCut`
- artifact name = `Tang-AI-Video-Editor-${version}.${ext}`
- installer identity = `Tang AI Video Editor`

Result: PASS / exit 0.

### Typecheck
First invocation through the ambiguous `npm.cmd` resolver failed before project scripts ran because Node tried to load a missing local npm shim under `E:\SynthCut\node_modules\npm\bin`. This was an execution-path problem, not a code/test failure.

The actual installed npm executable was resolved as `C:\Program Files\nodejs\npm.cmd` and only the failed verification stage was rerun.

- root typecheck before renderer-logo repair: PASS / exit 0;
- desktop typecheck after final renderer-logo repair: PASS / exit 0.

### Build
- root build before renderer-logo repair: PASS / exit 0 and revealed that `relo-logo` was still bundled;
- the branding gap was repaired without reopening earlier gates;
- final renderer production build: PASS / exit 0, 37 modules transformed;
- final build output contains only `index.html`, CSS and JS chunks and no `relo-logo` asset.

### Packaged-renderer content scan
Scanned `apps/desktop/dist/renderer` for upstream identity patterns and `relo-logo`.

Result: `PACKAGED_RENDERER_BRAND_SCAN=PASS` / exit 0.

### Diff quality
`git diff --check` on the REL-002 desktop files: PASS / exit 0.

Focused diff review: PASS; changes are limited to release identity, updater ownership and visible fork branding.

## Exit Gate
PASS:
- no distributed desktop source/config reference points at `Relo-video` or `com.relo.synthcut`;
- fork product identity is distinct;
- updater provider points to the user's fork;
- visible upstream logo/name was removed from the renderer bundle;
- typecheck/build/renderer scan/diff check PASS;
- no package or release was published.

## Artifact
- `apps/desktop/package.json`
- `apps/desktop/electron/main.cjs`
- `apps/desktop/index.html`
- `apps/desktop/src/App.tsx`
- `apps/desktop/src/styles.css`
- `docs/evidence/release/TVE-REL-002.md`

## Evidence
This record plus command outputs from the task execution.

## Owner / Authority
ChatGPT Web owns verification judgment; FileMCP-E executed local checks.

## Risks / Open Questions
- `apps/desktop/build/icon.ico` is not yet asserted as fork-owned visual branding; stable publication requires the brand/artwork audit in the release lane.
- Internal workspace/package identifiers containing `relo` remain allowed unless they leak into distributed user-facing identity or conflict with future package publication.

## Loopback
- User-facing/updater identity defect -> REL-002.
- Release workflow/version defect -> REL-005.
- Artwork/license contradiction -> REL-003/RESEARCH as appropriate.
