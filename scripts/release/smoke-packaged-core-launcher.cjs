"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { startCore, readServerInfo, healthCheck } = require("../../apps/desktop/electron/core-launcher.cjs");

const projectRoot = path.resolve(__dirname, "..", "..");
const appOutDir = path.resolve(process.argv[2] || path.join(projectRoot, "apps/desktop/build/dist/win-unpacked"));

function setEnv(name, value) {
  process.env[name] = value;
}

async function waitForExit(child, timeoutMs = 5000) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("packaged core child did not exit during cleanup")), timeoutMs);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function main() {
  const appExe = path.join(appOutDir, "Tang AI Video Editor.exe");
  const cliPath = path.join(appOutDir, "resources", "app", "node_modules", "@aive", "core", "dist", "cli.js");
  const resources = path.join(appOutDir, "resources", "aive");
  assert.ok(fs.existsSync(appExe), `packaged app executable missing: ${appExe}`);
  assert.ok(fs.existsSync(cliPath), `packaged core CLI missing: ${cliPath}`);

  const tempRoot = path.join(projectRoot, ".tmp");
  fs.mkdirSync(tempRoot, { recursive: true });
  const runRoot = fs.mkdtempSync(path.join(tempRoot, "rel009-packaged-core-launch-"));
  const dataDir = path.join(runRoot, "core-data");
  fs.mkdirSync(dataDir, { recursive: true });

  for (const [key, relative] of Object.entries({
    AIVE_FFMPEG: path.join("ffmpeg", "ffmpeg.exe"),
    AIVE_FFPROBE: path.join("ffmpeg", "ffprobe.exe"),
    AIVE_WHISPER_BIN: path.join("whisper", "bin", "whisper-cli.exe"),
    AIVE_YUNET_MODEL: path.join("models", "face_detection_yunet_2023mar.onnx"),
    AIVE_FONT: path.join("fonts", "NotoSans-Regular.ttf"),
  })) {
    const file = path.join(resources, relative);
    assert.ok(fs.existsSync(file), `packaged bundled asset missing: ${file}`);
    setEnv(key, file);
  }

  setEnv("AIVE_DATA_DIR", dataDir);
  setEnv("AIVE_PORT", "0");
  setEnv("APPDATA", path.join(runRoot, "appdata"));
  setEnv("LOCALAPPDATA", path.join(runRoot, "localappdata"));
  setEnv("TEMP", path.join(runRoot, "temp"));
  setEnv("TMP", path.join(runRoot, "temp"));
  for (const name of ["APPDATA", "LOCALAPPDATA", "TEMP"]) fs.mkdirSync(process.env[name], { recursive: true });

  let child = null;
  try {
    const startupStartedAt = Date.now();
    const result = await startCore(dataDir, appExe, { cliPath, readyTimeoutMs: 20000, pollIntervalMs: 100 });
    const startupMs = Date.now() - startupStartedAt;
    assert.ok(startupMs < 20000, `packaged core readiness exceeded 20,000 ms: ${startupMs}`);
    child = result.child;
    const info = readServerInfo(dataDir);
    assert.ok(info, "packaged core must publish server.json");
    assert.equal(Number(info.pid), child.pid, "server.json PID must match the spawned packaged Electron child");
    assert.equal(Number(info.port), result.port, "launcher port must match server.json");
    assert.equal(await healthCheck(result.port), true, "packaged core /health must return HTTP 200");
    console.log(`REL009_PACKAGED_CORE_LAUNCH_SMOKE=PASS pid=${child.pid} port=${result.port} startupMs=${startupMs}`);
  } finally {
    if (child && child.exitCode === null && child.signalCode === null) {
      try { child.kill(); } catch {}
      await waitForExit(child).catch(() => {});
    }
    fs.rmSync(runRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
