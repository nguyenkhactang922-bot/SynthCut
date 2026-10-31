"use strict";

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const projectRoot = path.resolve(__dirname, "..", "..", "..");
const coreEntry = path.resolve(process.argv[2] || path.join(projectRoot, "packages/core/dist/index.js"));
assert.ok(fs.existsSync(coreEntry), "built core entry is missing: " + coreEntry + "; run the core build first");
const compiledEnginePath = path.join(path.dirname(coreEntry), "engine.js");
assert.ok(fs.existsSync(compiledEnginePath), "built engine module is missing: " + compiledEnginePath);
const compiledEngine = fs.readFileSync(compiledEnginePath, "utf8");
assert.ok(compiledEngine.includes('import("./motion/render.js")'), "engine must retain an on-demand motion renderer import");
assert.ok(!compiledEngine.includes('from "./motion/render.js"'), "engine must not statically import the motion renderer");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aive-optional-motion-load-"));
const loaderPath = path.join(tempRoot, "trace-loader.mjs");
const tracePath = path.join(tempRoot, "resolved-modules.txt");

try {
  fs.writeFileSync(loaderPath, [
    '"use strict";',
    'import { appendFileSync } from "node:fs";',
    'export async function resolve(specifier, context, nextResolve) {',
    '  appendFileSync(process.env.AIVE_MODULE_RESOLUTION_TRACE, specifier + "\\n");',
    '  return nextResolve(specifier, context);',
    '}',
    '',
  ].join("\n"), "utf8");

  const entryUrl = pathToFileURL(coreEntry).href;
  const probe = [
    "const core = await import(" + JSON.stringify(entryUrl) + ");",
    'if (typeof core.EditorEngine !== "function") throw new Error("EditorEngine export missing");',
    'if (typeof core.EditorServer !== "function") throw new Error("EditorServer export missing");',
    'console.log("CORE_ENTRY_IMPORT_PASS");',
  ].join("\n");

  const result = spawnSync(process.execPath, [
    "--no-warnings",
    "--experimental-loader",
    pathToFileURL(loaderPath).href,
    "--input-type=module",
    "-e",
    probe,
  ], {
    cwd: projectRoot,
    env: { ...process.env, AIVE_MODULE_RESOLUTION_TRACE: tracePath },
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 4 * 1024 * 1024,
  });

  if (result.error) throw result.error;
  assert.equal(result.status, 0, "core entry import failed:\n" + (result.stdout || "") + "\n" + (result.stderr || ""));
  assert.match(result.stdout, /CORE_ENTRY_IMPORT_PASS/);

  const resolved = fs.existsSync(tracePath)
    ? fs.readFileSync(tracePath, "utf8").split(/\r?\n/).filter(Boolean)
    : [];
  assert.ok(resolved.length > 0, "ESM resolution hook did not observe the core module graph");

  const eagerOptionalModules = resolved.filter((specifier) =>
    specifier === "./motion/render.js" ||
    specifier === "remotion" ||
    specifier.startsWith("@remotion/")
  );
  assert.deepEqual(eagerOptionalModules, [], "optional motion provider was eagerly resolved:\n" + eagerOptionalModules.join("\n"));

  console.log("CORE_OPTIONAL_MOTION_LAZY_LOAD_SMOKE=PASS resolutions=" + resolved.length + " eagerRemotionImports=0");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
