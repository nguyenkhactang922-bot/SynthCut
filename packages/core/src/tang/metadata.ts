import { existsSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";

export const TANG_METADATA_SCHEMA_VERSION = 1 as const;

export interface TangMetadata {
  schemaVersion: typeof TANG_METADATA_SCHEMA_VERSION;
  coreProjectId: string;
  basedOnRevision: number;
  updatedAt: string;
  /** Normalized creative/editorial intent. Never authoritative edit state. */
  brief?: Record<string, unknown>;
  /** Derived PROJECT→CHAPTER→SCENE/BEAT read/index data only. */
  readModel?: Record<string, unknown>;
  /** Derived analysis summaries only. */
  analysis?: Record<string, unknown>;
  /** Durable references to batch audit records, not timeline state. */
  batchAuditRefs?: string[];
  /** Durable references to recoverable checkpoints. */
  checkpointRefs?: string[];
  /** Durable references to QA/evidence artifacts. */
  evidenceRefs?: string[];
}

export type TangMetadataState = "unavailable" | "missing" | "valid" | "stale" | "invalid";

export interface TangMetadataStatus {
  state: TangMetadataState;
  path?: string;
  reason?: string;
  coreProjectId?: string;
  basedOnRevision?: number;
}

export interface TangProjectBinding {
  id: string;
  revision: number;
}

/** `<project>.aive` -> adjacent `<project>.tang.json`. Other recovery-like paths append `.tang.json`. */
export function tangMetadataPath(projectPath: string): string {
  const dir = dirname(projectPath);
  const file = basename(projectPath);
  const stem = /\.aive$/i.test(file) ? file.replace(/\.aive$/i, "") : file;
  return join(dir, `${stem}.tang.json`);
}

export function createTangMetadata(
  binding: TangProjectBinding,
  previous?: TangMetadata | null,
): TangMetadata {
  return {
    ...(previous ?? {}),
    schemaVersion: TANG_METADATA_SCHEMA_VERSION,
    coreProjectId: binding.id,
    basedOnRevision: binding.revision,
    updatedAt: new Date().toISOString(),
  };
}

export async function loadTangMetadata(
  projectPath: string,
  binding: TangProjectBinding,
): Promise<{ metadata: TangMetadata | null; status: TangMetadataStatus }> {
  const path = tangMetadataPath(projectPath);
  if (!existsSync(path)) return { metadata: null, status: { state: "missing", path } };

  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(path, "utf8"));
  } catch (err) {
    return {
      metadata: null,
      status: { state: "invalid", path, reason: `unreadable_or_invalid_json: ${errorMessage(err)}` },
    };
  }

  if (!isTangMetadata(parsed)) {
    return { metadata: null, status: { state: "invalid", path, reason: "schema_invalid_or_unsupported" } };
  }

  if (parsed.coreProjectId !== binding.id) {
    return {
      metadata: null,
      status: {
        state: "stale",
        path,
        reason: "core_project_id_mismatch",
        coreProjectId: parsed.coreProjectId,
        basedOnRevision: parsed.basedOnRevision,
      },
    };
  }

  if (parsed.basedOnRevision !== binding.revision) {
    return {
      metadata: null,
      status: {
        state: "stale",
        path,
        reason: "core_project_revision_mismatch",
        coreProjectId: parsed.coreProjectId,
        basedOnRevision: parsed.basedOnRevision,
      },
    };
  }

  return {
    metadata: parsed,
    status: {
      state: "valid",
      path,
      coreProjectId: parsed.coreProjectId,
      basedOnRevision: parsed.basedOnRevision,
    },
  };
}

/**
 * Best-effort safe replacement: write a temp file in the target directory and rename it into place.
 * On Windows, replacing an existing file can reject; in that case a backup-swap preserves the old
 * file until the replacement is ready and restores it if the final rename fails.
 */
export async function saveTangMetadata(projectPath: string, metadata: TangMetadata): Promise<string> {
  const path = tangMetadataPath(projectPath);
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });
  const nonce = `${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const tmp = join(dir, `.${basename(path)}.${nonce}.tmp`);
  const backup = join(dir, `.${basename(path)}.${nonce}.bak`);
  await writeFile(tmp, JSON.stringify(metadata, null, 2), "utf8");

  let backupCreated = false;
  let committed = false;
  try {
    try {
      await rename(tmp, path);
      committed = true;
    } catch (err) {
      if (!existsSync(path)) throw err;
      await rename(path, backup);
      backupCreated = true;
      try {
        await rename(tmp, path);
        committed = true;
      } catch (replaceErr) {
        if (!existsSync(path) && existsSync(backup)) {
          await rename(backup, path);
          backupCreated = false;
        }
        throw replaceErr;
      }
    }
    return path;
  } finally {
    await rm(tmp, { force: true }).catch(() => {});
    if (committed && backupCreated) await rm(backup, { force: true }).catch(() => {});
  }
}

export function rebaseTangMetadata(metadata: TangMetadata, binding: TangProjectBinding): TangMetadata {
  return createTangMetadata(binding, metadata);
}

const TANG_METADATA_KEYS = new Set([
  "schemaVersion",
  "coreProjectId",
  "basedOnRevision",
  "updatedAt",
  "brief",
  "readModel",
  "analysis",
  "batchAuditRefs",
  "checkpointRefs",
  "evidenceRefs",
]);

function isTangMetadata(value: unknown): value is TangMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  if (Object.keys(v).some((key) => !TANG_METADATA_KEYS.has(key))) return false;
  return (
    v.schemaVersion === TANG_METADATA_SCHEMA_VERSION &&
    typeof v.coreProjectId === "string" &&
    v.coreProjectId.length > 0 &&
    typeof v.basedOnRevision === "number" &&
    Number.isInteger(v.basedOnRevision) &&
    v.basedOnRevision >= 0 &&
    typeof v.updatedAt === "string" &&
    v.updatedAt.length > 0 &&
    optionalRecord(v.brief) &&
    optionalRecord(v.readModel) &&
    optionalRecord(v.analysis) &&
    optionalStringArray(v.batchAuditRefs) &&
    optionalStringArray(v.checkpointRefs) &&
    optionalStringArray(v.evidenceRefs)
  );
}

function optionalRecord(value: unknown): boolean {
  return value === undefined || (!!value && typeof value === "object" && !Array.isArray(value));
}

function optionalStringArray(value: unknown): boolean {
  return value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
