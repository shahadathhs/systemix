/**
 * Tests for generatePassphrase() – edge word counts and separators.
 */
import { createRunner } from '@systemix/test';
import { generatePassphrase } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  // Edge word counts
  assert(
    generatePassphrase({ wordCount: 1 }).split(/\s+/).length === 1,
    'wordCount 1 works',
  );
  assert(
    generatePassphrase({ wordCount: 20 }).split(/\s+/).length === 20,
    'wordCount 20 works',
  );

  // Separators
  assert(
    generatePassphrase({ wordCount: 2, separator: '-' }).includes('-'),
    'custom separator',
  );
  assert(
    generatePassphrase({ wordCount: 2, separator: '_' }).includes('_'),
    'underscore separator',
  );
});
