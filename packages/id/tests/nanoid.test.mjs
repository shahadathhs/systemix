/**
 * Tests for @systemix/id – generateId (nanoid-style).
 */
import { createRunner } from '@systemix/runner';
import { generateId, urlAlphabet } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  const id = generateId();
  assert(typeof id === 'string', 'returns string');
  assert(id.length === 21, 'defaults to 21 characters');
  assert(
    id.split('').every((c) => urlAlphabet.includes(c)),
    'uses urlAlphabet by default',
  );

  assert(generateId({ size: 10 }).length === 10, 'respects custom size');

  const hex = generateId({ size: 16, alphabet: '0123456789abcdef' });
  assert(
    hex.split('').every((c) => '0123456789abcdef'.includes(c)),
    'respects custom alphabet',
  );

  const samples = new Set(Array.from({ length: 100 }, () => generateId()));
  assert(samples.size === 100, 'generates unique IDs across samples');

  assertThrows(() => generateId({ size: 0 }), 'rejects size 0');
  assertThrows(() => generateId({ size: 1025 }), 'rejects size above 1024');
  assertThrows(() => generateId({ size: 1.5 }), 'rejects non-integer size');
  assertThrows(
    () => generateId({ alphabet: 'a' }),
    'rejects alphabet below 2 chars',
  );
  assertThrows(
    () => generateId({ alphabet: 'aab' }),
    'rejects alphabet with duplicates',
  );
});
