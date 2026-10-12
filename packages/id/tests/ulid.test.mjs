/**
 * Tests for @systemix/id – generateUlid, createMonotonicUlid.
 */
import { createRunner } from '@systemix/runner';
import {
  generateUlid,
  createMonotonicUlid,
  CROCKFORD_BASE32,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  const ulid = generateUlid();
  assert(typeof ulid === 'string', 'returns string');
  assert(ulid.length === 26, 'ULID is 26 characters');
  assert(
    ulid.split('').every((c) => CROCKFORD_BASE32.includes(c)),
    'uses Crockford Base32 alphabet',
  );

  assert(
    generateUlid(0).startsWith('0000000000'),
    'encodes timestamp 0 as all-zero prefix',
  );
  assert(
    generateUlid(32).startsWith('0000000010'),
    'encodes small timestamps in base32',
  );
  assert(
    generateUlid(2 ** 48 - 1).startsWith('7'),
    'encodes max timestamp with leading 7',
  );

  const earlier = generateUlid(1_000_000_000_000);
  const later = generateUlid(2_000_000_000_000);
  assert(earlier < later, 'lexicographic order matches chronological order');

  assertThrows(() => generateUlid(-1), 'rejects negative timestamp');
  assertThrows(() => generateUlid(1.5), 'rejects non-integer timestamp');
  assertThrows(() => generateUlid(2 ** 48), 'rejects timestamp above 2^48 - 1');

  const monotonic = createMonotonicUlid();
  const same = 1_700_000_000_000;
  const ids = [
    monotonic(same),
    monotonic(same),
    monotonic(same),
    monotonic(same + 1),
  ];
  assert(
    ids[0] < ids[1] && ids[1] < ids[2] && ids[2] < ids[3],
    'monotonic ULIDs strictly increase',
  );
  assert(
    ids.slice(0, 3).every((id) => id.startsWith(ids[0].slice(0, 10))),
    'monotonic ULIDs share timestamp prefix within same ms',
  );

  assertThrows(() => monotonic(-5), 'monotonic factory rejects bad timestamp');
});
