/**
 * Stage heavy local binaries/models into `apps/desktop/build/resources/aive/`
 * for the packaged Windows app. Release staging is provenance-aware: redistributed
 * files are hashed and FFmpeg is verified against the tracked release pin before
 * a bundle manifest is emitted.
 */
import { access, copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { spawnSync } from "node:child_process";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { basename, delimiter, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Import the engine's COMPILED setup code. Using dist avoids tsx's ESM resolver
// issues in release environments while reusing the same pinned download logic.
import { ensureWhisper, DEFAULT_MODEL } from "../../../packages/core/dist/whisper/setup.js";
import { ensureYunetModel } from "../../../packages/core/dist/reframe/detector.js";

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(here, "..", "..", "..");
/** apps/desktop/build/resources/aive */
const STAGE = join(here, "..", "build", "resources", "aive");
const FFMPEG_PIN_PATH = join(REPO_ROOT, "release", "compliance", "ffmpeg-windows.json");
const SOURCE_OFFER_PATH = join(REPO_ROOT, "release", "compliance", "SOURCE_OFFER.md");
const LICENSE_PATH = join(REPO_ROOT, "LICENSE");
const THIRD_PARTY_LICENSES_PATH = join(REPO_ROOT, "THIRD_PARTY_LICENSES.md");
const PACKAGE_LOCK_PATH = join(REPO_ROOT, "package-lock.json");

const isWin = process.platform === "win32";
const EXE = isWin ? ".exe" : "";

const WHISPER_RELEASE = "v1.9.0";
const WHISPER_BINARY_ASSET = isWin ? "whisper-bin-x64.zip" : null;
const WHISPER_RELEASE_URL = `https://github.com/ggml-org/whisper.cpp/releases/tag/${WHISPER_RELEASE}`;
const WHISPER_MODEL_BASE_URL = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";
const YUNET_FILE = "face_detection_yunet_2023mar.onnx";
const YUNET_URL = `https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/${YUNET_FILE}`;
const FONT_URL = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf";
const FONT_LICENSE_URL = "https://raw.githubusercontent.com/googlefonts/noto-fonts/main/LICENSE";

interface FfmpegPin {
  schemaVersion: number;
  platform: string;
  provider: string;
  distributionChannel: string;
  packageName: string;
  packageVersion: string;
  buildVariant: string;
  expectedVersionToken: string;
  archiveUrl: string;
  archiveSha256: string;
  expectedFiles: Record<string, { sha256: string }>;
  providerReleaseUrl: string;
  providerInfoUrl: string;
  packageRecordUrl: string;
  upstreamVersion: string;
  upstreamTag: string;
  upstreamSourceUrl: string;
  license: string;
  notes?: string;
}

interface FileRecord {
  path: string;
  sizeBytes: number;
  sha256: string;
}

async function exists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(p: string): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(p);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function stagePath(p: string): string {
  return relative(STAGE, p).replaceAll("\\", "/");
}

async function fileRecord(p: string): Promise<FileRecord> {
  const info = await stat(p);
  return { path: stagePath(p), sizeBytes: info.size, sha256: await sha256File(p) };
}

async function repoFileRecord(p: string): Promise<FileRecord> {
  const info = await stat(p);
  return {
    path: relative(REPO_ROOT, p).replaceAll("\\", "/"),
    sizeBytes: info.size,
    sha256: await sha256File(p),
  };
}

/** Resolve an executable on PATH (or via an explicit packaged-build override). */
async function findOnPath(name: string, envOverride?: string): Promise<string> {
  if (envOverride && process.env[envOverride]) {
    const v = process.env[envOverride]!;
    if (await exists(v)) return v;
    throw new Error(`${envOverride} points at a missing file: ${v}`);
  }
  const exe = name + EXE;
  for (const dir of (process.env.PATH || "").split(delimiter)) {
    if (!dir) continue;
    const cand = join(dir, exe);
    if (await exists(cand)) return cand;
  }
  throw new Error(`Could not find ${exe} on PATH. Set ${envOverride ?? "an explicit path"} for release staging.`);
}

/** Copy src → dest unless the exact bytes are already present. */
async function copyIfNeeded(src: string, dest: string): Promise<number> {
  await mkdir(dirname(dest), { recursive: true });
  const sourceInfo = await stat(src);
  if (await exists(dest)) {
    const destInfo = await stat(dest);
    if (destInfo.size === sourceInfo.size && (await sha256File(dest)) === (await sha256File(src))) return 0;
  }
  await copyFile(src, dest);
  return sourceInfo.size;
}

async function download(url: string, dest: string, label: string): Promise<void> {
  if (await exists(dest)) {
    console.log(`  • ${label} already staged`);
    return;
  }
  console.log(`  • downloading ${label} …`);
  await mkdir(dirname(dest), { recursive: true });
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok || !res.body) throw new Error(`Failed to download ${label}: ${res.status} ${res.statusText}`);
  const tmp = `${dest}.part`;
  await pipeline(Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(tmp));
  const { rename } = await import("node:fs/promises");
  await rename(tmp, dest);
}

function fmt(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function dirSize(dir: string): Promise<number> {
  let total = 0;
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    total += e.isDirectory() ? await dirSize(full) : (await stat(full)).size;
  }
  return total;
}

function runText(executable: string, args: string[], cwd = REPO_ROOT): string {
  const result = spawnSync(executable, args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 2 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${basename(executable)} ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function toolVersionLine(binary: string): string {
  return runText(binary, ["-version"]).split(/\r?\n/, 1)[0] || "";
}

async function loadFfmpegPin(): Promise<FfmpegPin> {
  return JSON.parse(await readFile(FFMPEG_PIN_PATH, "utf8")) as FfmpegPin;
}

async function verifyPinnedFfmpeg(ffmpeg: string, ffprobe: string, pin: FfmpegPin): Promise<{
  ffmpegVersion: string;
  ffprobeVersion: string;
  sourceFiles: Record<string, { sha256: string; sizeBytes: number }>;
}> {
  if (process.platform !== "win32" || process.arch !== "x64") {
    throw new Error(`Pinned release FFmpeg profile only authorizes win32-x64, got ${process.platform}-${process.arch}`);
  }
  const ffmpegVersion = toolVersionLine(ffmpeg);
  const ffprobeVersion = toolVersionLine(ffprobe);
  for (const [label, line] of [["ffmpeg", ffmpegVersion], ["ffprobe", ffprobeVersion]] as const) {
    if (!line.includes(pin.expectedVersionToken)) {
      throw new Error(`${label} provenance mismatch: expected ${pin.expectedVersionToken}, observed ${line}`);
    }
  }

  const sourceFiles: Record<string, { sha256: string; sizeBytes: number }> = {};
  for (const [name, source] of [["ffmpeg.exe", ffmpeg], ["ffprobe.exe", ffprobe]] as const) {
    const info = await stat(source);
    const sha256 = await sha256File(source);
    const expected = pin.expectedFiles[name]?.sha256?.toLowerCase();
    if (!expected) throw new Error(`FFmpeg pin is missing expected SHA-256 for ${name}`);
    if (sha256 !== expected) throw new Error(`${name} SHA-256 mismatch: expected ${expected}, observed ${sha256}`);
    sourceFiles[name] = { sha256, sizeBytes: info.size };
  }
  return { ffmpegVersion, ffprobeVersion, sourceFiles };
}

function gitCommit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  return runText("git", ["rev-parse", "HEAD"]);
}

function gitTrackedDirty(): boolean {
  return runText("git", ["status", "--porcelain", "--untracked-files=no"]).length > 0;
}

async function main(): Promise<void> {
  console.log(`Staging bundled assets into ${STAGE}\n`);
  await mkdir(STAGE, { recursive: true });

  // 1. FFmpeg + ffprobe — fail closed to the tracked Windows release pin.
  console.log("FFmpeg:");
  const ffmpegPin = await loadFfmpegPin();
  const ffmpeg = await findOnPath("ffmpeg", "AIVE_FFMPEG");
  const ffprobe = await findOnPath("ffprobe", "AIVE_FFPROBE");
  const ffmpegIdentity = await verifyPinnedFfmpeg(ffmpeg, ffprobe, ffmpegPin);
  const stagedFfmpeg = join(STAGE, "ffmpeg", "ffmpeg" + EXE);
  const stagedFfprobe = join(STAGE, "ffmpeg", "ffprobe" + EXE);
  await copyIfNeeded(ffmpeg, stagedFfmpeg);
  await copyIfNeeded(ffprobe, stagedFfprobe);
  console.log(`  • verified + staged ${ffmpegPin.expectedVersionToken}`);

  // 2. whisper-cli + sibling DLLs + default model.
  console.log("whisper.cpp:");
  const { bin, model } = await ensureWhisper(DEFAULT_MODEL);
  const binDir = dirname(bin);
  const stagedWhisperFiles: string[] = [];
  for (const e of await readdir(binDir, { withFileTypes: true })) {
    if (!e.isFile()) continue;
    const dest = join(STAGE, "whisper", "bin", e.name);
    await copyIfNeeded(join(binDir, e.name), dest);
    stagedWhisperFiles.push(dest);
  }
  const stagedWhisperModel = join(STAGE, "whisper", "models", basename(model));
  await copyIfNeeded(model, stagedWhisperModel);
  console.log(`  • staged ${basename(bin)} (+ runtime libraries) and ${basename(model)}`);

  // 3. YuNet face-detection model.
  console.log("YuNet:");
  const yunet = await ensureYunetModel();
  const stagedYunet = join(STAGE, "models", basename(yunet));
  await copyIfNeeded(yunet, stagedYunet);
  console.log(`  • staged ${basename(yunet)}`);

  // 4. OSS font for drawtext/captions.
  console.log("Font:");
  const stagedFont = join(STAGE, "fonts", "NotoSans-Regular.ttf");
  const stagedFontLicense = join(STAGE, "fonts", "LICENSE-NotoSans.txt");
  await download(FONT_URL, stagedFont, "Noto Sans Regular");
  await download(FONT_LICENSE_URL, stagedFontLicense, "Noto Sans license");
  console.log("  • staged NotoSans-Regular.ttf + license");

  // 5. Ship a human-readable source/provenance offer beside machine metadata.
  const stagedSourceOffer = join(STAGE, "compliance", "SOURCE_OFFER.md");
  await copyIfNeeded(SOURCE_OFFER_PATH, stagedSourceOffer);

  const manifest = {
    schemaVersion: 2,
    profile: "hybrid-commercial-windows",
    platform: `${process.platform}-${process.arch}`,
    generatedAt: new Date().toISOString(),
    sourceCommit: gitCommit(),
    sourceTrackedDirty: gitTrackedDirty(),
    dependencyLock: await repoFileRecord(PACKAGE_LOCK_PATH),
    distributionDocuments: [
      { targetPath: "LICENSE", source: await repoFileRecord(LICENSE_PATH) },
      { targetPath: "THIRD_PARTY_LICENSES.md", source: await repoFileRecord(THIRD_PARTY_LICENSES_PATH) },
      { targetPath: "SOURCE_OFFER.md", source: await repoFileRecord(SOURCE_OFFER_PATH) },
    ],
    components: {
      ffmpeg: {
        license: ffmpegPin.license,
        pin: ffmpegPin,
        observed: ffmpegIdentity,
        stagedFiles: [await fileRecord(stagedFfmpeg), await fileRecord(stagedFfprobe)],
      },
      whisper: {
        license: "MIT",
        release: WHISPER_RELEASE,
        releaseUrl: WHISPER_RELEASE_URL,
        binaryAsset: WHISPER_BINARY_ASSET,
        model: DEFAULT_MODEL,
        modelUrl: `${WHISPER_MODEL_BASE_URL}/ggml-${DEFAULT_MODEL}.bin`,
        stagedFiles: await Promise.all([...stagedWhisperFiles, stagedWhisperModel].map(fileRecord)),
      },
      yunet: {
        license: "Apache-2.0",
        sourceUrl: YUNET_URL,
        stagedFiles: [await fileRecord(stagedYunet)],
      },
      notoSans: {
        license: "OFL-1.1",
        sourceUrl: FONT_URL,
        licenseUrl: FONT_LICENSE_URL,
        stagedFiles: [await fileRecord(stagedFont), await fileRecord(stagedFontLicense)],
      },
      sourceOffer: {
        stagedFiles: [await fileRecord(stagedSourceOffer)],
      },
    },
    firstRunDownload: ["remotion-chrome-headless-shell"],
    releaseGates: {
      remotionCommercialBasisRequired: true,
      trustedWindowsSigningRequired: true,
    },
  };

  await writeFile(join(STAGE, "bundle-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`  • wrote bundle-manifest.json with exact hashes + source mapping`);
  console.log(`\nDone. Bundle size: ${fmt(await dirSize(STAGE))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
