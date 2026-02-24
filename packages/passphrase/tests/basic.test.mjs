/**
 * Tests for generatePassphrase() – basic generation and word count.
 */
import { createRunner } from '@systemix/runner';
import { generatePassphrase } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const ph1 = generatePassphrase({ wordCount: 4 });
  assert(typeof ph1 === 'string', 'returns string');
  assert(ph1.split(/\s+/).length === 4, 'word count respected');
});
