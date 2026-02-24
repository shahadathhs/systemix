/**
 * Tests for calculatePasswordEntropy().
 */
import { createRunner } from '@systemix/test';
import { calculatePasswordEntropy } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  assert(calculatePasswordEntropy(12, 62) > 0, 'entropy > 0');
  assert(calculatePasswordEntropy(0, 62) === 0, 'entropy 0 for length 0');
});
