/**
 * Tests for generatePassword() – validation errors.
 */
import { createRunner } from '@systemix/test';
import { generatePassword } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assertThrows }) => {
  assertThrows(
    () =>
      generatePassword({
        length: 5,
        minNumbers: 10,
        minUppercase: 5,
        useNumbers: true,
        useUppercase: true,
      }),
    'throws when min requirements exceed length',
  );
  assertThrows(
    () =>
      generatePassword({
        length: 12,
        useNumbers: false,
        useUppercase: false,
        useLowercase: false,
        useSymbols: false,
      }),
    'throws when all charsets disabled',
  );
});
