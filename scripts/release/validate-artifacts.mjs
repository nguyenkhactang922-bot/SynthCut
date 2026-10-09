#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import process from "node:process";

const dir = resolve(process.argv[2] || "apps/desktop/build/release-artifacts");
const EXPECTED_REPOSITORY = "nguyenkhactang922-bot/SynthCut";

function fail(message) {
  console.error(`RELEASE_ARTIFACT_VALIDATION_FAIL: ${message}`);
  process.exit(1);
}

function requireFile(name) {
  const path = resolve(dir, name);
  if (!existsSync(path) || !statSync(path).isFile() || statSync(path).size === 0) fail(`missing/empty ${name}`);
  return path;
}

if (!existsSync(dir)) fail(`artifact directory does not exist: ${dir}`);
const files = readdirSync(dir).filter((name) => statSync(resolve(dir, name)).isFile());
const installers = files.filter((name) => name.endsWith(".exe"));
const blockmaps = files.filter((name) => name.endsWith(".exe.blockmap"));
const zips = files.filter((name) => name.endsWith(".zip"));
if (installers.length < 1) fail("no Windows installer .exe");
if (blockmaps.length < 1) fail("no .exe.blockmap update artifact");
if (zips.length < 1) fail("no portable .zip artifact");

for (const name of [
  "latest.yml",
  "SHA256SUMS.txt",
  "BUNDLE_MANIFEST.json",
  "LICENSE",
  "THIRD_PARTY_LICENSES.md",
  "SOURCE_OFFER.md",
  "RELEASE_METADATA.json",
]) requireFile(name);

const metadata = JSON.parse(readFileSync(resolve(dir, "RELEASE_METADATA.json"), "utf8"));
if (metadata.status !== "PASS") fail("RELEASE_METADATA status is not PASS");
if (metadata.repository !== EXPECTED_REPOSITORY) fail(`metadata repository ${metadata.repository} is not authorized`);
if (metadata.tag !== `v${metadata.version}`) fail("metadata tag/version mismatch");

const bundle = JSON.parse(readFileSync(resolve(dir, "BUNDLE_MANIFEST.json"), "utf8"));
if (bundle.schemaVersion !== 2) fail(`unexpected bundle manifest schema ${bundle.schemaVersion}`);
if (bundle.sourceCommit !== metadata.sourceCommit) fail("bundle manifest sourceCommit differs from release metadata");
if (bundle.sourceTrackedDirty !== false) fail("release bundle manifest must come from a clean tracked source state");
if (bundle.releaseGates?.remotionCommercialBasisRequired !== true) fail("bundle manifest lost Remotion commercial gate");
if (bundle.releaseGates?.trustedWindowsSigningRequired !== true) fail("bundle manifest lost Windows signing gate");

const checksumLines = readFileSync(resolve(dir, "SHA256SUMS.txt"), "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);
const checksumNames = new Set();
for (const line of checksumLines) {
  const match = /^([0-9a-fA-F]{64})\s+(.+)$/.exec(line);
  if (!match) fail(`invalid SHA256SUMS line: ${line}`);
  const [, expected, filename] = match;
  const artifact = resolve(dir, basename(filename));
  if (!existsSync(artifact)) fail(`checksum references missing artifact ${filename}`);
  const actual = createHash("sha256").update(readFileSync(artifact)).digest("hex");
  if (actual !== expected.toLowerCase()) fail(`checksum mismatch for ${filename}`);
  checksumNames.add(basename(filename));
}
for (const name of [...installers, ...zips]) {
  if (!checksumNames.has(name)) fail(`SHA256SUMS.txt does not cover ${name}`);
}

console.log(`REL005_ARTIFACT_VALIDATION_PASS files=${files.length} installers=${installers.length} blockmaps=${blockmaps.length} zips=${zips.length} version=${metadata.version}`);
