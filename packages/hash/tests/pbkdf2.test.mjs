/**
 * Tests for @systemix/hash – pbkdf2DeriveBits, generateSalt.
 */
import { createRunner } from '@systemix/runner';
import {
  pbkdf2DeriveBits,
  generateSalt,
  bytesToBase64Url,
  base64UrlToBytes,
  secureEqual,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrows, assertThrowsAsync }) => {
    const salt = generateSalt(16);
    assert(salt instanceof Uint8Array, 'generateSalt returns Uint8Array');
    assert(salt.length === 16, 'generateSalt respects length');

    const key = await pbkdf2DeriveBits('password', salt, {
      iterations: 1000,
      keyLength: 32,
    });
    assert(key instanceof Uint8Array, 'pbkdf2DeriveBits returns Uint8Array');
    assert(key.length === 32, 'pbkdf2DeriveBits respects keyLength');

    const key2 = await pbkdf2DeriveBits('password', salt, {
      iterations: 1000,
      keyLength: 32,
    });
    assert(
      bytesToBase64Url(key) === bytesToBase64Url(key2),
      'pbkdf2DeriveBits is deterministic for same inputs',
    );

    const key3 = await pbkdf2DeriveBits('password', generateSalt(16), {
      iterations: 1000,
      keyLength: 32,
    });
    assert(
      bytesToBase64Url(key) !== bytesToBase64Url(key3),
      'different salt yields different key',
    );

    const key512 = await pbkdf2DeriveBits('password', salt, {
      digest: 'SHA-512',
      iterations: 1000,
      keyLength: 32,
    });
    assert(
      bytesToBase64Url(key512) !== bytesToBase64Url(key),
      'different digest yields different key',
    );

    await assertThrowsAsync(
      () => pbkdf2DeriveBits('password', salt, { digest: 'MD5' }),
      'rejects unsupported digest',
    );
    await assertThrowsAsync(
      () => pbkdf2DeriveBits('password', salt, { iterations: 0 }),
      'rejects invalid iterations',
    );
    assertThrows(() => generateSalt(4), 'rejects salt below minimum length');

    const roundTrip = base64UrlToBytes(bytesToBase64Url(salt));
    assert(
      bytesToBase64Url(roundTrip) === bytesToBase64Url(salt),
      'base64url round-trips',
    );

    assert(secureEqual('same', 'same'), 'secureEqual true for equal strings');
    assert(
      !secureEqual('same', 'diff'),
      'secureEqual false for different strings',
    );
    assert(
      !secureEqual('short', 'longer-string'),
      'secureEqual false for different lengths',
    );
  },
);
