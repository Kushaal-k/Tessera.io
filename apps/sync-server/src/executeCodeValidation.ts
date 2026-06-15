import type { SupportedLanguage } from "@tessera/shared-types";

export const EXECUTE_CODE_MAX_CODE_BYTES = 64 * 1024; // 64KiB

export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  "typescript",
  "python",
  "cpp",
];

export function isSupportedLanguage(language: unknown): language is SupportedLanguage {
  return typeof language === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(language);
}

export function validateExecuteCodePayload(payload: {
  code: unknown;
  language: unknown;
}):
  | { ok: true; code: string; language: SupportedLanguage }
  | { ok: false; reason: string } {
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, reason: "Invalid payload" };
  }

  if (typeof payload.code !== "string") {
    return { ok: false, reason: "`code` must be a string" };
  }

  // Treat strings that are only whitespace as empty.
  const code = payload.code;
  if (code.trim().length === 0) {
    return { ok: false, reason: "`code` must be non-empty" };
  }

  if (!isSupportedLanguage(payload.language)) {
    return { ok: false, reason: "`language` is not supported" };
  }

  const codeBytes = Buffer.byteLength(code, "utf8");
  if (codeBytes > EXECUTE_CODE_MAX_CODE_BYTES) {
    return {
      ok: false,
      reason: `[0m\`code\` is too large (max ${EXECUTE_CODE_MAX_CODE_BYTES} bytes)`,
    };
  }

  return { ok: true, code, language: payload.language };
}

