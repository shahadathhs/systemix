/**
 * Tests for UUIDv7, monotonic generators, timestamp extraction, and
 * generateId uniformity.
 */
import { createRunner } from '@systemix/runner';
import {
  createMonotonicUlid,
  createMonotonicUuidV7,
  generateId,
  generateUlid,
  generateUuidV7,
  isUuid,
  ulidTimestamp,
  uuidV7Timestamp,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  // ── UUIDv7 ──────────────────────────────────────────────────────────
  const ts = 1_700_000_000_123;
  const v7 = generateUuidV7(ts);
  assert(isUuid(v7, 7), 'generateUuidV7 is a valid version 7 UUID');
  assert(v7.length === 36 && v7 === v7.toLowerCase(), 'canonical lowercase');
  assert(
    v7.replace('-', '').startsWith(ts.toString(16).padStart(12, '0')),
    'timestamp bytes are big-endian',
  );
  assert(uuidV7Timestamp(v7) === ts, 'uuidV7Timestamp round-trips');
  assert(
    Math.abs(uuidV7Timestamp(generateUuidV7()) - Date.now()) < 1000,
    'defaults to the current time',
  );
  assert(
    new Set(Array.from({ length: 1000 }, () => generateUuidV7(ts))).size ===
      1000,
    'same-millisecond v7 UUIDs are still unique',
  );
  assert(
    generateUuidV7(1) < generateUuidV7(2) &&
      generateUuidV7(1000) < generateUuidV7(5000),
    'v7 UUIDs sort by timestamp',
  );
  assert(uuidV7Timestamp(generateUuidV7(0)) === 0, 'timestamp 0 works');
  assert(
    uuidV7Timestamp(generateUuidV7(2 ** 48 - 1)) === 2 ** 48 - 1,
    'max 48-bit timestamp works',
  );
  assertThrows(() => generateUuidV7(-1), 'rejects negative timestamp');
  assertThrows(() => generateUuidV7(2 ** 48), 'rejects timestamp over 2^48-1');
  assertThrows(() => generateUuidV7(1.5), 'rejects non-integer timestamp');
  assertThrows(() => uuidV7Timestamp(crypto.randomUUID()), 'rejects v4 input');
  assertThrows(() => uuidV7Timestamp('nope'), 'rejects garbage input');

  // Variant and version bits across many samples
  let bitsOk = true;
  for (let i = 0; i < 500; i++) {
    const u = generateUuidV7(ts);
    if (u[14] !== '7' || !'89ab'.includes(u[19])) bitsOk = false;
  }
  assert(bitsOk, 'version nibble is 7 and variant bits are 10xx');

  // ── Monotonic UUIDv7 ────────────────────────────────────────────────
  const mono = createMonotonicUuidV7();
  const burst = Array.from({ length: 10_000 }, () => mono(ts));
  assert(
    burst.every((u, i) => i === 0 || u > burst[i - 1]),
    'strictly increasing within one millisecond',
  );
  assert(
    burst.every((u) => isUuid(u, 7)),
    'all monotonic outputs are valid v7',
  );
  assert(
    burst.every((u) => uuidV7Timestamp(u) === ts),
    'timestamp is stable while the counter increments',
  );
  const back = mono(ts - 5000);
  assert(
    back > burst[burst.length - 1] && uuidV7Timestamp(back) === ts,
    'clock stepping backwards never decreases output',
  );
  const later = mono(ts + 1);
  assert(
    later > back && uuidV7Timestamp(later) === ts + 1,
    'advances with time',
  );

  // ── ULID ────────────────────────────────────────────────────────────
  const ulid = generateUlid(ts);
  assert(ulidTimestamp(ulid) === ts, 'ulidTimestamp round-trips');
  assert(ulidTimestamp(generateUlid(0)) === 0, 'ulid timestamp 0');
  assert(
    ulidTimestamp(generateUlid(2 ** 48 - 1)) === 2 ** 48 - 1,
    'ulid max timestamp',
  );
  assertThrows(() => ulidTimestamp('short'), 'ulidTimestamp rejects garbage');
  assertThrows(
    () => ulidTimestamp('8' + 'Z'.repeat(25)),
    'ulidTimestamp rejects values above 2^48-1',
  );

  const ulids = createMonotonicUlid();
  const ub = Array.from({ length: 5000 }, () => ulids(ts));
  assert(
    ub.every((u, i) => i === 0 || u > ub[i - 1]),
    'monotonic ULID strictly increases within a millisecond',
  );
  const uback = ulids(ts - 10_000);
  assert(
    uback > ub[ub.length - 1] && ulidTimestamp(uback) === ts,
    'monotonic ULID never goes backwards when the clock does',
  );

  // ── generateId ──────────────────────────────────────────────────────
  const counts = new Map();
  const digits = '0123456789';
  for (const c of generateId({ size: 1000, alphabet: digits }).repeat(1)) {
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let big = '';
  for (let i = 0; i < 100; i++)
    big += generateId({ size: 1000, alphabet: digits });
  const tally = Object.fromEntries([...digits].map((d) => [d, 0]));
  for (const c of big) tally[c]++;
  assert(
    Object.values(tally).every((n) => n > 9_500 && n < 10_500),
    'non-power-of-2 alphabet is uniform (no modulo bias)',
  );

  const astral = ['😀', '😁', '😂', '🤣'];
  const emoji = generateId({ size: 200, alphabet: astral.join('') });
  assert(
    Array.from(emoji).length === 200 &&
      Array.from(emoji).every((c) => astral.includes(c)),
    'astral-plane alphabets produce whole symbols',
  );
  assert(
    generateId({ size: 8, alphabet: 'ab' }).length === 8,
    'two-symbol alphabet works',
  );
  assert(
    generateId({
      size: 8,
      alphabet: Array.from({ length: 256 }, (_, i) =>
        String.fromCharCode(0x100 + i),
      ).join(''),
    }).length === 8,
    '256-symbol alphabet works',
  );
  assertThrows(
    () => generateId({ alphabet: '😀😀' }),
    'duplicate astral symbols are rejected',
  );
});
