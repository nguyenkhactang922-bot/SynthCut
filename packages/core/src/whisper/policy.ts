import { DEFAULT_MODEL, type WhisperModel } from "./setup.js";

export const VIETNAMESE_EDIT_MODEL: WhisperModel = "large-v3-turbo";
export const VIETNAMESE_LANGUAGE = "vi";
export const VIETNAMESE_CUT_GUARD_SEC = 0.12;

export interface ResolvedTranscriptionPolicy {
  model: WhisperModel;
  language: string;
  vietnamese: boolean;
}

function normalizeLanguage(language?: string): string | undefined {
  const normalized = language?.trim().toLowerCase().replaceAll("_", "-");
  if (!normalized) return undefined;
  if (normalized === "vietnamese" || normalized === "vie" || normalized === "vi-vn") return VIETNAMESE_LANGUAGE;
  return normalized;
}

export function isVietnameseLanguage(language?: string): boolean {
  const normalized = normalizeLanguage(language);
  return normalized === VIETNAMESE_LANGUAGE || normalized?.startsWith("vi-") === true;
}

/**
 * Resolve the frozen edit-grade transcription policy without changing the
 * existing English/default behavior for other languages.
 *
 * Vietnamese is deliberately strict: v1 has one accepted edit-grade model.
 * An explicit incompatible model fails closed instead of silently downgrading.
 */
export function resolveTranscriptionPolicy(opts: { model?: WhisperModel; language?: string } = {}): ResolvedTranscriptionPolicy {
  const normalizedLanguage = normalizeLanguage(opts.language);
  if (isVietnameseLanguage(normalizedLanguage)) {
    if (opts.model && opts.model !== VIETNAMESE_EDIT_MODEL) {
      throw new Error(
        `Vietnamese edit-grade transcription is frozen to ${VIETNAMESE_EDIT_MODEL}; model "${opts.model}" is not accepted.`,
      );
    }
    return { model: VIETNAMESE_EDIT_MODEL, language: VIETNAMESE_LANGUAGE, vietnamese: true };
  }
  return {
    model: opts.model ?? DEFAULT_MODEL,
    language: normalizedLanguage ?? "en",
    vietnamese: false,
  };
}

export type GuardedGapCut =
  | {
      status: "SAFE_CUT";
      reviewNeeded: false;
      leftSec: number;
      rightSec: number;
      gapSec: number;
      removeStartSec: number;
      removeEndSec: number;
      retainedGuardLeftSec: number;
      retainedGuardRightSec: number;
    }
  | {
      status: "SAFE_NOOP";
      reviewNeeded: true;
      reason: "insufficient_gap_for_guard";
      leftSec: number;
      rightSec: number;
      gapSec: number;
    };

/** Production form of the frozen AC-18 gap resolver used by the DESIGN POC. */
export function resolveGuardedGapCut(
  leftSec: number,
  rightSec: number,
  guardEachSideSec = VIETNAMESE_CUT_GUARD_SEC,
): GuardedGapCut {
  if (![leftSec, rightSec, guardEachSideSec].every(Number.isFinite)) {
    throw new Error("Transcript cut boundaries and guard must be finite numbers.");
  }
  if (guardEachSideSec < 0) throw new Error("Transcript cut guard cannot be negative.");
  if (rightSec < leftSec) throw new Error("Transcript cut right boundary must be >= left boundary.");

  const gapSec = Math.max(0, rightSec - leftSec);
  if (gapSec <= guardEachSideSec * 2) {
    return {
      status: "SAFE_NOOP",
      reviewNeeded: true,
      reason: "insufficient_gap_for_guard",
      leftSec,
      rightSec,
      gapSec,
    };
  }

  const removeStartSec = leftSec + guardEachSideSec;
  const removeEndSec = rightSec - guardEachSideSec;
  return {
    status: "SAFE_CUT",
    reviewNeeded: false,
    leftSec,
    rightSec,
    gapSec,
    removeStartSec,
    removeEndSec,
    retainedGuardLeftSec: removeStartSec - leftSec,
    retainedGuardRightSec: rightSec - removeEndSec,
  };
}

export interface WordLikeTiming {
  start: number;
  end: number;
  text?: string;
}

export type GuardedWordRemoval =
  | {
      status: "SAFE_CUT";
      reviewNeeded: false;
      removeStartSec: number;
      removeEndSec: number;
      leftGapSec: number;
      rightGapSec: number;
    }
  | {
      status: "SAFE_NOOP";
      reviewNeeded: true;
      reason: "insufficient_left_guard" | "insufficient_right_guard" | "insufficient_both_guards";
      leftGapSec: number;
      rightGapSec: number;
    };

/**
 * Resolve a requested spoken-word deletion conservatively. The selected words
 * are removable only when the neighboring kept speech (or source-window edge)
 * leaves the frozen breathing-room guard on both sides.
 */
export function resolveGuardedWordRemoval(
  words: readonly WordLikeTiming[],
  fromWord: number,
  toWord: number,
  contextStartSec: number,
  contextEndSec: number,
  guardEachSideSec = VIETNAMESE_CUT_GUARD_SEC,
): GuardedWordRemoval {
  if (words.length === 0) throw new Error("Cannot resolve a transcript cut without word timings.");
  const from = Math.min(fromWord, toWord);
  const to = Math.max(fromWord, toWord);
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to >= words.length) {
    throw new Error(`Transcript word range [${fromWord}, ${toWord}] is out of bounds.`);
  }
  if (![contextStartSec, contextEndSec, guardEachSideSec].every(Number.isFinite) || contextEndSec < contextStartSec) {
    throw new Error("Transcript cut context and guard must be finite and ordered.");
  }

  const first = words[from];
  const last = words[to];
  const previousEnd = from > 0 ? Math.max(contextStartSec, words[from - 1].end) : contextStartSec;
  const nextStart = to + 1 < words.length ? Math.min(contextEndSec, words[to + 1].start) : contextEndSec;
  const leftGapSec = Math.max(0, first.start - previousEnd);
  const rightGapSec = Math.max(0, nextStart - last.end);
  const leftSafe = leftGapSec + 1e-9 >= guardEachSideSec;
  const rightSafe = rightGapSec + 1e-9 >= guardEachSideSec;

  if (!leftSafe || !rightSafe) {
    return {
      status: "SAFE_NOOP",
      reviewNeeded: true,
      reason: !leftSafe && !rightSafe ? "insufficient_both_guards" : !leftSafe ? "insufficient_left_guard" : "insufficient_right_guard",
      leftGapSec,
      rightGapSec,
    };
  }

  return {
    status: "SAFE_CUT",
    reviewNeeded: false,
    removeStartSec: first.start,
    removeEndSec: last.end,
    leftGapSec,
    rightGapSec,
  };
}
