"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { startCore, readServerInfo, healthCheck } = require("../../apps/desktop/electron/core-launcher.cjs");

const projectTmpRoot = path.resolve(__dirname, "..", "..", ".tmp", "rel009-core-ready-smoke");

function makeProjectTempDir(prefix) {
  fs.mkdirSync(projectTmpRoot, { recursive: true });
  return fs.mkdtempSync(path.join(projectTmpRoot, prefix));
}

function waitForExit(child, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    if (!child || child.exitCode !== null || child.signalCode !== null) return resolve();
    const timer = setTimeout(() => reject(new Error("child did not exit")), timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function writeFakeCore(file, { wrongPid = false } = {}) {
  const source = `
"use strict";
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const dir = process.env.AIVE_DATA_DIR;
const server = http.createServer((req, res) => {
  if (req.url === "/health") { res.writeHead(200); res.end("ok"); return; }
  res.writeHead(404); res.end("no");
});
server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "server.json"), JSON.stringify({
    port,
    pid: ${wrongPid ? "process.pid + 999999" : "process.pid"},
    startedAt: Date.now(),
    token: "fallback-test-token"
  }));
  // Intentionally DO NOT print the JSON stdout ready marker.
  console.error("fake core healthy without stdout ready marker");
});
const stop = () => server.close(() => process.exit(0));
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
`;
  fs.writeFileSync(file, source, "utf8");
}

async function positiveFallback() {
  const dir = makeProjectTempDir("positive-");
  const fake = path.join(dir, "fake-core.cjs");
  writeFakeCore(fake);
  const result = await startCore(dir, process.execPath, {
    cliPath: fake,
    readyTimeoutMs: 5000,
    pollIntervalMs: 25,
  });
  try {
    const info = readServerInfo(dir);
    assert.ok(info);
    assert.equal(info.pid, result.child.pid);
    assert.equal(result.port, info.port);
    assert.equal(result.token, "fallback-test-token");
    assert.equal(await healthCheck(result.port), true);
  } finally {
    if (result.child.exitCode === null && !result.child.killed) result.child.kill();
    await waitForExit(result.child);
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function mismatchFailsClosed() {
  const dir = makeProjectTempDir("negative-");
  const fake = path.join(dir, "fake-core.cjs");
  writeFakeCore(fake, { wrongPid: true });
  let publishedPid = null;
  try {
    await assert.rejects(
      startCore(dir, process.execPath, {
        cliPath: fake,
        readyTimeoutMs: 450,
        pollIntervalMs: 25,
      }),
      /Timed out waiting for editor core to start/,
    );
    const info = readServerInfo(dir);
    assert.ok(info);
    publishedPid = Number(info.pid) - 999999;
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.throws(() => process.kill(publishedPid, 0));
  } finally {
    if (publishedPid) {
      try { process.kill(publishedPid, "SIGTERM"); } catch {}
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

(async () => {
  await positiveFallback();
  await mismatchFailsClosed();
  console.log("REL009_CORE_READY_FALLBACK_SMOKE=PASS");
})().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
