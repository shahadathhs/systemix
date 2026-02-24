/**
 * Tests for @systemix/token/token subpath – bytesToHex, bytesToBase64.
 */
import { createRunner } from '@systemix/runner';
import {
  generateToken as generateFromToken,
  bytesToHex,
  bytesToBase64,
} from '../dist/token/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const subpathToken = generateFromToken({ byteLength: 8 });
  assert(
    typeof subpathToken === 'string' && subpathToken.length === 16,
    'subpath token works',
  );

  const testBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
  assert(
    bytesToHex(testBytes) === '48656c6c6f',
    'bytesToHex sub-function works',
  );
  assert(
    bytesToBase64(testBytes) === 'SGVsbG8=',
    'bytesToBase64 sub-function works',
  );
});
