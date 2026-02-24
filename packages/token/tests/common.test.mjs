/**
 * Tests for @systemix/token/common – getRandomBytes, getRandomInt, bytesEqual, secureCompare.
 */
import { createRunner } from '@systemix/runner';
import {
  getRandomBytes,
  getRandomInt,
  bytesEqual,
  secureCompare,
} from '../dist/common/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const randBytes = getRandomBytes(32);
  assert(randBytes instanceof Uint8Array, 'getRandomBytes returns Uint8Array');
  assert(randBytes.length === 32, 'getRandomBytes length correct');

  const randInt = getRandomInt(100);
  assert(
    Number.isInteger(randInt) && randInt >= 0 && randInt < 100,
    'getRandomInt in [0, max)',
  );

  const sameA = new Uint8Array([1, 2, 3]);
  const sameB = new Uint8Array([1, 2, 3]);
  const diff = new Uint8Array([1, 2, 4]);
  assert(bytesEqual(sameA, sameB), 'bytesEqual returns true for equal arrays');
  assert(
    !bytesEqual(sameA, diff),
    'bytesEqual returns false for different arrays',
  );
  assert(
    !bytesEqual(sameA, new Uint8Array([1, 2])),
    'bytesEqual false for different length',
  );

  assert(
    secureCompare('hello', 'hello'),
    'secureCompare returns true for equal strings',
  );
  assert(
    !secureCompare('hello', 'world'),
    'secureCompare returns false for different strings',
  );
  assert(
    !secureCompare('ab', 'abc'),
    'secureCompare false for different length',
  );
});
