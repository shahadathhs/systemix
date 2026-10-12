import { uuidError } from '../utils/error.message';

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

/**
 * Checks whether a string is a valid RFC 9562 UUID (versions 1–8) with
 * the correct variant bits.
 *
 * @param value String to validate.
 * @param version Optional specific version (1–8) to require.
 */
export function isUuid(value: string, version?: number): string | false {
  if (!UUID_REGEX.test(value)) return false;

  if (version !== undefined) {
    if (!Number.isInteger(version) || version < 1 || version > 8) {
      throw new Error(uuidError.invalidVersion);
    }
    const actual = Number(value[14]);
    if (actual !== version) return false;
  }

  return value;
}
