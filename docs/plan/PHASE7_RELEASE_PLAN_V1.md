# PHASE 7 RELEASE PLAN V1 — B + C

Status: FROZEN FOR EXECUTION
Date: 2026-10-09
Baseline: `personal/main@af92f20` MAIN VERIFIED
Branch: `chatgpt/phase7-commercial-release`

## Goal
Produce a fork-owned Windows release path that can publish NSIS + ZIP to `nguyenkhactang922-bot/SynthCut` and can be called commercially ready only after GPL/source, third-party licensing, provenance, release-tool security, branding/updater, signing and packaged-runtime gates pass.

## Dependency graph

`REL-001 Scope/Audit/ADR`
→ `REL-002 Fork identity + updater ownership`
→ `REL-003 Third-party provenance/source compliance`
→ `REL-004 Release-tool security hardening`
→ `REL-005 Release workflow + version/release metadata`
→ `REL-006 Local packaged acceptance`
→ `REL-007 External commercial gates (Remotion + signing)`
→ `REL-008 GitHub release candidate/stable publication`
→ `REL-009 Installed updater E2E + release verification`
→ `REL-010 Monitor/incident handoff`

No task may skip a failed predecessor. Previous IMP/E2E evidence is retained and reused where still valid.

---

## TVE-REL-001 — Commercial scope re-entry / audit / ADR
Status: DONE/PASS
Dependencies: MAIN VERIFIED + user `B+C` authorization

### Input
Old noncommercial freeze, current repo config, current public license documentation.
### Entry Gate
Commercial distribution explicitly authorized.
### Work
Freeze release scope; audit GPL/Remotion/FFmpeg/branding/updater/signing/security; record ADR.
### Output
Commercial scope + audit + ADR + this plan.
### Exit Gate
All commercial unknowns are explicit hard gates/tasks.
### Artifact
- `docs/define/COMMERCIAL_RELEASE_SCOPE_V1.md`
- `docs/research/COMMERCIAL_REDISTRIBUTION_AUDIT_V1.md`
- `docs/adr/ADR-002_COMMERCIAL_RELEASE_DISTRIBUTION.md`
- `docs/plan/PHASE7_RELEASE_PLAN_V1.md`
### Evidence
Repo configuration + authoritative license/release documentation.
### Owner/Authority
ChatGPT Web; product intent authorized by user.
### Risks/Open Questions
External Remotion/signing authority still pending.
### Loopback
DEFINE/RESEARCH if scope/license facts change.

---

## TVE-REL-002 — Fork identity + updater ownership
Status: READY
Dependencies: REL-001 PASS

### Input
ADR-002 fork identity decision.
### Entry Gate
REL-001 PASS.
### Work
Replace package/runtime release identity with `Tang AI Video Editor`; assign a distinct Windows app id/AppUserModelID; repoint electron-builder GitHub provider to `nguyenkhactang922-bot/SynthCut`; update installer strings and updater UX; preserve upstream notices.
### Output
Fork-owned package/update identity with no runtime publication reference to `Relo-video`.
### Exit Gate
Static identity scan PASS; root typecheck/build PASS; updater metadata source resolves to fork config.
### Artifact
Task-scoped source/config diff + evidence record.
### Evidence
`git grep`, typecheck/build and package metadata inspection.
### Owner/Authority
ChatGPT Web.
### Risks/Open Questions
Visual icon asset may still carry upstream styling; audit separately before stable publication.
### Loopback
REL-002 only unless a license issue is discovered.

---

## TVE-REL-003 — Third-party provenance + corresponding-source compliance
Status: BLOCKED BY REL-002
Dependencies: REL-002 PASS

### Input
Current bundle staging, third-party notices, release workflow.
### Entry Gate
Fork package identity stable.
### Work
Make bundled FFmpeg provenance deterministic/recorded; capture exact version/build source; emit release compliance/provenance data; ensure THIRD_PARTY_LICENSES/source instructions ship with artifacts.
### Output
Release-provenance manifest and source-compliance evidence.
### Exit Gate
Every redistributed binary/model/license item has a deterministic identity/source path; FFmpeg corresponding-source path is explicit for the exact release build.
### Artifact
Bundle/release provenance manifest + evidence.
### Evidence
Staging logs, binary version/hash, release artifact inspection.
### Owner/Authority
ChatGPT Web.
### Risks/Open Questions
Chocolatey `ffmpeg` is currently unpinned and must not remain ambiguous for stable commercial release.
### Loopback
REL-003 on provenance failure; RESEARCH on license contradiction.

---

## TVE-REL-004 — Release-tool dependency security hardening
Status: BLOCKED BY REL-003
Dependencies: REL-003 PASS

### Input
TVE-IMP-009 carried packaging-chain findings and current lockfile/tool versions.
### Entry Gate
Production runtime audit remains valid; package toolchain is now the only reopened security surface.
### Work
Run focused packaging-chain audit; update/remediate electron-builder-related development dependencies where feasible; prove package/build compatibility.
### Output
Release-tool security decision and verified lockfile/toolchain.
### Exit Gate
No unresolved blocker-level vulnerability accepted silently; any residual finding has documented non-runtime exposure and release rationale.
### Artifact
Security evidence record + dependency diff if required.
### Evidence
`npm audit`, dependency tree, typecheck/build/package smoke.
### Owner/Authority
ChatGPT Web.
### Risks/Open Questions
Major tool upgrade may require config migration; do not change unrelated runtime dependencies.
### Loopback
REL-004 only unless a runtime regression exposes owning IMP code.

---

## TVE-REL-005 — Release workflow + version metadata hardening
Status: BLOCKED BY REL-004
Dependencies: REL-004 PASS

### Input
Fork identity, provenance and hardened packaging toolchain.
### Entry Gate
REL-002..004 PASS.
### Work
Harden GitHub release workflow for fork-only publication; validate manual workflow artifacts before tag publication; align version files; prevent npm publication under upstream namespace; include all update/integrity/compliance artifacts.
### Output
Deterministic release workflow targeting the user's fork.
### Exit Gate
Manual/non-publishing workflow path PASS; tag path statically verified; version alignment PASS.
### Artifact
Workflow/config diff + evidence.
### Evidence
Workflow inspection, dry-run/manual CI where possible, artifact list validation.
### Owner/Authority
ChatGPT Web.
### Risks/Open Questions
GitHub Actions execution depends on remote branch/workflow availability.
### Loopback
REL-005.

---

## TVE-REL-006 — Local packaged acceptance
Status: BLOCKED BY REL-005
Dependencies: REL-005 PASS

### Input
Release-configured source and project-local staged resources.
### Entry Gate
Release workflow/config verification PASS.
### Work
Build Windows NSIS + ZIP without publishing; inspect artifacts; install/launch packaged app; verify core/MCP/resource resolution, project open/save and representative export; verify update metadata points to fork; verify hashes/licenses/provenance.
### Output
Package acceptance evidence.
### Exit Gate
Installer + ZIP artifact integrity PASS and packaged runtime smoke PASS.
### Artifact
Project-local package evidence; large outputs may be retained/cleaned according to project policy after hashes/metadata are recorded.
### Evidence
Build exit codes, file hashes, packaged smoke/runtime logs.
### Owner/Authority
ChatGPT Web/FileMCP-E.
### Risks/Open Questions
Unsigned artifacts may now proceed to the explicitly approved unsigned-commercial lane only after REL-007 entitlement + risk-acceptance evidence PASS; otherwise they remain test candidates.
### Loopback
Owning REL task for package/config defects; owning IMP only for actual runtime regression.

---

## TVE-REL-007 — Commercial authorization + entitlement gate
Status: ACTIVE STRATEGY LOOPBACK
Dependencies: REL-006 PASS

### Input
Accepted package candidate, Remotion basis, explicit owner approval for unsigned commercial distribution, and the Supabase commercial license backend.
### Entry Gate
REL-006 PASS; `REMOTION_LICENSE_GATE=PASS`; owner explicitly accepts `Unknown publisher` / SmartScreen risk for the unsigned lane.
### Work
Preserve Remotion commercial evidence; verify the Supabase license authority; integrate desktop activation/startup checks; record intentional unsigned status; keep trusted signing as an optional future hardening path rather than a mandatory current gate.
### Output
`REMOTION_LICENSE_GATE=PASS`, `SUPABASE_LICENSE_BACKEND=PASS`, `UNSIGNED_COMMERCIAL_RELEASE_APPROVED=true`, desktop license activation/startup/device-limit verification PASS, and explicit `NotSigned` release evidence.
### Exit Gate
Entitlement enforcement PASS; package is intentionally unsigned and risk acceptance is durable; no claim of Authenticode trust is made.
### Artifact
Non-secret licensing/unsigned-release evidence records. Plaintext customer license keys and backend secret keys must never be committed.
### Evidence
Remotion basis + Supabase DB/Edge Function verification + desktop activation E2E + Authenticode `NotSigned` observation + owner risk acceptance.
### Owner/Authority
Product owner authorizes unsigned distribution and commercial terms; ChatGPT Web verifies observable implementation/evidence; Supabase controls hosted backend availability.
### Risks/Open Questions
SmartScreen/Unknown-publisher warnings can reduce installation trust/conversion. Trusted signing remains a future hardening option.
### Loopback
REL-007 for entitlement defects; DEFINE/ADR if commercial trust policy changes; optional signing path if owner later adopts a certificate/service.

---

## TVE-REL-008 — GitHub Release publication
Status: BLOCKED BY REL-007
Dependencies: REL-007 PASS

### Input
Unsigned-but-explicitly-approved, license-cleared package candidate with Supabase entitlement verification and a reviewed release commit.
### Entry Gate
REL-001..007 PASS; no existing tag/release collision; GitHub auth/write authority verified.
### Work
Push reviewed branch/PR as required; merge; verify release commit; create exact release tag; publish Windows artifacts/update metadata to `nguyenkhactang922-bot/SynthCut` only.
### Output
Published GitHub Release.
### Exit Gate
Release is visible, artifacts/checksums/source tag match, no upstream repo mutated.
### Artifact
GitHub release URL/tag + evidence record.
### Evidence
Git refs, GitHub release metadata, downloaded artifact hashes.
### Owner/Authority
ChatGPT Web with user-authorized fork write scope.
### Risks/Open Questions
Publication is irreversible in user experience; inspect existing state before every retry.
### Loopback
REL-008 for publication defects; release forward with higher version rather than silently overwriting shipped artifacts.

---

## TVE-REL-009 — Installed updater E2E + stable verification
Status: BLOCKED BY REL-008
Dependencies: REL-008 PASS

### Input
Published release/update feed and an installed older fork build or controlled prerelease pair.
### Entry Gate
Published update metadata is valid.
### Work
Verify installed fork queries only the fork feed, discovers the newer version, downloads it, validates artifact hashes/update metadata and intentional unsigned status, installs/relaunches, preserves project/user state, and revalidates the Supabase license after restart.
### Output
Updater E2E evidence.
### Exit Gate
End-to-end update PASS with no upstream feed access or identity collision.
### Artifact
Updater evidence/log.
### Evidence
Installed app logs, version transition, release-feed/hash inspection, intentional `NotSigned` observation, and post-relaunch license validation.
### Owner/Authority
ChatGPT Web/FileMCP-E.
### Risks/Open Questions
Requires at least two package versions for a true update transition.
### Loopback
REL-002/005/007 depending on feed, artifact-integrity, unsigned-status, or entitlement defect.

---

## TVE-REL-010 — Monitor / incident handoff
Status: BLOCKED BY REL-009
Dependencies: REL-009 PASS

### Input
Verified published release.
### Entry Gate
Stable release and updater E2E PASS.
### Work
Record release health checks, known issues, rollback/forward-fix procedure, support/source/license references and next monitoring action.
### Output
Phase-7 completion handoff.
### Exit Gate
Release is operationally supportable; exact next action exists.
### Artifact
Release evidence + CURRENT_HANDOFF/PROJECT_STATE/TASK_QUEUE synchronization.
### Evidence
Release/runtime/update observations.
### Owner/Authority
ChatGPT Web/product owner.
### Risks/Open Questions
Future defects loop to the smallest owning stage.
### Loopback
Owning REL/IMP stage based on evidence.

## Phase-7 completion definition
For the current owner-approved unsigned lane, final state is `COMMERCIAL_READY_UNSIGNED=true` only after REL-001..010 all PASS, Supabase entitlement enforcement is verified, GitHub release/updater E2E PASS, and durable evidence records intentional `NotSigned` status plus accepted `Unknown publisher` / SmartScreen risk. `COMMERCIAL_READY_SIGNED=true` remains reserved for a future trusted-signing lane.
