import { uuidError } from '../utils/error.message';
import { getRandomBytes } from '../utils/random';

/**
 * Generates a random UUID (version 4, RFC 9562) in the standard 8-4-4-4-12
 * format via crypto.randomUUID.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}

const MAX_TIMESTAMP = 2 ** 48 - 1;
/** rand_a (12 bits) + rand_b (62 bits) of a version 7 UUID. */
const COUNTER_BITS = 74n;
const COUNTER_MAX = (1n << COUNTER_BITS) - 1n;
/** Top bit cleared on a fresh counter so increments within a ms have headroom. */
const COUNTER_FRESH_MASK = (1n << (COUNTER_BITS - 1n)) - 1n;
const RAND_B_BITS = 62n;
const RAND_B_MASK = (1n << RAND_B_BITS) - 1n;

function assertTimestamp(timestamp: number): void {
  if (!Number.isInteger(timestamp) || timestamp < 0) {
    throw new Error(uuidError.invalidTimestamp);
  }
  if (timestamp > MAX_TIMESTAMP) {
    throw new Error(uuidError.timestampTooLarge);
  }
}

function randomCounter(): bigint {
  const bytes = getRandomBytes(10);
  let value = 0n;
  for (const byte of bytes) value = (value << 8n) | BigInt(byte);
  return value & COUNTER_MAX;
}

function formatV7(timestamp: number, counter: bigint): string {
  const bytes = new Uint8Array(16);
  let ts = timestamp;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ts % 256;
    ts = Math.floor(ts / 256);
  }
  const randA = Number(counter >> RAND_B_BITS);
  let randB = counter & RAND_B_MASK;
  bytes[6] = 0x70 | (randA >> 8);
  bytes[7] = randA & 0xff;
  for (let i = 15; i >= 9; i--) {
    bytes[i] = Number(randB & 0xffn);
    randB >>= 8n;
  }
  bytes[8] = 0x80 | Number(randB & 0x3fn);

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    '',
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Generates a UUID version 7 (RFC 9562): a 48-bit millisecond Unix timestamp
 * followed by 74 random bits. Sorts by creation time, so it keeps database
 * indexes local where version 4 scatters inserts.
 *
 * The timestamp is visible in the ID — use version 4 where creation time must
 * stay private. IDs generated in the same millisecond are not ordered; use
 * createMonotonicUuidV7 when that matters.
 *
 * @param timestamp Milliseconds since Unix epoch. @default Date.now()
 */
export function generateUuidV7(timestamp: number = Date.now()): string {
  assertTimestamp(timestamp);
  return formatV7(timestamp, randomCounter());
}

/**
 * Creates a generator of strictly increasing UUIDv7s (RFC 9562 §6.2). Within
 * one millisecond — or if the clock steps backwards — the 74 random bits are
 * incremented instead of re-randomized; if they would overflow, the timestamp
 * advances by one millisecond.
 */
export function createMonotonicUuidV7(): (timestamp?: number) => string {
  let lastTime = -1;
  let counter = 0n;

  return (timestamp: number = Date.now()): string => {
    assertTimestamp(timestamp);

    if (timestamp > lastTime) {
      lastTime = timestamp;
      counter = randomCounter() & COUNTER_FRESH_MASK;
    } else if (counter < COUNTER_MAX) {
      counter += 1n;
    } else {
      assertTimestamp(lastTime + 1);
      lastTime += 1;
      counter = randomCounter() & COUNTER_FRESH_MASK;
    }
    return formatV7(lastTime, counter);
  };
}

/**
 * Extracts the millisecond Unix timestamp from a UUIDv7.
 * @throws If the value is not a valid UUID version 7.
 */
export function uuidV7Timestamp(uuid: string): number {
  if (
    typeof uuid !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      uuid,
    )
  ) {
    throw new Error(uuidError.notV7);
  }
  return parseInt(uuid.slice(0, 8) + uuid.slice(9, 13), 16);
}
