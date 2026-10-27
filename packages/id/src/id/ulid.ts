import { getRandomInt } from '../utils/random';
import { ulidError, ulidOverflowError } from '../utils/error.message';

/**
 * Crockford Base32 alphabet per the ULID spec (excludes I, L, O, U).
 */
export const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const TIME_LENGTH = 10;
const RANDOM_LENGTH = 16;
const MAX_TIMESTAMP = 2 ** 48 - 1;

function encodeTime(timestamp: number): string {
  let remaining = timestamp;
  let encoded = '';
  for (let i = 0; i < TIME_LENGTH; i++) {
    encoded = CROCKFORD_BASE32[remaining % 32] + encoded;
    remaining = Math.floor(remaining / 32);
  }
  return encoded;
}

function randomChars(length: number): string[] {
  const chars: string[] = [];
  for (let i = 0; i < length; i++) {
    chars.push(CROCKFORD_BASE32[getRandomInt(32)]);
  }
  return chars;
}

/**
 * Generates a ULID: 26-character, lexicographically sortable identifier
 * with a 48-bit millisecond timestamp prefix and 80 bits of randomness.
 *
 * @param timestamp Milliseconds since Unix epoch. @default Date.now()
 */
export function generateUlid(timestamp: number = Date.now()): string {
  if (!Number.isInteger(timestamp) || timestamp < 0) {
    throw new Error(ulidError.invalidTimestamp);
  }
  if (timestamp > MAX_TIMESTAMP) {
    throw new Error(ulidError.timestampTooLarge);
  }
  return encodeTime(timestamp) + randomChars(RANDOM_LENGTH).join('');
}

/**
 * Creates a factory that generates monotonic ULIDs: when called within the
 * same millisecond, the random part is incremented instead of re-randomized,
 * guaranteeing strictly increasing output.
 */
export function createMonotonicUlid(): (timestamp?: number) => string {
  let lastTime = -1;
  let lastChars: string[] = [];

  const incrementChars = (): void => {
    for (let i = lastChars.length - 1; i >= 0; i--) {
      const nextIndex = CROCKFORD_BASE32.indexOf(lastChars[i]) + 1;
      if (nextIndex < 32) {
        lastChars[i] = CROCKFORD_BASE32[nextIndex];
        return;
      }
      lastChars[i] = CROCKFORD_BASE32[0];
    }
    // All 80 bits were set: wrapping would break ordering (ULID spec: error).
    throw new Error(ulidOverflowError);
  };

  return (timestamp: number = Date.now()): string => {
    if (!Number.isInteger(timestamp) || timestamp < 0) {
      throw new Error(ulidError.invalidTimestamp);
    }
    if (timestamp > MAX_TIMESTAMP) {
      throw new Error(ulidError.timestampTooLarge);
    }

    if (timestamp > lastTime) {
      lastTime = timestamp;
      lastChars = randomChars(RANDOM_LENGTH);
    } else {
      // Same millisecond, or the clock stepped backwards: keep the last
      // timestamp and increment so output never goes backwards.
      incrementChars();
    }

    return encodeTime(lastTime) + lastChars.join('');
  };
}

/**
 * Extracts the millisecond Unix timestamp from a ULID.
 * @throws If the value is not a valid 26-character ULID.
 */
export function ulidTimestamp(ulid: string): number {
  if (
    typeof ulid !== 'string' ||
    !/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(ulid)
  ) {
    throw new Error(ulidError.notUlid);
  }
  let time = 0;
  for (const char of ulid.slice(0, TIME_LENGTH).toUpperCase()) {
    time = time * 32 + CROCKFORD_BASE32.indexOf(char);
  }
  return time;
}
