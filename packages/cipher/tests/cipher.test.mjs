/**
 * Tests for @systemix/cipher – encrypt, decrypt, string helpers, AAD.
 */
import { createRunner } from '@systemix/runner';
import {
  generateKeyBytes,
  encrypt,
  decrypt,
  encryptString,
  decryptString,
  IV_LENGTH,
} from '../dist/index.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrowsAsync }) => {
    const key = generateKeyBytes();
    assert(key instanceof Uint8Array, 'generateKeyBytes returns Uint8Array');
    assert(key.length === 32, 'generateKeyBytes defaults to 32 bytes');
    assert(generateKeyBytes(16).length === 16, 'supports AES-128 keys');

    const plaintext = 'attack at dawn';
    const payload = await encrypt(plaintext, key);
    assert(payload instanceof Uint8Array, 'encrypt returns Uint8Array');
    assert(payload.length > IV_LENGTH + 16, 'payload includes IV and tag');
    assert(
      payload[0] === 0x53 && payload[1] === 0x58 && payload[2] === 1,
      'payload starts with the SX v1 envelope header',
    );
    assert(
      payload.length === 4 + IV_LENGTH + plaintext.length + 16,
      'envelope = header + IV + ciphertext + tag',
    );
    assert(
      !decoder.decode(payload).includes(plaintext),
      'ciphertext hides plaintext',
    );

    const decrypted = await decrypt(payload, key);
    assert(decoder.decode(decrypted) === plaintext, 'decrypt round-trips');

    const differentKey = generateKeyBytes();
    await assertThrowsAsync(
      () => decrypt(payload, differentKey),
      'decrypt rejects wrong key',
    );

    const tampered = Uint8Array.from(payload);
    tampered[tampered.length - 1] ^= 0xff;
    await assertThrowsAsync(
      () => decrypt(tampered, key),
      'decrypt detects tampering',
    );

    const encrypted = await encryptString('hello secret', key);
    assert(typeof encrypted === 'string', 'encryptString returns string');
    assert(
      !encrypted.includes('+') &&
        !encrypted.includes('/') &&
        !encrypted.includes('='),
      'payload is URL-safe base64',
    );
    assert(
      (await decryptString(encrypted, key)) === 'hello secret',
      'decryptString round-trips',
    );

    const unicode = await encryptString('héllo ✓ 世界', key);
    assert(
      (await decryptString(unicode, key)) === 'héllo ✓ 世界',
      'handles unicode strings',
    );

    const empty = await encryptString('', key);
    assert((await decryptString(empty, key)) === '', 'handles empty plaintext');

    const aad = encoder.encode('user:42');
    const withAad = await encrypt('protected', key, { additionalData: aad });
    assert(
      decoder.decode(await decrypt(withAad, key, { additionalData: aad })) ===
        'protected',
      'AAD round-trips when matched',
    );
    await assertThrowsAsync(
      () =>
        decrypt(withAad, key, { additionalData: encoder.encode('user:43') }),
      'decrypt rejects wrong AAD',
    );

    const payload2 = await encrypt(plaintext, key);
    assert(
      bytesToHex(payload2) !== bytesToHex(await encrypt(plaintext, key)),
      'random IV produces different ciphertext per call',
    );

    await assertThrowsAsync(
      () => encrypt('x', new Uint8Array(8)),
      'rejects invalid key length',
    );
    await assertThrowsAsync(
      () => decryptString('', key),
      'decryptString rejects empty payload',
    );
    await assertThrowsAsync(
      () =>
        decrypt(withAad, key, { additionalData: aad, allowLegacy: false }).then(
          () =>
            decrypt(withAad, key, {
              additionalData: encoder.encode('x'),
              allowLegacy: false,
            }),
        ),
      'allowLegacy:false still rejects wrong AAD',
    );
    await assertThrowsAsync(
      () => decrypt(new Uint8Array(10), key),
      'decrypt rejects payload shorter than IV + tag',
    );

    function bytesToHex(bytes) {
      return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    }
  },
);
