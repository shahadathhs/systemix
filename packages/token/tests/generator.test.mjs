/**
 * Tests for generateToken() – charsets, count, defaults.
 */
import { createRunner } from '@systemix/test';
import { generateToken } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  // Basic hex (default)
  const t1 = generateToken({ byteLength: 16 });
  assert(typeof t1 === 'string', 'returns string');
  assert(t1.length === 32, 'hex: 16 bytes = 32 chars');

  // Charsets
  const hexToken = generateToken({ byteLength: 8, charset: 'hex' });
  assert(/^[0-9a-f]+$/.test(hexToken), 'hex charset produces hex string');
  assert(hexToken.length === 16, 'hex length correct');

  const base64Token = generateToken({ byteLength: 12, charset: 'base64' });
  assert(/^[A-Za-z0-9+/]+=*$/.test(base64Token), 'base64 charset valid');

  const base64urlToken = generateToken({
    byteLength: 12,
    charset: 'base64url',
  });
  assert(
    !base64urlToken.includes('+') && !base64urlToken.includes('/'),
    'base64url has no + or /',
  );

  const alphanumericToken = generateToken({
    byteLength: 24,
    charset: 'alphanumeric',
  });
  assert(
    /^[A-Za-z0-9]+$/.test(alphanumericToken),
    'alphanumeric charset valid',
  );
  assert(alphanumericToken.length === 24, 'alphanumeric length = byteLength');

  // Count
  const arr = generateToken({ byteLength: 8, count: 5 });
  assert(Array.isArray(arr) && arr.length === 5, 'count returns array');
  assert(
    arr.every((t) => typeof t === 'string'),
    'each is string',
  );

  // Defaults
  const defaultToken = generateToken();
  assert(typeof defaultToken === 'string', 'default returns string');
  assert(defaultToken.length === 64, 'default 32 bytes = 64 hex chars');
});
