/**
 * Tests for generatePassword() – count option (batch generation).
 */
import { createRunner } from '@systemix/test';
import { generatePassword } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const arr = generatePassword({ length: 8, count: 5 });
  assert(Array.isArray(arr) && arr.length === 5, 'count returns array');
  assert(
    arr.every((p) => typeof p === 'string' && p.length === 8),
    'each has correct length',
  );
});
