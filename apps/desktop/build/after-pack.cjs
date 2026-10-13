const fs = require("node:fs");
const path = require("node:path");

const EXPECTED_EXECA_VERSION = "5.1.1";

module.exports = async function repairRemotionDependencyClosure(context) {
  if (!context || typeof context.appOutDir !== "string" || !context.appOutDir) {
    throw new Error("REMOTION_DEPENDENCY_PACKAGING_FAIL: appOutDir is required");
  }

  const repoRoot = path.resolve(__dirname, "../../..");
  const source = path.join(repoRoot, "node_modules", "@remotion", "renderer", "node_modules");
  const sourceExeca = path.join(source, "execa", "package.json");
  if (!fs.existsSync(sourceExeca)) {
    throw new Error("REMOTION_DEPENDENCY_PACKAGING_FAIL: locked renderer dependency source is missing");
  }

  const sourceVersion = JSON.parse(fs.readFileSync(sourceExeca, "utf8")).version;
  if (sourceVersion !== EXPECTED_EXECA_VERSION) {
    throw new Error(`REMOTION_DEPENDENCY_PACKAGING_FAIL: expected source execa ${EXPECTED_EXECA_VERSION}, got ${sourceVersion}`);
  }

  const target = path.join(
    context.appOutDir,
    "resources",
    "app",
    "node_modules",
    "@remotion",
    "renderer",
    "node_modules",
  );
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.rmSync(target, { recursive: true, force: true });
  fs.cpSync(source, target, { recursive: true, force: true });

  const targetExeca = path.join(target, "execa", "package.json");
  if (!fs.existsSync(targetExeca)) {
    throw new Error("REMOTION_DEPENDENCY_PACKAGING_FAIL: execa package was not staged");
  }
  const targetVersion = JSON.parse(fs.readFileSync(targetExeca, "utf8")).version;
  if (targetVersion !== EXPECTED_EXECA_VERSION) {
    throw new Error(`REMOTION_DEPENDENCY_PACKAGING_FAIL: expected staged execa ${EXPECTED_EXECA_VERSION}, got ${targetVersion}`);
  }

  console.log(`REMOTION_DEPENDENCY_PACKAGING_PASS execa=${targetVersion} target=${target}`);
};
