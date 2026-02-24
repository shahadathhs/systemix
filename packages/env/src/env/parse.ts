/**
 * Parse a string to boolean. Accepts: true/false, 1/0, yes/no, empty string.
 * @param raw - Raw string value
 * @throws When value is not a valid boolean
 */
export function parseBoolean(raw: string): boolean {
  const lower = raw.toLowerCase().trim();
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no' || lower === '')
    return false;
  throw new Error(`Invalid boolean value: "${raw}"`);
}

/**
 * Parse a string to number. Uses Number() and checks isFinite.
 * @param raw - Raw string value
 * @throws When value is not a valid number
 */
export function parseNumber(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number value: "${raw}"`);
  }
  return n;
}

/**
 * Parse .env file content into key-value pairs.
 * Skips comments (#) and empty lines; unquotes " and ' values.
 *
 * @param content - Raw file content
 * @returns Map of KEY -> value strings
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\(.)/g, '$1');
    }

    result[key] = value;
  }

  return result;
}
