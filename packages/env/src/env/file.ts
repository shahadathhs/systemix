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
  return parseEnvFile(readFileSync(resolved, 'utf-8'));
}

/** Get the current working directory. */
export function getCwd(): string {
  return process.cwd();
}

/**
 * Merge env layers. Later layers win; `undefined` values never override.
 * Typical order: .env files first, the real environment last.
 */
export function mergeEnv(
  ...layers: ReadonlyArray<Record<string, string | undefined>>
): Record<string, string | undefined> {
  const merged: Record<string, string | undefined> = {};
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined) merged[key] = value;
    }
  }
  return merged;
}

/** Get process.env as a plain object. */
export function getEnvSource(): Record<string, string | undefined> {
  return process.env;
}
