/**
 * Tests for @systemix/hash – hashPassword, verifyPassword, parseEncodedHash.
 */
import { createRunner } from '@systemix/runner';
import {
  hashPassword,
  verifyPassword,
  parseEncodedHash,
  scryptDeriveBits,
  isScryptSupported,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrowsAsync }) => {
    const encoded = await hashPassword('hunter2');
    assert(typeof encoded === 'string', 'hashPassword returns string');
    assert(encoded.startsWith('pbkdf2$SHA-256$210000$'), 'uses OWASP defaults');
    assert(
      !encoded.includes('hunter2'),
      'encoded hash does not contain password',
    );

    assert(
      await verifyPassword('hunter2', encoded),
      'verifyPassword accepts correct password',
    );
    assert(
      !(await verifyPassword('letmein', encoded)),
      'verifyPassword rejects wrong password',
    );
    assert(
      !(await verifyPassword('hunter2', 'garbage')),
      'malformed hash returns false',
    );

    const custom = await hashPassword('hunter2', {
      digest: 'SHA-512',
      iterations: 10_000,
      keyLength: 64,
    });
    assert(
      custom.startsWith('pbkdf2$SHA-512$10000$'),
      'respects digest and iterations',
    );
    assert(
      await verifyPassword('hunter2', custom),
      'verifies custom parameters',
    );

    const parsed = parseEncodedHash(encoded);
    assert(parsed.algorithm === 'pbkdf2', 'parseEncodedHash detects algorithm');
    assert(parsed.iterations === 210000, 'parseEncodedHash reads iterations');
    assert(
      parsed.salt instanceof Uint8Array,
      'parseEncodedHash returns salt bytes',
    );
    assert(
      parsed.hash instanceof Uint8Array,
      'parseEncodedHash returns hash bytes',
    );
    assert(
      parsed.hash.length === 32,
      'parseEncodedHash hash length matches keyLength',
    );

    await assertThrowsAsync(() => hashPassword(''), 'rejects empty password');
    await assertThrowsAsync(
      () => verifyPassword('', encoded),
      'verifyPassword rejects empty password',
    );
    await assertThrowsAsync(
      () => hashPassword('x', { algorithm: 'bcrypt' }),
      'rejects unsupported algorithm',
    );
    await assertThrowsAsync(
      () => hashPassword('x', { keyLength: 2048 }),
      'rejects keyLength above 1024',
    );

    if (isScryptSupported()) {
      const scryptHash = await hashPassword('hunter2', { algorithm: 'scrypt' });
      assert(
        scryptHash.startsWith('scrypt$16384$8$1$'),
        'scrypt uses default parameters',
      );
      assert(
        await verifyPassword('hunter2', scryptHash),
        'verifies scrypt hash',
      );
      assert(
        !(await verifyPassword('wrong', scryptHash)),
        'rejects wrong scrypt password',
      );

      const parsedScrypt = parseEncodedHash(scryptHash);
      assert(parsedScrypt.algorithm === 'scrypt', 'parses scrypt algorithm');
      assert(parsedScrypt.costFactor === 16384, 'parses scrypt cost factor');

      const key = await scryptDeriveBits('password', parsedScrypt.salt, {
        costFactor: 1024,
        keyLength: 32,
      });
      assert(key.length === 32, 'scryptDeriveBits respects keyLength');

      await assertThrowsAsync(
        () =>
          scryptDeriveBits('password', parsedScrypt.salt, { costFactor: 1000 }),
        'rejects non-power-of-2 cost factor',
      );
      await assertThrowsAsync(
        () =>
          scryptDeriveBits('password', parsedScrypt.salt, { costFactor: 512 }),
        'rejects cost factor below 1024',
      );
    }
  },
);
