// Discovers or launches the editor core, and — crucially — **reuses an already
// running core** when one exists. This is what lets the desktop app and an AI
// client (via the MCP server) share ONE live editing session: whoever starts
// first launches the core; the other attaches to it. They must agree on the
// data directory (where the core publishes server.json), so we use the same
// default the core and MCP server use: ~/.aive/data.
//
// Electron-free on purpose, so it can be tested under plain Node.
const { spawn } = require("node:child_process");
const { createRequire } = require("node:module");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const require_ = createRequire(__filename);

function getDataDir() {
  return process.env.AIVE_DATA_DIR || path.join(os.homedir(), ".aive", "data");
}

function coreCliPath() {
  const pkgJson = require_.resolve("@aive/core/package.json");
  return path.join(path.dirname(pkgJson), "dist", "cli.js");
}

function readServerInfo(dir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dir, "server.json"), "utf8"));
  } catch {
    return null;
  }
}

function healthCheck(port) {
  return new Promise((resolve) => {
    const req = http.get({ host: "127.0.0.1", port, path: "/health", timeout: 1500 }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Spawn a fresh core. `execPath` is the binary to run the CLI with — under
 * Electron that's the Electron binary (with ELECTRON_RUN_AS_NODE), under tests
 * it's plain node. Resolves with { child, port } once the core reports ready.
 */
function startCore(dir, execPath, options = {}) {
  return new Promise((resolve, reject) => {
    const cliPath = options.cliPath || coreCliPath();
    const readyTimeoutMs = options.readyTimeoutMs || 20000;
    const pollIntervalMs = options.pollIntervalMs || 100;
    const child = spawn(execPath || process.execPath, [cliPath], {
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", AIVE_DATA_DIR: dir },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let settled = false;
    let buf = "";
    let probeInFlight = false;
    let timeout = null;
    let readinessPoll = null;

    const cleanup = () => {
      if (timeout) clearTimeout(timeout);
      if (readinessPoll) clearInterval(readinessPoll);
    };
    const settleReady = (port, token = "") => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ child, port, token });
    };
    const settleError = (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (child && child.exitCode === null && !child.killed) {
        try { child.kill(); } catch { /* best-effort cleanup after failed startup */ }
      }
      reject(err);
    };

    // Packaged Electron children on Windows can become healthy and publish
    // server.json even when their stdout ready line never reaches this pipe.
    // Fall back only to authoritative state from THIS spawned PID plus /health.
    readinessPoll = setInterval(async () => {
      if (settled || probeInFlight) return;
      const info = readServerInfo(dir);
      if (!info || Number(info.pid) !== child.pid || !info.port) return;
      probeInFlight = true;
      try {
        if (await healthCheck(info.port)) settleReady(info.port, info.token || "");
      } finally {
        probeInFlight = false;
      }
    }, pollIntervalMs);

    timeout = setTimeout(() => {
      settleError(new Error("Timed out waiting for editor core to start"));
    }, readyTimeoutMs);

    child.stdout.on("data", (chunk) => {
      buf += chunk.toString();
      let nl;
      while ((nl = buf.indexOf("\n")) !== -1) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (!line) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.event === "ready" && msg.port) {
            settleReady(msg.port, msg.token || (readServerInfo(dir) || {}).token || "");
          }
        } catch {
          /* non-JSON log line; ignore */
        }
      }
    });
    child.stderr.on("data", (d) => process.stderr.write(`[core] ${d}`));
    child.on("exit", (code) => settleError(new Error(`Core exited before ready (code ${code})`)));
    child.on("error", (err) => settleError(err));
  });
}

/**
 * Ensure a core is available. Returns { port, token, owned, child }.
 *   owned=false → attached to a core someone else started (do NOT kill it).
 *   owned=true  → we spawned it (kill it on quit).
 * `token` is the core's per-run session secret — every HTTP/WS/file request
 * must carry it, so the launcher hands it to the renderer alongside the port.
 */
async function ensureCore(execPath) {
  const dir = getDataDir();
  const info = readServerInfo(dir);
  if (info && info.port && (await healthCheck(info.port))) {
    return { port: info.port, token: info.token || "", owned: false, child: null };
  }
  const { child, port, token } = await startCore(dir, execPath);
  return { port, token: token || "", owned: true, child };
}

module.exports = { ensureCore, startCore, getDataDir, coreCliPath, readServerInfo, healthCheck };
