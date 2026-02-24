import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnvFile } from './parse';

/**
 * Load env vars from a .env file. Returns {} if file does not exist.
 *
 * @param filePath - Path relative to cwd or absolute
 * @param cwd - Working directory for resolution
 * @returns Parsed key-value pairs
 */
export function loadEnvFile(
  filePath: string,
  cwd: string,
): Record<string, string> {
  const resolved = resolve(cwd, filePath);
  if (!existsSync(resolved)) {
    return {};
  }
  const content = readFileSync(resolved, 'utf-8');
  return parseEnvFile(content);
}

/** Get current working directory, or '.' if process.cwd is unavailable. */
export function getCwd(): string {
  return typeof globalThis.process?.cwd === 'function'
    ? globalThis.process.cwd()
    : '.';
}

/** Merge overlay env into base. Overlay keys override base. */
export function mergeEnv(
  base: Record<string, string | undefined>,
  overlay: Record<string, string>,
): Record<string, string | undefined> {
  const merged = { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    merged[k] = v;
  }
  return merged;
}

/** Get process.env as a plain object, or {} if unavailable. */
export function getEnvSource(): Record<string, string | undefined> {
  const env = globalThis.process?.env;
  if (env && typeof env === 'object') {
    return env as Record<string, string | undefined>;
  }
  return {};
}
