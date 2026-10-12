/**
 * Tests for @systemix/id – generateUuid, isUuid.
 */
import { createRunner } from '@systemix/runner';
import { generateUuid, isUuid } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  const uuid = generateUuid();
  assert(typeof uuid === 'string', 'returns string');
  assert(isUuid(uuid), 'generates a valid UUID');
  assert(isUuid(uuid, 4), 'generates version 4 UUIDs');
  assert(uuid.length === 36, 'UUID is 36 characters with hyphens');
  assert(uuid === uuid.toLowerCase(), 'uses lowercase hex');

  const samples = new Set(Array.from({ length: 100 }, () => generateUuid()));
  assert(samples.size === 100, 'generates unique UUIDs across samples');

  assert(!isUuid('not-a-uuid'), 'isUuid rejects arbitrary strings');
  assert(!isUuid('00000000-0000-0000-0000-000000000000'), 'rejects nil UUID');
  assert(
    !isUuid('12345678-1234-1234-1234-123456789abc'),
    'rejects wrong variant bits',
  );

  const v4 = generateUuid();
  assert(!isUuid(v4, 7), 'isUuid rejects version mismatch');

  assertThrows(() => isUuid(v4, 9), 'rejects invalid version argument');
  assertThrows(() => isUuid(v4, 0), 'rejects version 0');
});
