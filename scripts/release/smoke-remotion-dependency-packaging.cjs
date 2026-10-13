#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createRequire } = require("node:module");
const hook = require("../../apps/desktop/build/after-pack.cjs");

async function main() {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "remotion-dependency-packaging-"));
  try {
    const appOutDir = path.join(temp, "win-unpacked");
    const rendererDir = path.join(appOutDir, "resources", "app", "node_modules", "@remotion", "renderer");
    const nestedExeca = path.join(rendererDir, "node_modules", "execa", "package.json");
    fs.mkdirSync(path.dirname(nestedExeca), { recursive: true });
    fs.writeFileSync(path.join(rendererDir, "package.json"), JSON.stringify({
      name: "@remotion/renderer",
      version: "4.0.481",
      dependencies: { execa: "5.1.1" },
    }));
    fs.writeFileSync(nestedExeca, JSON.stringify({ name: "execa", version: "9.6.1" }));

    await hook({ appOutDir });

    const resolved = createRequire(path.join(rendererDir, "package.json")).resolve("execa/package.json");
    const resolvedPackage = JSON.parse(fs.readFileSync(resolved, "utf8"));
    assert.equal(resolvedPackage.version, "5.1.1", "renderer must resolve its locked execa 5.1.1, not workspace execa 9.x");
    assert.equal(path.normalize(resolved), path.normalize(path.join(rendererDir, "node_modules", "execa", "package.json")));

    const requiredSiblings = ["execa", "get-stream", "human-signals", "is-stream", "npm-run-path", "signal-exit", "strip-final-newline"];
    for (const name of requiredSiblings) {
      assert.ok(fs.existsSync(path.join(rendererDir, "node_modules", name)), `missing staged renderer dependency: ${name}`);
    }
    console.log("REMOTION_DEPENDENCY_PACKAGING_SMOKE_PASS execa=5.1.1 siblings=7");
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
