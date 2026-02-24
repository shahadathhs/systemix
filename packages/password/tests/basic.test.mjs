/**
 * Tests for generatePassword() – basic generation, length, default charset.
 */
import { createRunner } from '@systemix/runner';
import { generatePassword } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const p1 = generatePassword({ length: 12 });
  assert(typeof p1 === 'string', 'returns string');
  assert(p1.length === 12, 'respects length');

  const samples = Array.from({ length: 10 }, () =>
    generatePassword({ length: 12 }),
  );
  const hasAllTypes = samples.some(
    (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p),
  );
  assert(hasAllTypes, 'includes lowercase, uppercase, numbers by default');
});
