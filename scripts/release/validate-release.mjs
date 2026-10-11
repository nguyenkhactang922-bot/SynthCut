#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";

const ROOT = resolve(import.meta.dirname, "..", "..");
const EXPECTED_REPOSITORY = "nguyenkhactang922-bot/SynthCut";
const EXPECTED_PRODUCT = "Tang AI Video Editor";
const EXPECTED_APP_ID = "com.tang.aivideoeditor";
const VERSION_FILES = [
  "package.json",
  "packages/core/package.json",
  "packages/mcp/package.json",
  "packages/skill-installer/package.json",
  "apps/desktop/package.json",
];

function readJson(path) {
  return JSON.parse(readFileSync(resolve(ROOT, path), "utf8"));
}

function git(...args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", windowsHide: true }).trim();
}

function fail(message) {
  console.error(`RELEASE_VALIDATION_FAIL: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const requireClean = args.includes("--require-clean");
const metadataIndex = args.indexOf("--metadata");
const metadataPath = metadataIndex >= 0 ? args[metadataIndex + 1] : null;
if (metadataIndex >= 0 && !metadataPath) fail("--metadata requires a path");

const manifests = Object.fromEntries(VERSION_FILES.map((path) => [path, readJson(path)]));
const versions = new Set(Object.values(manifests).map((m) => m.version));
if (versions.size !== 1) {
  fail(`version mismatch: ${VERSION_FILES.map((p) => `${p}=${manifests[p].version}`).join(", ")}`);
}
const version = [...versions][0];
if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`version must be stable semver X.Y.Z, got ${version}`);

const desktop = manifests["apps/desktop/package.json"];
if (desktop.build?.productName !== EXPECTED_PRODUCT) fail(`unexpected productName ${desktop.build?.productName}`);
if (desktop.build?.appId !== EXPECTED_APP_ID) fail(`unexpected appId ${desktop.build?.appId}`);
const providers = desktop.build?.publish;
if (!Array.isArray(providers) || providers.length !== 1) fail("desktop publish provider must be exactly one entry");
if (providers[0].provider !== "github" || providers[0].owner !== "nguyenkhactang922-bot" || providers[0].repo !== "SynthCut") {
  fail(`desktop updater/publish provider must target ${EXPECTED_REPOSITORY}`);
}

const skill = manifests["packages/skill-installer/package.json"];
if (skill.name !== "@relo-video/synthcut") fail(`unexpected legacy skill package name ${skill.name}`);
if (skill.private !== true) fail("legacy upstream npm namespace package must be private=true");
if (Object.hasOwn(skill, "publishConfig")) fail("legacy upstream npm namespace package must not carry publishConfig");

const repository = process.env.GITHUB_REPOSITORY || "";
if (repository && repository !== EXPECTED_REPOSITORY) {
  fail(`workflow repository ${repository} is not authorized; expected ${EXPECTED_REPOSITORY}`);
}
const ref = process.env.GITHUB_REF || "";
const expectedTag = `v${version}`;
if (ref.startsWith("refs/tags/") && ref !== `refs/tags/${expectedTag}`) {
  fail(`tag ${ref.slice("refs/tags/".length)} does not match package version ${expectedTag}`);
}

const localTagExists = git("tag", "--list", expectedTag) === expectedTag;
if (!ref.startsWith("refs/tags/") && localTagExists) {
  fail(`release tag ${expectedTag} already exists; bump the version before preparing another release`);
}

if (requireClean) {
  const dirty = git("status", "--porcelain", "--untracked-files=no");
  if (dirty) fail(`tracked worktree must be clean for release candidate:\n${dirty}`);
}

const workflow = readFileSync(resolve(ROOT, ".github/workflows/release.yml"), "utf8");
const commercialConfig = readFileSync(resolve(ROOT, "apps/desktop/electron-builder.commercial.cjs"), "utf8");
const licenseClient = readFileSync(resolve(ROOT, "apps/desktop/electron/license.cjs"), "utf8");
const preload = readFileSync(resolve(ROOT, "apps/desktop/electron/preload.cjs"), "utf8");
const licenseGate = readFileSync(resolve(ROOT, "apps/desktop/src/LicenseGate.tsx"), "utf8");
const requiredWorkflowTokens = [
  "contents: read",
  "contents: write",
  "github.repository == 'nguyenkhactang922-bot/SynthCut'",
  "REMOTION_COMMERCIAL_BASIS_APPROVED must be true",
  "SUPABASE_LICENSE_BACKEND_APPROVED must be true",
  "UNSIGNED_COMMERCIAL_RELEASE_APPROVED=true",
  "vars.SUPABASE_LICENSE_BACKEND_APPROVED",
  "vars.UNSIGNED_COMMERCIAL_RELEASE_APPROVED",
  "npm run dist --workspace synthcut-by-relo",
  "Get-AuthenticodeSignature",
  "NotSigned",
  "UNSIGNED_WINDOWS_RELEASE_GATE=PASS",
  "UNSIGNED_RELEASE_NOTICE.txt",
  "Unknown publisher",
  "Supabase licensing controls Tang AI Video Editor entitlement",
  "vars.WINDOWS_SIGN_PUBLISHER_NAME",
  "secrets.ESIGNER_USERNAME",
  "secrets.ESIGNER_PASSWORD",
  "secrets.ESIGNER_TOTP_SECRET",
  "ESIGNER_CKA_VERSION: \"1.1.2\"",
  "3f088403139505ddfb0ed3b56b72893f92c865f98b382753a1e1c695a5cece35",
  "eSignerCKATool.exe",
  "npm run dist:commercial --workspace synthcut-by-relo",
  "Restore known workspace-bin mutation before post-package clean gate",
  "packages/skill-installer/bin/synthcut.mjs",
  "POST_PACKAGE_TRACKED_CLEAN_GATE=PASS",
  "WINDOWS_SIGNING_GATE=PASS",
  "actions/upload-artifact@v4",
  "actions/download-artifact@v4",
  "latest.yml",
  "*.exe.blockmap",
  "SHA256SUMS.txt",
  "bundle-manifest.json",
  "SOURCE_OFFER.md",
  "THIRD_PARTY_LICENSES.md",
];
for (const token of requiredWorkflowTokens) {
  if (!workflow.includes(token)) fail(`release workflow is missing required token: ${token}`);
}
const requiredCommercialConfigTokens = [
  "WINDOWS_SIGN_CERT_SHA1",
  "WINDOWS_SIGN_PUBLISHER_NAME",
  "forceCodeSigning: true",
  "certificateSha1",
  "publisherName",
  "signingHashAlgorithms: [\"sha256\"]",
  "rfc3161TimeStampServer: \"http://ts.ssl.com\"",
];
for (const token of requiredCommercialConfigTokens) {
  if (!commercialConfig.includes(token)) fail(`commercial signing config is missing required token: ${token}`);
}
if (workflow.includes("-- --publish never")) {
  fail("release workflow must not forward --publish through npm; package scripts own the non-publishing gate");
}
if (desktop.scripts?.dist !== "electron-builder --win --publish never") {
  fail("desktop dist script must disable electron-builder publishing explicitly");
}
if (desktop.scripts?.["dist:commercial"] !== "electron-builder --win --config electron-builder.commercial.cjs --publish never") {
  fail("desktop dist:commercial script must use electron-builder.commercial.cjs and disable publishing explicitly");
}
const licenseClientTokens = [
  "https://ljygpbxkxmsuhdfpfgml.supabase.co/functions/v1/tve-license-authority",
  "safeStorage.encryptString",
  "safeStorage.decryptString",
  "crypto.randomUUID()",
  "NETWORK_TIMEOUT",
  "LICENSE_REQUIRED",
];
for (const token of licenseClientTokens) {
  if (!licenseClient.includes(token)) fail(`desktop license client is missing required token: ${token}`);
}
for (const token of ["license:status", "license:activate", "license:forget"]) {
  if (!preload.includes(token)) fail(`desktop preload is missing license bridge token: ${token}`);
}
for (const token of ["Commercial license verification", "Activate license", "DEVICE_LIMIT"]) {
  if (!licenseGate.includes(token)) fail(`desktop license gate is missing required token: ${token}`);
}
if (/npm\s+publish/.test(workflow)) fail("release workflow must not publish npm packages");

const sourceCommit = process.env.GITHUB_SHA || git("rev-parse", "HEAD");
const result = {
  status: "PASS",
  version,
  tag: expectedTag,
  repository: EXPECTED_REPOSITORY,
  productName: EXPECTED_PRODUCT,
  appId: EXPECTED_APP_ID,
  sourceCommit,
  trackedCleanRequired: requireClean,
  workflowRef: ref || null,
  validatedVersionFiles: VERSION_FILES,
  npmUpstreamNamespacePublicationDisabled: true,
};

if (metadataPath) {
  const out = resolve(ROOT, metadataPath);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

console.log(`REL005_RELEASE_VALIDATION_PASS version=${version} tag=${expectedTag} repo=${EXPECTED_REPOSITORY} cleanRequired=${requireClean}`);
