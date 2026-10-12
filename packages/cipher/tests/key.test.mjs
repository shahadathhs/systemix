/**
 * Tests for @systemix/cipher – key management and typed errors.
 */
import { createRunner } from '@systemix/runner';
import {
  generateKeyBytes,
  deriveKeyFromPassword,
  generateSalt,
  encryptString,
  decryptString,
  DecryptionError,
  InvalidKeyError,
  InvalidPayloadError,
  CipherError,
  IV_LENGTH,
  TAG_LENGTH,
  ALLOWED_KEY_LENGTHS,
  DEFAULT_KEY_LENGTH,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrows, assertThrowsAsync }) => {
    assert(IV_LENGTH === 12, 'IV_LENGTH is 12');
    assert(TAG_LENGTH === 128, 'TAG_LENGTH is 128');
    assert(DEFAULT_KEY_LENGTH === 32, 'DEFAULT_KEY_LENGTH is 32');

    const salt = generateSalt();
    assert(salt.length === 16, 'generateSalt defaults to 16 bytes');

    const key1 = await deriveKeyFromPassword('password', salt);
    const key2 = await deriveKeyFromPassword('password', salt);
    assert(key1.length === 32, 'deriveKeyFromPassword returns 32-byte key');
    assert(
      bytesToHex(key1) === bytesToHex(key2),
      'deriveKeyFromPassword is deterministic for same salt',
    );

    const key3 = await deriveKeyFromPassword('password', generateSalt());
    assert(
      bytesToHex(key1) !== bytesToHex(key3),
      'different salt yields different key',
    );

    const key4 = await deriveKeyFromPassword('password', salt, 100_000);
    assert(
      bytesToHex(key1) !== bytesToHex(key4),
      'different iterations yield different key',
    );

    // Derived keys work with the cipher
    const payload = await encryptString('secret', key1);
    assert(
      (await decryptString(payload, key1)) === 'secret',
      'derived key encrypts and decrypts',
    );

    assertThrows(() => generateKeyBytes(20), 'rejects non-standard key length');
    assertThrows(() => generateSalt(4), 'rejects salt below 8 bytes');
    await assertThrowsAsync(
      () => deriveKeyFromPassword('', salt),
      'rejects empty password',
    );
    await assertThrowsAsync(
      () => deriveKeyFromPassword('pw', new Uint8Array(4)),
      'rejects short salt',
    );

    // Typed errors
    assert(
      new DecryptionError() instanceof CipherError,
      'DecryptionError extends CipherError',
    );
    assert(
      new InvalidKeyError() instanceof CipherError,
      'InvalidKeyError extends CipherError',
    );
    assert(
      new InvalidPayloadError() instanceof CipherError,
      'InvalidPayloadError extends CipherError',
    );

    assert(
      ALLOWED_KEY_LENGTHS.join(',') === '16,24,32',
      'ALLOWED_KEY_LENGTHS is correct',
    );

    function bytesToHex(bytes) {
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  },
);
