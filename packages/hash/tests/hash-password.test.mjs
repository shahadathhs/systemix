/**
 * Tests for @systemix/hash – hashPassword, verifyPassword, parseEncodedHash,
 * needsRehash (Argon2id, scrypt, PBKDF2; PHC and legacy formats).
 */
import { pbkdf2Sync, scryptSync } from 'node:crypto';
import { createRunner } from '@systemix/runner';
import {
  hashPassword,
  verifyPassword,
  parseEncodedHash,
  needsRehash,
  argon2DeriveBits,
  scryptDeriveBits,
} from '../dist/index.js';

const b64url = (buf) => Buffer.from(buf).toString('base64url');

export const { run, getCounts } = createRunner(
  async ({ assert, assertThrowsAsync }) => {
    // ── Argon2id (default) ────────────────────────────────────────────
    const encoded = await hashPassword('hunter2');
    assert(
      /^\$argon2id\$v=19\$m=19456,t=2,p=1\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/.test(
        encoded,
      ),
      'default output is an Argon2id PHC string with OWASP minimum params',
    );
    assert(!encoded.includes('hunter2'), 'encoded hash hides the password');
    assert(
      await verifyPassword('hunter2', encoded),
      'verifyPassword accepts correct password',
    );
    assert(
      !(await verifyPassword('letmein', encoded)),
      'verifyPassword rejects wrong password',
    );
    assert(
      (await hashPassword('hunter2')) !== encoded,
      'each hash uses a fresh salt',
    );
    assert(
      !(await verifyPassword('hunter2', 'garbage')),
      'malformed hash returns false',
    );

    const parsed = parseEncodedHash(encoded);
    assert(parsed.algorithm === 'argon2id', 'parses algorithm');
    assert(parsed.format === 'phc', 'parses format');
    assert(
      parsed.memoryCost === 19456 &&
        parsed.timeCost === 2 &&
        parsed.parallelism === 1,
      'parses argon2 parameters',
    );
    assert(parsed.hash.length === 32, 'hash length matches default keyLength');

    // Known answer from the Argon2 reference implementation README
    // (argon2id, password "password", salt "somesalt", t=2, m=65536, p=1).
    const reference =
      '$argon2id$v=19$m=65536,t=2,p=1$c29tZXNhbHQ$CTFhFdXPJO1aFaMaO6Mm5c8y7cJHAph8ArZWb2GRPPc';
    assert(
      await verifyPassword('password', reference),
      'verifies the Argon2id reference vector',
    );
    assert(
      (await hashPassword('password', {
        salt: new TextEncoder().encode('somesalt'),
        memoryCost: 65536,
      })) === reference,
      'hashPassword reproduces the Argon2id reference vector',
    );

    // ── scrypt ────────────────────────────────────────────────────────
    const scryptHash = await hashPassword('hunter2', {
      algorithm: 'scrypt',
      costFactor: 16384,
    });
    assert(
      scryptHash.startsWith('$scrypt$ln=14,r=8,p=1$'),
      'scrypt output is PHC with ln',
    );
    assert(await verifyPassword('hunter2', scryptHash), 'verifies scrypt');
    assert(!(await verifyPassword('x', scryptHash)), 'rejects wrong scrypt');
    assert(
      parseEncodedHash(scryptHash).costFactor === 16384,
      'ln is converted back to N',
    );
    const scryptDefault = await hashPassword('hunter2', {
      algorithm: 'scrypt',
    });
    assert(
      scryptDefault.startsWith('$scrypt$ln=17,r=8,p=1$'),
      'scrypt defaults to N=2^17 (OWASP)',
    );
    assert(
      await verifyPassword('hunter2', scryptDefault),
      'verifies default scrypt (needs maxmem above Node default)',
    );

    // ── PBKDF2 ────────────────────────────────────────────────────────
    const pbkdf2Hash = await hashPassword('hunter2', {
      algorithm: 'pbkdf2',
      iterations: 10_000,
      digest: 'SHA-512',
      keyLength: 64,
    });
    assert(
      pbkdf2Hash.startsWith('$pbkdf2-sha512$i=10000$'),
      'pbkdf2 output is PHC with digest in the id',
    );
    assert(await verifyPassword('hunter2', pbkdf2Hash), 'verifies pbkdf2');
    assert(
      parseEncodedHash(pbkdf2Hash).hash.length === 64,
      'pbkdf2 respects keyLength',
    );
    assert(
      (await hashPassword('x', { algorithm: 'pbkdf2' })).startsWith(
        '$pbkdf2-sha256$i=600000$',
      ),
      'pbkdf2 defaults to 600,000 iterations (OWASP)',
    );

    // ── Legacy format from 0.1.x still verifies ───────────────────────
    const salt = Buffer.alloc(16, 7);
    const legacyPbkdf2 = `pbkdf2$SHA-256$1000$${b64url(salt)}$${b64url(
      pbkdf2Sync('hunter2', salt, 1000, 32, 'sha256'),
    )}`;
    assert(await verifyPassword('hunter2', legacyPbkdf2), 'legacy pbkdf2 ok');
    assert(
      !(await verifyPassword('nope', legacyPbkdf2)),
      'legacy pbkdf2 rejects wrong password',
    );
    assert(
      parseEncodedHash(legacyPbkdf2).format === 'legacy',
      'legacy format detected',
    );
    const legacyScrypt = `scrypt$1024$8$1$${b64url(salt)}$${b64url(
      scryptSync('hunter2', salt, 32, { N: 1024, r: 8, p: 1 }),
    )}`;
    assert(await verifyPassword('hunter2', legacyScrypt), 'legacy scrypt ok');

    // ── needsRehash ───────────────────────────────────────────────────
    assert(!needsRehash(encoded), 'fresh default hash does not need rehash');
    assert(needsRehash(legacyPbkdf2), 'legacy format needs rehash');
    assert(needsRehash(legacyScrypt), 'legacy scrypt needs rehash');
    assert(needsRehash('garbage'), 'unparseable hash needs rehash');
    assert(needsRehash(scryptHash), 'different algorithm needs rehash');
    assert(
      needsRehash(encoded, { memoryCost: 65536 }),
      'weaker memory than target needs rehash',
    );
    assert(
      needsRehash(encoded, { timeCost: 3 }),
      'fewer passes than target needs rehash',
    );
    assert(
      !needsRehash(reference),
      'stronger-than-target argon2 does not need rehash',
    );
    assert(
      needsRehash(pbkdf2Hash, { algorithm: 'pbkdf2', iterations: 600_000 }),
      'pbkdf2 below target iterations needs rehash',
    );
    assert(
      !needsRehash(scryptDefault, { algorithm: 'scrypt' }),
      'scrypt at target does not need rehash',
    );

    // ── Input validation ──────────────────────────────────────────────
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
    await assertThrowsAsync(
      () => hashPassword('x', { salt: new Uint8Array(4) }),
      'rejects salt below 8 bytes',
    );
    await assertThrowsAsync(
      () =>
        argon2DeriveBits('x', new Uint8Array(16), {
          parallelism: 4,
          memoryCost: 16,
        }),
      'rejects memory below 8 KiB per lane',
    );
    await assertThrowsAsync(
      () => scryptDeriveBits('x', salt, { costFactor: 1000 }),
      'rejects non-power-of-2 scrypt cost',
    );
    await assertThrowsAsync(
      () => scryptDeriveBits('x', salt, { costFactor: 512 }),
      'rejects scrypt cost below 1024',
    );

    // ── Hostile encoded hashes: rejected cheaply, never computed ──────
    const s = 'AAAAAAAAAAAAAAAAAAAAAA';
    const h = 'A'.repeat(43);
    const start = Date.now();
    const hostile = {
      'huge pbkdf2 iterations': `$pbkdf2-sha256$i=999999999$${s}$${h}`,
      'huge scrypt p': `$scrypt$ln=10,r=8,p=100000$${s}$${h}`,
      'huge scrypt ln': `$scrypt$ln=30,r=8,p=1$${s}$${h}`,
      'scrypt memory over cap': `$scrypt$ln=20,r=32,p=1$${s}$${h}`,
      'huge argon2 memory': `$argon2id$v=19$m=4194304,t=2,p=1$${s}$${h}`,
      'huge argon2 passes': `$argon2id$v=19$m=19456,t=1000,p=1$${s}$${h}`,
      'huge argon2 lanes': `$argon2id$v=19$m=19456,t=2,p=1000$${s}$${h}`,
      'oversized stored hash': `$pbkdf2-sha256$i=1000$${s}$${'A'.repeat(4000)}`,
      'wrong argon2 version': `$argon2id$v=16$m=19456,t=2,p=1$${s}$${h}`,
      'exponent notation': `$pbkdf2-sha256$i=1e9$${s}$${h}`,
      'duplicate params': `$argon2id$v=19$m=19456,m=19456,p=1$${s}$${h}`,
      'extra params': `$pbkdf2-sha256$i=1000,x=1$${s}$${h}`,
      'invalid base64': `$pbkdf2-sha256$i=1000$!!!!$${h}`,
      'legacy huge iterations': `pbkdf2$SHA-256$999999999$${s}$${h}`,
      'legacy bad digest': `pbkdf2$MD5$1000$${s}$${h}`,
    };
    for (const [name, value] of Object.entries(hostile)) {
      assert(
        (await verifyPassword('x', value)) === false,
        `verifyPassword rejects ${name}`,
      );
    }
    assert(Date.now() - start < 3000, 'hostile hashes are rejected quickly');
  },
);
