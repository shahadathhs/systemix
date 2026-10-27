/**
 * Tests for @systemix/token/signed – algorithms (HS/RS/PS/ES/EdDSA), key
 * confusion, header/payload hardening, and verification options.
 */
import {
  createHmac,
  createPublicKey,
  generateKeyPairSync,
  verify as nodeVerify,
} from 'node:crypto';
import { createRunner } from '@systemix/runner';
import {
  InvalidKeyError,
  InvalidSignatureError,
  InvalidTokenError,
  TokenExpiredError,
  decodeSigned,
  encodeSigned,
  verifySigned,
} from '../dist/signed/index.js';

const b64u = (v) => Buffer.from(v).toString('base64url');
const SECRET = 'a-secret-that-is-comfortably-over-32-bytes-long';
const pem = { type: 'spki', format: 'pem' };
const pkcs8 = { type: 'pkcs8', format: 'pem' };

/** Builds an HS256 token by hand, independent of the library. */
function handmade(header, payload, secret = SECRET) {
  const input = `${b64u(JSON.stringify(header))}.${
    typeof payload === 'string' ? b64u(payload) : b64u(JSON.stringify(payload))
  }`;
  const sig = createHmac('sha256', secret).update(input).digest();
  return `${input}.${b64u(sig)}`;
}

async function rejects(assert, fn, ErrorType, message) {
  let err;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  assert(err instanceof ErrorType, message);
}

export const { run, getCounts } = createRunner(async ({ assert }) => {
  const opts = (algorithms) => ({ algorithms });

  // ── Known answer: RFC 7515 Appendix A.1 (HS256) ─────────────────────
  const rfcKey = Buffer.from(
    'AyM1SysPpbyDfgZld3umj1qzKObwVMkoqQ-EstJQLr_T-1qS0gZH75aKtMN3Yj0iPS4hcgUuTwjAzZr1Z9CAow',
    'base64url',
  );
  const rfcToken =
    'eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJqb2UiLA0KICJleHAiOjEzMDA4MTkzODAsDQogImh0dHA6Ly9leGFtcGxlLmNvbS9pc19yb290Ijp0cnVlfQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
  const rfcPayload = await verifySigned(rfcToken, rfcKey, {
    algorithms: ['HS256'],
    typ: 'JWT',
    ignoreExpiration: true,
  });
  assert(rfcPayload.iss === 'joe', 'verifies the RFC 7515 A.1 HS256 vector');
  await rejects(
    assert,
    () => verifySigned(rfcToken, rfcKey, opts(['HS256'])),
    TokenExpiredError,
    'RFC vector is expired (exp 2011) unless ignoreExpiration',
  );

  // ── Round trips for every algorithm family ─────────────────────────
  const rsa = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: pem,
    privateKeyEncoding: pkcs8,
  });
  const ec256 = generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding: pem,
    privateKeyEncoding: pkcs8,
  });
  const ec384 = generateKeyPairSync('ec', {
    namedCurve: 'P-384',
    publicKeyEncoding: pem,
    privateKeyEncoding: pkcs8,
  });
  const ec521 = generateKeyPairSync('ec', {
    namedCurve: 'P-521',
    publicKeyEncoding: pem,
    privateKeyEncoding: pkcs8,
  });
  const ed = generateKeyPairSync('ed25519', {
    publicKeyEncoding: pem,
    privateKeyEncoding: pkcs8,
  });
  const cases = [
    ['HS256', SECRET, SECRET],
    ['HS384', SECRET + 'x'.repeat(16), SECRET + 'x'.repeat(16)],
    ['HS512', SECRET + 'x'.repeat(32), SECRET + 'x'.repeat(32)],
    ['RS256', rsa.privateKey, rsa.publicKey],
    ['RS512', rsa.privateKey, rsa.publicKey],
    ['PS256', rsa.privateKey, rsa.publicKey],
    ['PS384', rsa.privateKey, rsa.publicKey],
    ['PS512', rsa.privateKey, rsa.publicKey],
    ['ES256', ec256.privateKey, ec256.publicKey],
    ['ES384', ec384.privateKey, ec384.publicKey],
    ['ES512', ec521.privateKey, ec521.publicKey],
    ['EdDSA', ed.privateKey, ed.publicKey],
  ];
  for (const [alg, signKey, verifyKey] of cases) {
    const token = await encodeSigned({ n: 1 }, signKey, { algorithm: alg });
    const payload = await verifySigned(token, verifyKey, opts([alg]));
    assert(payload.n === 1, `${alg} round-trips`);
    const parts = token.split('.');
    const bad = `${parts[0]}.${parts[1]}.${b64u(Buffer.alloc(Buffer.from(parts[2], 'base64url').length))}`;
    await rejects(
      assert,
      () => verifySigned(bad, verifyKey, opts([alg])),
      InvalidSignatureError,
      `${alg} rejects a zeroed signature`,
    );
  }

  // ES256 signatures are raw r||s (JWS), not DER; check with Node directly.
  const es = await encodeSigned({ a: 1 }, ec256.privateKey, {
    algorithm: 'ES256',
  });
  const [h, p, s] = es.split('.');
  const sigBytes = Buffer.from(s, 'base64url');
  assert(sigBytes.length === 64, 'ES256 signature is 64 bytes (P1363)');
  assert(
    nodeVerify(
      'sha256',
      Buffer.from(`${h}.${p}`),
      { key: createPublicKey(ec256.publicKey), dsaEncoding: 'ieee-p1363' },
      sigBytes,
    ),
    'ES256 token verifies with an independent Node verify',
  );

  // ── Key confusion (RFC 8725 §3.1) ──────────────────────────────────
  // Attacker signs HS256 using the RSA *public key* as the HMAC secret.
  const forged = handmade(
    { alg: 'HS256', typ: 'JWT' },
    { admin: true },
    rsa.publicKey,
  );
  await rejects(
    assert,
    () => verifySigned(forged, rsa.publicKey, opts(['RS256', 'HS256'])),
    InvalidKeyError,
    'RS256→HS256 key-confusion forgery is rejected even when both are allowed',
  );
  await rejects(
    assert,
    () => verifySigned(forged, rsa.publicKey, opts(['RS256'])),
    InvalidSignatureError,
    'HS256 token rejected when only RS256 is allowed',
  );
  await rejects(
    assert,
    () => encodeSigned({}, rsa.publicKey, { algorithm: 'HS256' }),
    InvalidKeyError,
    'PEM cannot be used as an HMAC secret when signing',
  );

  const none = `${b64u('{"alg":"none"}')}.${b64u('{"a":1}')}.`;
  await rejects(
    assert,
    () => verifySigned(none, SECRET, opts(['HS256'])),
    InvalidSignatureError,
    'alg:none is rejected',
  );

  // ── Key strength / type checks ─────────────────────────────────────
  await rejects(
    assert,
    () => encodeSigned({}, 'short-secret'),
    InvalidKeyError,
    'HS256 secret under 32 bytes is rejected',
  );
  await rejects(
    assert,
    () => encodeSigned({}, SECRET, { algorithm: 'HS512' }),
    InvalidKeyError,
    'HS512 needs a 64-byte secret',
  );
  const weakRsa = generateKeyPairSync('rsa', {
    modulusLength: 1024,
    publicKeyEncoding: pem,
    privateKeyEncoding: pkcs8,
  });
  await rejects(
    assert,
    () => encodeSigned({}, weakRsa.privateKey, { algorithm: 'RS256' }),
    InvalidKeyError,
    'RSA keys under 2048 bits are rejected',
  );
  await rejects(
    assert,
    () => encodeSigned({}, ec384.privateKey, { algorithm: 'ES256' }),
    InvalidKeyError,
    'ES256 requires a P-256 key',
  );
  await rejects(
    assert,
    () => encodeSigned({}, rsa.privateKey, { algorithm: 'EdDSA' }),
    InvalidKeyError,
    'EdDSA requires an Ed25519/Ed448 key',
  );
  await rejects(
    assert,
    () => encodeSigned({}, rsa.publicKey, { algorithm: 'RS256' }),
    InvalidKeyError,
    'signing with a public key is rejected',
  );
  await rejects(
    assert,
    () => encodeSigned({}, 'not a pem', { algorithm: 'RS256' }),
    InvalidKeyError,
    'garbage PEM is rejected',
  );

  // ── Header / payload hardening ─────────────────────────────────────
  await rejects(
    assert,
    () =>
      verifySigned(
        handmade({ alg: 'HS256', crit: ['exp'], exp: 1 }, { a: 1 }),
        SECRET,
        opts(['HS256']),
      ),
    InvalidTokenError,
    'tokens with a crit header are rejected',
  );
  for (const bad of ['null', '[]', '"str"', '42']) {
    await rejects(
      assert,
      () =>
        verifySigned(handmade({ alg: 'HS256' }, bad), SECRET, opts(['HS256'])),
      InvalidTokenError,
      `non-object payload ${bad} is rejected`,
    );
  }
  await rejects(
    assert,
    () => verifySigned(handmade({ alg: 7 }, { a: 1 }), SECRET, opts(['HS256'])),
    InvalidTokenError,
    'non-string alg is rejected',
  );

  const typed = await encodeSigned({ a: 1 }, SECRET, { typ: 'at+jwt' });
  assert(
    (await verifySigned(typed, SECRET, { ...opts(['HS256']), typ: 'AT+JWT' }))
      .a === 1,
    'typ is compared case-insensitively',
  );
  await rejects(
    assert,
    () => verifySigned(typed, SECRET, { ...opts(['HS256']), typ: 'JWT' }),
    InvalidTokenError,
    'wrong typ is rejected',
  );

  // Signature encoding: canonical base64url only.
  const ok = await encodeSigned({ a: 1 }, SECRET);
  const sig = ok.split('.')[2];
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const last = alphabet.indexOf(sig[sig.length - 1]);
  const twin = sig.slice(0, -1) + alphabet[last ^ 1]; // same bytes, non-canonical
  assert(
    Buffer.from(twin, 'base64url').equals(Buffer.from(sig, 'base64url')),
    '(test setup) twin signature decodes to identical bytes',
  );
  await rejects(
    assert,
    () => verifySigned(ok.replace(sig, twin), SECRET, opts(['HS256'])),
    InvalidTokenError,
    'non-canonical signature encoding is rejected',
  );
  await rejects(
    assert,
    () => verifySigned(`${ok}=`, SECRET, opts(['HS256'])),
    InvalidTokenError,
    'padded signature is rejected',
  );
  await rejects(
    assert,
    () => verifySigned(` ${ok}`, SECRET, opts(['HS256'])),
    InvalidTokenError,
    'surrounding whitespace is rejected',
  );

  // Large payloads (previous spread-based encoder overflowed the stack).
  const big = await encodeSigned({ blob: 'x'.repeat(500_000) }, SECRET);
  assert(
    (await verifySigned(big, SECRET, opts(['HS256']))).blob.length === 500_000,
    'large payloads encode and verify',
  );

  // ── Timing claims ──────────────────────────────────────────────────
  await rejects(
    assert,
    () =>
      verifySigned(
        handmade({ alg: 'HS256' }, { exp: Math.floor(Date.now() / 1000) }),
        SECRET,
        opts(['HS256']),
      ),
    TokenExpiredError,
    'a token is expired at its exact exp second (RFC 7519 §4.1.4)',
  );
  const now = Math.floor(Date.now() / 1000);
  assert(
    (
      await verifySigned(
        handmade({ alg: 'HS256' }, { exp: now - 5, a: 1 }),
        SECRET,
        { ...opts(['HS256']), clockTolerance: 10 },
      )
    ).a === 1,
    'clockTolerance allows slightly expired tokens',
  );

  const old = handmade({ alg: 'HS256' }, { iat: now - 3600 });
  await rejects(
    assert,
    () => verifySigned(old, SECRET, { ...opts(['HS256']), maxAge: 60 }),
    TokenExpiredError,
    'maxAge rejects tokens older than the limit',
  );
  assert(
    (await verifySigned(old, SECRET, { ...opts(['HS256']), maxAge: 7200 }))
      .iat ===
      now - 3600,
    'maxAge accepts tokens within the limit',
  );
  await rejects(
    assert,
    () =>
      verifySigned(handmade({ alg: 'HS256' }, { a: 1 }), SECRET, {
        ...opts(['HS256']),
        maxAge: 60,
      }),
    InvalidTokenError,
    'maxAge requires an iat claim',
  );

  // ── Key resolver (kid) ─────────────────────────────────────────────
  const keys = {
    k1: 'first-secret-first-secret-first-secret-0001',
    k2: 'second-secret-second-secret-second-secret-02',
  };
  const t2 = await encodeSigned({ u: 7 }, keys.k2, { kid: 'k2' });
  assert(decodeSigned(t2).header.kid === 'k2', 'kid is written to the header');
  assert(
    (await verifySigned(t2, (header) => keys[header.kid], opts(['HS256'])))
      .u === 7,
    'key resolver selects the key by kid',
  );
  await rejects(
    assert,
    () => verifySigned(t2, () => keys.k1, opts(['HS256'])),
    InvalidSignatureError,
    'wrong key from the resolver fails verification',
  );
  const unknown = await encodeSigned({ u: 7 }, keys.k1, { kid: 'zz' });
  await rejects(
    assert,
    () =>
      verifySigned(
        unknown,
        (header) => {
          if (!keys[header.kid]) throw new InvalidTokenError('unknown kid');
          return keys[header.kid];
        },
        opts(['HS256']),
      ),
    InvalidTokenError,
    'a resolver can reject unknown kids',
  );
});
