/**
 * Tests for generatePassphrase() – TitleCase and UPPERCASE formatting.
 */
import { createRunner } from '@systemix/test';
import { generatePassphrase } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const ph2 = generatePassphrase({ wordCount: 3, useTitleCase: true });
  assert(/^[A-Z]/.test(ph2.split(' ')[0]), 'TitleCase capitalizes');

  const ph3 = generatePassphrase({ wordCount: 2, useUpperCase: true });
  assert(ph3 === ph3.toUpperCase(), 'UPPERCASE works');
});
