/**
 * Tests for the versioned envelope, legacy payloads and keyrings.
 */
import { createRunner } from '@systemix/runner';
import {
  createKeyring,
  decrypt,
  decryptString,
  encrypt,
  encryptString,
  generateKeyBytes,
  parseEnvelope,
  DecryptionError,
  InvalidPayloadError,
} from '../dist/index.js';

const enc = new TextEncoder();
const dec = new TextDecoder();

/** Payload in the 0.1.x layout: [IV][ciphertext+tag], AAD = user AAD only. */
async function legacyEncrypt(text, key, aad) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const k = await crypto.subtle.importKey('raw', key, 'AES-GCM', false, [
    'encrypt',
  ]);
  const params = { name: 'AES-GCM', iv, tagLength: 128 };
  if (aad) params.additionalData = aad;
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(params, k, enc.encode(text)),
  );
  const out = new Uint8Array(12 + ct.length);
  out.set(iv);
  out.set(ct, 12);
  return out;
}

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrowsAsync }) => {
    const key = generateKeyBytes();

    // ── envelope ──────────────────────────────────────────────────────
    const blob = await encrypt('hello', key, { keyId: 'k1' });
    const env = parseEnvelope(blob);
    assert(env !== null, 'parseEnvelope reads an encrypt() payload');
    assert(
      env.keyId === 'k1' && env.version === 1,
      'keyId + version in header',
    );
    assert(env.iv.length === 12, 'IV is 12 bytes');
    assert(
      dec.decode(await decrypt(blob, key)) === 'hello',
      'round-trips with a keyId',
    );
    assert(
      parseEnvelope(await encrypt('x', key)).keyId === '',
      'keyId defaults to empty',
    );
    assert(parseEnvelope(new Uint8Array(40)) === null, 'non-envelope → null');

    const a = await encrypt('same', key);
    const b = await encrypt('same', key);
    assert(
      parseEnvelope(a).iv.join() !== parseEnvelope(b).iv.join(),
      'fresh random IV per call',
    );

    // Header is authenticated: editing it must break decryption.
    const wrongId = Uint8Array.from(blob);
    wrongId[4] = 'k'.charCodeAt(0) ^ 1; // 'k1' → 'j1'
    await assertThrowsAsync(
      () => decrypt(wrongId, key, { allowLegacy: false }),
      'changing the key id in the header is detected',
    );
    const wrongVersion = Uint8Array.from(blob);
    wrongVersion[2] = 2;
    await assertThrowsAsync(
      () => decrypt(wrongVersion, key, { allowLegacy: false }),
      'unknown envelope version is rejected',
    );
    await assertThrowsAsync(
      () => encrypt('x', key, { keyId: 'x'.repeat(65) }),
      'keyId over 64 bytes is rejected',
    );

    // Error types
    let err;
    try {
      await decrypt(blob, generateKeyBytes());
    } catch (e) {
      err = e;
    }
    assert(err instanceof DecryptionError, 'wrong key → DecryptionError');
    err = undefined;
    try {
      await decrypt(new Uint8Array(5), key);
    } catch (e) {
      err = e;
    }
    assert(
      err instanceof InvalidPayloadError,
      'short payload → InvalidPayloadError',
    );

    // ── legacy payloads ───────────────────────────────────────────────
    const old = await legacyEncrypt('from 0.1.x', key);
    assert(
      dec.decode(await decrypt(old, key)) === 'from 0.1.x',
      'legacy payload still decrypts',
    );
    const oldAad = await legacyEncrypt('bound', key, enc.encode('user:1'));
    assert(
      dec.decode(
        await decrypt(oldAad, key, { additionalData: enc.encode('user:1') }),
      ) === 'bound',
      'legacy payload with AAD still decrypts',
    );
    await assertThrowsAsync(
      () => decrypt(old, key, { allowLegacy: false }),
      'allowLegacy:false rejects legacy payloads',
    );

    // ── keyring / rotation ────────────────────────────────────────────
    const k1 = generateKeyBytes();
    const k2 = generateKeyBytes();
    const ring1 = createKeyring({ keys: { k1 }, current: 'k1' });
    const blob1 = await ring1.encryptString('rotate me');
    const ring2 = createKeyring({ keys: { k2, k1 }, current: 'k2' });

    assert(ring2.currentKeyId === 'k2', 'currentKeyId');
    assert(
      (await ring2.decryptString(blob1)) === 'rotate me',
      'old key id still decrypts after rotation',
    );
    assert(ring2.needsRotation(blob1), 'payload from old key needs rotation');
    const blob2 = await ring2.encryptString('rotate me');
    assert(!ring2.needsRotation(blob2), 'payload from current key is fine');
    assert(
      parseEnvelope(
        Uint8Array.from(
          atob(
            blob2.replace(/-/g, '+').replace(/_/g, '/') +
              '='.repeat((4 - (blob2.length % 4)) % 4),
          ),
          (c) => c.charCodeAt(0),
        ),
      ).keyId === 'k2',
      'keyring stamps the current key id',
    );
    assert(ring2.needsRotation('garbage!!'), 'unreadable input needs rotation');

    const legacyBlob = await legacyEncrypt('legacy via ring', k1);
    assert(
      dec.decode(await ring2.decrypt(legacyBlob)) === 'legacy via ring',
      'keyring decrypts legacy payloads by trying its keys',
    );
    assert(ring2.needsRotation(legacyBlob), 'legacy payload needs rotation');

    await assertThrowsAsync(
      () => ring1.decryptString(blob2),
      'unknown key id fails when the key was removed',
    );
    await assertThrowsAsync(
      () =>
        ring2
          .decryptString(blob1, { allowLegacy: false })
          .then(() => ring1.decryptString(blob2, { allowLegacy: false })),
      'allowLegacy:false: unknown key id is rejected',
    );

    // AAD flows through the keyring too
    const bound = await ring2.encryptString('x', {
      additionalData: enc.encode('a'),
    });
    assert(
      (await ring2.decryptString(bound, {
        additionalData: enc.encode('a'),
      })) === 'x',
      'keyring AAD round-trips',
    );
    await assertThrowsAsync(
      () => ring2.decryptString(bound, { additionalData: enc.encode('b') }),
      'keyring rejects wrong AAD',
    );

    // Validation
    for (const [name, opts] of Object.entries({
      'no keys': { keys: {}, current: 'a' },
      'current not in keys': { keys: { a: k1 }, current: 'b' },
      'bad key length': { keys: { a: new Uint8Array(8) }, current: 'a' },
      'empty key id': { keys: { '': k1 }, current: '' },
    })) {
      let threw = false;
      try {
        createKeyring(opts);
      } catch {
        threw = true;
      }
      assert(threw, `createKeyring rejects ${name}`);
    }

    // string helpers produce envelopes too
    const s = await encryptString('s', key, { keyId: 'k9' });
    assert((await decryptString(s, key)) === 's', 'string helpers round-trip');
  },
);
