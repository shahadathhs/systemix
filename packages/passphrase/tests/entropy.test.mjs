/**
 * Tests for calculatePassphraseEntropy().
 */
import { createRunner } from '@systemix/test';
import { calculatePassphraseEntropy } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  assert(calculatePassphraseEntropy(4, 7776) > 0, 'entropy > 0');
  assert(
    calculatePassphraseEntropy(0, 7776) === 0,
    'entropy 0 for wordCount 0',
  );
});
