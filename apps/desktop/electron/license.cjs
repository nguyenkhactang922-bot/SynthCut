const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { app, safeStorage } = require("electron");

const LICENSE_ENDPOINT = "https://ljygpbxkxmsuhdfpfgml.supabase.co/functions/v1/tve-license-authority";
const REQUEST_TIMEOUT_MS = 10000;

function statePath() {
  return path.join(app.getPath("userData"), "license.json");
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(statePath(), "utf8"));
  } catch {
    return {};
  }
}

function writeState(state) {
  fs.mkdirSync(path.dirname(statePath()), { recursive: true });
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2), { encoding: "utf8", mode: 0o600 });
}

function ensureDeviceId(state) {
  if (typeof state.deviceId === "string" && state.deviceId.length >= 8) return state.deviceId;
  state.deviceId = crypto.randomUUID();
  writeState(state);
  return state.deviceId;
}

function normalizeKey(value) {
  return String(value || "").trim().toUpperCase().replace(/\s+/g, "");
}

function encryptKey(licenseKey) {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("Secure credential storage is unavailable on this Windows account.");
  }
  return safeStorage.encryptString(licenseKey).toString("base64");
}

function decryptKey(encoded) {
  if (!encoded || !safeStorage.isEncryptionAvailable()) return null;
  try {
    return safeStorage.decryptString(Buffer.from(encoded, "base64"));
  } catch {
    return null;
  }
}

async function validateRemote(licenseKey, deviceId) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(LICENSE_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        licenseKey,
        deviceId,
        platform: `${process.platform}-${process.arch}`,
        appVersion: app.getVersion(),
      }),
      signal: controller.signal,
    });
    const body = await res.json().catch(() => ({ ok: false, code: "INVALID_SERVER_RESPONSE" }));
    if (!res.ok && !body.code) body.code = `HTTP_${res.status}`;
    return body;
  } catch (err) {
    return {
      ok: false,
      code: err && err.name === "AbortError" ? "NETWORK_TIMEOUT" : "NETWORK_ERROR",
    };
  } finally {
    clearTimeout(timer);
  }
}

function publicResult(result, stored) {
  return {
    ok: !!result.ok,
    code: String(result.code || (result.ok ? "VALID" : "UNKNOWN")),
    plan: result.plan || null,
    expiresAt: result.expiresAt || null,
    maxDevices: Number.isFinite(result.maxDevices) ? result.maxDevices : null,
    activeDevices: Number.isFinite(result.activeDevices) ? result.activeDevices : null,
    stored: !!stored,
  };
}

async function status() {
  const state = readState();
  const deviceId = ensureDeviceId(state);
  const licenseKey = decryptKey(state.encryptedKey);
  if (!licenseKey) return { ok: false, code: "LICENSE_REQUIRED", stored: false };

  const result = await validateRemote(licenseKey, deviceId);
  if (result.ok) {
    state.lastValidatedAt = new Date().toISOString();
    state.lastCode = result.code || "VALID";
    writeState(state);
  }
  return publicResult(result, true);
}

async function activate(rawLicenseKey) {
  const licenseKey = normalizeKey(rawLicenseKey);
  if (licenseKey.length < 20 || licenseKey.length > 160) {
    return { ok: false, code: "INVALID_LICENSE_FORMAT", stored: false };
  }

  const state = readState();
  const deviceId = ensureDeviceId(state);
  const result = await validateRemote(licenseKey, deviceId);
  if (!result.ok) return publicResult(result, false);

  try {
    state.encryptedKey = encryptKey(licenseKey);
    state.lastValidatedAt = new Date().toISOString();
    state.lastCode = result.code || "VALID";
    writeState(state);
  } catch (err) {
    return { ok: false, code: "SECURE_STORAGE_UNAVAILABLE", stored: false };
  }
  return publicResult(result, true);
}

function forget() {
  const state = readState();
  delete state.encryptedKey;
  delete state.lastValidatedAt;
  delete state.lastCode;
  writeState(state);
  return { ok: true, code: "LICENSE_FORGOTTEN", stored: false };
}

module.exports = {
  LICENSE_ENDPOINT,
  status,
  activate,
  forget,
};
