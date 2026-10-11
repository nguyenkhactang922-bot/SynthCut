# TVE — Supabase Commercial License Backend Evidence

Status: **PASS — BACKEND PROVISIONED / FOUNDER KEY CREATED**
Date: 2026-10-11
Project: `Tang AI Video Editor`
Supabase project ref: `ljygpbxkxmsuhdfpfgml`
Endpoint: `https://ljygpbxkxmsuhdfpfgml.supabase.co/functions/v1/tve-license-authority`

## Decision context
The product owner explicitly declined purchasing a paid Windows code-signing certificate/service at this time and asked to use Supabase for commercial license keys instead.

Supabase licensing and Windows Authenticode are separate concerns. This backend controls entitlement, device limits, expiry/revocation and plan state; it does not make an unsigned Windows executable trusted by SmartScreen.

## Implemented backend
Created isolated Tang AI Video Editor tables so existing license systems in the same Supabase project are not modified:
- `public.tve_license_keys`
- `public.tve_license_devices`
- `public.tve_license_events`

Security posture:
- RLS enabled on all three tables.
- direct privileges for `anon` and `authenticated` revoked.
- plaintext license keys are never stored; only SHA-256 hashes and a short non-secret prefix are stored.
- device identifiers are SHA-256 hashed before persistence.

Created transactional RPC:
- `public.tve_activate_license(text,text,text,text)`
- `SECURITY INVOKER`
- row-locks the license record before device-count checks to prevent concurrent over-activation.
- direct execute privilege removed from `PUBLIC`, `anon`, and `authenticated`; granted only to `service_role`.

Deployed Edge Function:
- slug: `tve-license-authority`
- version: `1`
- `verify_jwt=false` intentionally because the license key itself is the custom authentication credential.
- backend admin secret remains inside Supabase runtime; it is not shipped in the desktop client or repository.
- `@supabase/supabase-js` pinned to `2.117.3`.

## Founder/admin commercial key
One production-capable founder/admin key was created with:
- prefix: `TAIVE-F3E3Y`
- plan: `commercial`
- status: `active`
- max devices: `3`
- expiry: none
- current active devices after test cleanup: `0`

The full plaintext key is intentionally NOT stored in Git/repo evidence. Supabase stores only its SHA-256 hash.

## Verification
Database authority verification:
- device 1 -> `VALID`, activeDevices=1
- device 2 -> `VALID`, activeDevices=2
- device 3 -> `VALID`, activeDevices=3
- device 4 -> `DEVICE_LIMIT`, maxDevices=3, activeDevices=3

HTTPS Edge Function verification:
- real POST to `/functions/v1/tve-license-authority`
- result: `ok=true`, `code=VALID`, `plan=commercial`, `maxDevices=3`, `activeDevices=1`
- test device/event rows were then removed.
- final founder key state rechecked: activeDevices=0.

Security verification:
- `anon`/`authenticated` table grants for all `tve_license_*` tables: none.
- Supabase security advisor reports `RLS Enabled No Policy` at INFO level for the new tables; this is intentional because the tables are service-only and have no direct public/authenticated policy.

## Commercial implication
This backend is sufficient to implement paid entitlement/license-key control without buying a Windows signing certificate. The Windows installer can still be distributed unsigned, but users may see `Unknown publisher` / Microsoft Defender SmartScreen warnings until trusted signing is added later.

## Next implementation slice
Integrate the desktop app with `tve-license-authority`:
1. activation UI/input;
2. stable local device identifier;
3. startup validation and graceful offline policy;
4. plan/expiry/device-limit UX;
5. revoke/deactivate/admin flow;
6. package smoke/E2E with a non-production test license.

Do not embed Supabase secret/service-role keys in the desktop app.
