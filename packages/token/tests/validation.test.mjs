/**
 * Tests for generateToken() – validation errors.
 */
import { createRunner } from '@systemix/runner';
import { generateToken } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assertThrows }) => {
  assertThrows(
    () => generateToken({ byteLength: 0 }),
    'throws on byteLength 0',
  );
  assertThrows(
    () => generateToken({ byteLength: 2000 }),
    'throws on byteLength too large',
  );
  assertThrows(
    () => generateToken({ charset: 'invalid' }),
    'throws on invalid charset',
  );
  assertThrows(() => generateToken({ count: 0 }), 'throws on count 0');
  assertThrows(() => generateToken({ count: 20 }), 'throws on count too large');
  assertThrows(() => generateToken({ foo: 'bar' }), 'throws on invalid prop');
});
