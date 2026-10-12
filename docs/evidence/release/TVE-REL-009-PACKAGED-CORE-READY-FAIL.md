# TVE-REL-009 — Packaged Core Readiness Failure

Status: **FAIL — bounded REL-009 runtime repair required**
Date: 2026-10-12
Task: `TVE-REL-009 — Installed updater E2E + stable verification`

## Retained PASS checkpoints
- TVE-REL-001..008 remain PASS.
- Published `v1.1.0`, `v1.1.1`, and `v1.1.2` remain immutable historical evidence.
- PR #11 updater-coordination repair is merged on personal `main@196dccb6affae074d66c9233d97086b384e40609`.
- Release run `38237764462` is SUCCESS and public `v1.1.2` metadata/provenance/hash verification is PASS.
- Existing controlled lower-version fixture `.tmp/rel009-fixed-lower-dist` is healthy, contains the repaired coordinator, 224 production module directories and `electron-updater`, and is intentionally `NotSigned`.
- Fresh fixture install `.tmp/rel009-fixed-e2e-install` completed exit `0` and produced version `1.1.1.0`.

## Failed runtime attempt
The fixed-code owned-core E2E launched the fresh controlled 1.1.1 install with:
- project-local userData/APPDATA/LOCALAPPDATA/TEMP;
- new project-local `AIVE_DATA_DIR`;
- dedicated `AIVE_PORT=48712`;
- existing encrypted `license.json` and preserved project/user-state markers.

Observed evidence under `.tmp/rel009-fixed-e2e-owned`:
- app PID `128244` started;
- core wrote `server.json` for port `48712`, PID `136700`;
- core stderr logged FFmpeg readiness, `listening on http://127.0.0.1:48712`, and the exact project-local data dir;
- harness recorded `REL009_OWNED_CORE_STARTED=PASS pid=136700 port=48712`;
- however the desktop never logged `[aive] started core on port 48712`, never created a durable renderer/update flow, then quit; its owned core also exited;
- no updater download/install side effect was started in this attempt.

The harness was stopped after app/core disappearance made further waiting incapable of producing a valid updater result. It was not restarted.

## Root-cause isolation
`apps/desktop/electron/core-launcher.cjs` resolves a newly spawned core only when it receives a JSON `{event:"ready"}` line from the child **stdout**. It rejects after 20 seconds otherwise.

`packages/core/src/cli.ts` does emit that JSON line, but the packaged Electron child in this runtime did not deliver the stdout line to the launcher even though the same core was demonstrably healthy and had published authoritative `server.json` state.

This failure pattern is consistent with earlier packaged-runtime evidence where the core listened and wrote state while the launching Electron instance failed to receive the ready stdout marker.

Therefore the remaining defect is startup readiness detection, not core health and not updater publication.

## Narrow repair contract
Keep the JSON stdout path as the fast path. Add a fail-closed fallback for a core **spawned by this launcher only**:
1. poll `<AIVE_DATA_DIR>/server.json` during the existing startup timeout;
2. accept it only when `server.json.pid === child.pid` and it contains a valid port;
3. require the existing `/health` probe to PASS before resolving;
4. return token from the same authoritative server record;
5. never attach to a mismatched PID through this fallback;
6. preserve existing timeout/child-exit/error failure behavior.

Add deterministic smoke coverage using a fake child core that becomes healthy and writes matching `server.json` but deliberately emits no stdout ready JSON.

## Loopback
Repair only REL-009 packaged core readiness + dependent release-forward metadata. Do not rerun REL-001..008 and do not mutate already-published releases in place. If a public fixed artifact is required, release-forward to the next immutable version.
