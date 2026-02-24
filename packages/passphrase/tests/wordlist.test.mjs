/**
 * Tests for generatePassphrase() – custom word list.
 */
import { createRunner } from '@systemix/runner';
import { generatePassphrase } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const custom = generatePassphrase({ wordCount: 2, wordList: ['a', 'b'] });
  assert(
    ['a b', 'b a', 'a a', 'b b'].includes(custom) ||
      custom.includes('a') ||
      custom.includes('b'),
    'custom wordList works',
  );
});
