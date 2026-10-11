# TVE-REL-006 — Local Packaged Acceptance

Status: **PASS**
Date: 2026-10-10
Branch: `chatgpt/phase7-commercial-release`
Accepted source commit: `225a987dfb5490949ba107eac4c9e0dd0c74499b`
Publication: **NONE**

## Input
Release-configured source after the packaged-MCP bundled-asset repair, project-local staged runtime resources, and the Windows `1.0.6` package candidate under `apps/desktop/build/rel006-rerun3-dist`.

## Entry Gate
- TVE-REL-005 PASS / COMMITTED `227535b`.
- Packaged MCP env repair committed and checkpointed (`fe6e27b`, then state checkpoint `225a987`).
- Prior product/runtime baseline remains MAIN VERIFIED at `personal/main@af92f20`.
- Public commercial release remains disabled.

## Work
Only affected REL-006 release/package/runtime acceptance was resumed. Previously valid IMP/E2E gates were not rerun.

The accepted candidate was staged and packaged without publishing, then checked for artifact integrity, bundled-resource provenance, packaged MCP/core resolution, project save/open behavior, representative export, local installer execution, installed application launch, update metadata, and signature state.

A bounded follow-up audit evaluated the pre-existing `asar=false` packaging-hardening observation. An ASAR smoke candidate packaged successfully, but the existing MCP launch contract uses a script path inside `app.asar`, which closes immediately under the current `ELECTRON_RUN_AS_NODE` invocation unless additional launcher/unpack work is introduced. The experimental ASAR source change was therefore reverted and is **not** part of the accepted REL-006 source. This is a deferred hardening item, not an REL-006 exit-gate requirement.

## Output
A locally accepted Windows test candidate with NSIS + ZIP artifacts and packaged-runtime acceptance evidence. No tag, push, GitHub Release, npm publish, deploy, or external publication occurred.

## Exit Gate
**PASS** — installer + ZIP artifact integrity PASS and packaged runtime smoke PASS.

The REL-006 plan requires a representative export, not exhaustive codec/input-matrix certification. The accepted representative export is H.264 + AAC. A later exploratory video-only edge-case probe did not reach a valid export verdict because its MCP startup diagnostic was affected by startup latency; it is not claimed as PASS or FAIL and does not replace the frozen representative-export gate.

## Artifact
Accepted package/runtime artifacts:
- `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe`
- `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.zip`
- `apps/desktop/build/rel006-rerun3-dist/Tang-AI-Video-Editor-1.0.6.exe.blockmap`
- `apps/desktop/build/rel006-rerun3-dist/latest.yml`
- `apps/desktop/build/rel006-rerun3-dist/SHA256SUMS.txt`
- `apps/desktop/build/rel006-rerun3-dist/win-unpacked/`
- `apps/desktop/build/rel006-rerun3-release-artifacts/`
- `.tmp/rel006-install4-exit.json`
- `.tmp/rel006-installed4/`
- `.tmp/rel006-packaged-project.aive`
- `.tmp/rel006-packaged-project.tang.json`
- `.tmp/rel006-packaged-export-av.mp4`
- `.tmp/rel006-packaged-mcp-pass.mjs`

Diagnostic-only, non-accepted ASAR evidence is retained under `apps/desktop/build/rel006-asar-smoke2/` and `.tmp/rel006-asar-*`.

## Evidence
### Clean/staged provenance
- Bundle manifest: `sourceCommit=225a987dfb5490949ba107eac4c9e0dd0c74499b`.
- Bundle manifest: `sourceTrackedDirty=false`.
- Bundled FFmpeg/FFprobe resource path was used for packaged MCP and export acceptance.

### Package artifacts
Observed final rerun3 artifact sizes:
- NSIS: `397,648,957` bytes.
- ZIP: `505,855,006` bytes.
- NSIS blockmap: `408,926` bytes.
- `latest.yml`: `357` bytes.
- `SHA256SUMS.txt`: `194` bytes.

SHA-256:
- ZIP: `59aa55f8aff9395f45408b93565385d8262e6610bb48da0848597b68231c7478`.
- NSIS: `754138d0e683cb10828f1b7fcc125ea71e1443c9a03b63e54a8e63f0c4442ab0`.

The release artifact validator previously PASSed the 10-file assembled set. ZIP payload, `latest.yml`, compliance/provenance resources and checksums were inspected and PASSed.

### Packaged MCP/core/resource resolution
After the bundled-env repair, the packaged standalone MCP acceptance PASSed using the packaged Electron binary in Node mode and bundled AIVE resource overrides. `import_video` succeeded with bundled FFmpeg/FFprobe while PATH was restricted to Windows system directories. Marker observed during acceptance: `REL006_PACKAGED_MCP_OFFLINE_PASS`.

### Project save/open
Packaged project save/open acceptance PASSed. Durable fixture outputs remain:
- `.tmp/rel006-packaged-project.aive` — `882` bytes.
- `.tmp/rel006-packaged-project.tang.json` — `129` bytes.

### Representative export
Packaged representative export PASSed using bundled FFmpeg:
- file: `.tmp/rel006-packaged-export-av.mp4`
- duration: `4.000000` s
- size: `250,897` bytes
- video: H.264, `320x180`, `25/1` fps
- audio: AAC

### Installer
`.tmp/rel006-install4-exit.json` records:
- `status=EXITED`
- `exitCode=0`
- target `E:\SynthCut\.tmp\rel006-installed4`
- finished `2026-10-10T00:08:17.4981482+07:00`

Installed executable exists at `.tmp/rel006-installed4/Tang AI Video Editor.exe` (`232,375,296` bytes).

### Installed launch
Installed desktop runtime launch was observed PASS after first-run resource initialization: main window title `Tang AI Video Editor`, non-zero window handle, renderer process present, bundled core child present, and `server.json` published on port 4789. Test process tree was then closed cleanly.

### Update metadata
`latest.yml` declares version `1.0.6`, installer path `Tang-AI-Video-Editor-1.0.6.exe`, size `397,648,957`, and the candidate package configuration remains fork-owned by `nguyenkhactang922-bot/SynthCut` from REL-002/005.

### Signature state
Installer Authenticode state is `NotSigned`. This is expected and is **not** waived: trusted Windows signing is a hard REL-007 gate before a public commercial-ready release.

### ASAR hardening assessment
- `asar=true` smoke package candidate: PASS / exit 0.
- Native runtime binaries were materialized in `app.asar.unpacked`.
- Current packaged MCP script path inside `app.asar` is incompatible with the existing external `ELECTRON_RUN_AS_NODE` MCP invocation without additional launcher/path work; MCP acceptance on the ASAR candidate closed before handshake.
- Experimental `apps/desktop/package.json` ASAR change was reverted. Accepted REL-006 source remains unchanged by this experiment.

## Owner / Authority
ChatGPT Web owns technical acceptance judgment. FileMCP-E executed local build/package/runtime verification. Product owner/external providers retain authority for Remotion commercial basis and Windows signing credentials/services at REL-007.

## Risks / Open Questions
- Artifacts are unsigned test candidates only. Public/stable commercial-ready release remains prohibited until REL-007 PASS.
- A valid Remotion commercial/redistribution basis remains unresolved at REL-007.
- `asar=false` remains a deferred packaging-hardening item because enabling ASAR requires a bounded MCP/core launcher-path design change; it is not silently treated as resolved.
- Exploratory video-only export behavior is not certified by this representative-export gate; if required as a release requirement, create a bounded follow-up bug/acceptance task instead of retroactively expanding REL-006.

## Loopback
- Package/config defects: reopen the owning REL task, normally REL-006.
- Actual editor/runtime regression: reopen the owning IMP task with contradictory runtime evidence.
- Signing/Remotion authorization failure: remain at REL-007; do not reopen REL-006.
