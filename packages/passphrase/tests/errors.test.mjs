/**
 * Tests for generatePassphrase() – validation errors.
 */
import { createRunner } from '@systemix/test';
import { generatePassphrase } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assertThrows }) => {
  assertThrows(
    () => generatePassphrase({ foo: 'bar' }),
    'throws on invalid prop',
  );
});
