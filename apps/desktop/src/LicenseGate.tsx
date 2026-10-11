import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { LicenseResult } from "./types";

type GateState =
  | { phase: "checking"; result: LicenseResult | null }
  | { phase: "locked"; result: LicenseResult | null }
  | { phase: "valid"; result: LicenseResult };

function messageFor(code?: string): string {
  switch (code) {
    case "LICENSE_REQUIRED": return "Enter your Tang AI Video Editor license key to continue.";
    case "INVALID_LICENSE_FORMAT": return "This license key format is not valid.";
    case "NOT_FOUND": return "This license key was not found.";
    case "INACTIVE": return "This license key has been disabled.";
    case "EXPIRED": return "This license key has expired.";
    case "DEVICE_LIMIT": return "This license has reached its device limit.";
    case "NETWORK_TIMEOUT": return "License verification timed out. Check your internet connection and retry.";
    case "NETWORK_ERROR": return "Could not reach the license server. Check your internet connection and retry.";
    case "SECURE_STORAGE_UNAVAILABLE": return "Windows secure credential storage is unavailable for this account.";
    case "SERVER_CONFIG":
    case "SERVER_ERROR": return "The license service is temporarily unavailable. Please retry shortly.";
    default: return code ? `License verification failed (${code}).` : "A valid license is required.";
  }
}

export function LicenseGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ phase: "checking", result: null });
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!window.aive?.licenseStatus) {
      // Plain-browser renderer development has no Electron bridge. Do not make
      // browser-only UI work dependent on the hosted commercial license service.
      setState({ phase: "valid", result: { ok: true, code: "BROWSER_DEV_BYPASS", stored: false } });
      return;
    }
    window.aive.licenseStatus().then((result) => {
      if (cancelled) return;
      setState(result.ok ? { phase: "valid", result } : { phase: "locked", result });
    }).catch(() => {
      if (!cancelled) setState({ phase: "locked", result: { ok: false, code: "NETWORK_ERROR" } });
    });
    return () => { cancelled = true; };
  }, []);

  async function activate(e: FormEvent) {
    e.preventDefault();
    const candidate = key.trim();
    if (!candidate || !window.aive?.activateLicense) return;
    setBusy(true);
    try {
      const result = await window.aive.activateLicense(candidate);
      if (result.ok) {
        setKey("");
        setState({ phase: "valid", result });
      } else {
        setState({ phase: "locked", result });
      }
    } catch {
      setState({ phase: "locked", result: { ok: false, code: "NETWORK_ERROR" } });
    } finally {
      setBusy(false);
    }
  }

  async function retryStored() {
    if (!window.aive?.licenseStatus) return;
    setBusy(true);
    try {
      const result = await window.aive.licenseStatus();
      setState(result.ok ? { phase: "valid", result } : { phase: "locked", result });
    } finally {
      setBusy(false);
    }
  }

  if (state.phase === "valid") return <>{children}</>;

  return (
    <main className="license-shell">
      <section className="license-card" aria-live="polite">
        <div className="license-brand">
          <span className="brand-mark" aria-hidden="true">T</span>
          <div>
            <h1>Tang AI Video Editor</h1>
            <p>Commercial license verification</p>
          </div>
        </div>

        {state.phase === "checking" ? (
          <div className="license-checking">Checking saved license…</div>
        ) : (
          <>
            <div className="license-message">{messageFor(state.result?.code)}</div>
            <form className="license-form" onSubmit={activate}>
              <label htmlFor="license-key">License key</label>
              <input
                id="license-key"
                className="license-input"
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="TAIVE-XXXXX-XXXXX-XXXXX-XXXXX-XXXXXX"
                disabled={busy}
                autoFocus
              />
              <button className="btn btn-primary btn-block" type="submit" disabled={busy || key.trim().length < 20}>
                {busy ? "Verifying…" : "Activate license"}
              </button>
            </form>
            {state.result?.stored && (
              <button className="btn btn-ghost btn-block" type="button" onClick={retryStored} disabled={busy}>
                Retry saved license
              </button>
            )}
            <div className="license-foot">
              The key is encrypted with Windows secure storage on this device. Supabase backend secrets are not stored in the app.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
