#!/usr/bin/env node
/**
 * Edge-case tests for @systemix/token.
 * Run: pnpm test (builds first, then runs tests)
 */

import { generateKeyPairSync } from 'node:crypto';
import { generateToken } from '../dist/index.js';
import {
  generateToken as generateFromToken,
  bytesToHex,
  bytesToBase64,
} from '../dist/token/index.js';
import {
  encodeSigned,
  decodeSigned,
  verifySigned,
} from '../dist/signed/index.js';
import { signRsa, verifyRsa } from '../dist/rsa/index.js';
import {
  getRandomBytes,
  getRandomInt,
  bytesEqual,
  secureCompare,
} from '../dist/common/index.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    failed++;
    console.error(`  ✗ ${message} (expected throw)`);
  } catch {
    passed++;
    console.log(`  ✓ ${message}`);
  }
}

async function assertThrowsAsync(fn, message) {
  try {
    await fn();
    failed++;
    console.error(`  ✗ ${message} (expected throw)`);
  } catch {
    passed++;
    console.log(`  ✓ ${message}`);
  }
}

console.log('\n📦 @systemix/token\n');

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

const base64urlToken = generateToken({ byteLength: 12, charset: 'base64url' });
assert(
  !base64urlToken.includes('+') && !base64urlToken.includes('/'),
  'base64url has no + or /',
);

const alphanumericToken = generateToken({
  byteLength: 24,
  charset: 'alphanumeric',
});
assert(/^[A-Za-z0-9]+$/.test(alphanumericToken), 'alphanumeric charset valid');
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

// Validation errors
assertThrows(() => generateToken({ byteLength: 0 }), 'throws on byteLength 0');
assertThrows(
  () => generateToken({ byteLength: 2000 }),
  'throws on byteLength too large',
);
assertThrows(
  () => generateToken({ charset: 'invalid' }),
  'throws on invalid charset',
);
assertThrows(() => generateToken({ count: 0 }), 'throws on count 0');
assertThrows(() => generateToken({ count: 20 }), 'throws on count too large');
assertThrows(() => generateToken({ foo: 'bar' }), 'throws on invalid prop');

// Subpath imports: @systemix/token/token
const subpathToken = generateFromToken({ byteLength: 8 });
assert(
  typeof subpathToken === 'string' && subpathToken.length === 16,
  'subpath token works',
);
const testBytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
assert(bytesToHex(testBytes) === '48656c6c6f', 'bytesToHex sub-function works');
assert(
  bytesToBase64(testBytes) === 'SGVsbG8=',
  'bytesToBase64 sub-function works',
);

// Common crypto: getRandomBytes, getRandomInt, bytesEqual, secureCompare
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
assert(!secureCompare('ab', 'abc'), 'secureCompare false for different length');

// Signed token tests (async - encodeSigned and verifySigned use Web Crypto)
const secret = 'my-secret-key-for-hmac';
const verifyOpts = (opts = {}) => ({ algorithms: ['HS256'], ...opts });

const token = await encodeSigned({ userId: '123', role: 'admin' }, secret);
assert(typeof token === 'string', 'encodeSigned returns string');
assert(
  token.split('.').length === 3,
  'token has 3 parts (header.payload.signature)',
);

const decoded = decodeSigned(token);
assert(decoded.header.alg === 'HS256', 'decoded header has alg');
assert(decoded.payload.userId === '123', 'decoded payload correct');
assert(decoded.payload.role === 'admin', 'decoded payload has role');

const verified = await verifySigned(token, secret, verifyOpts());
assert(verified.userId === '123', 'verifySigned returns payload');

await assertThrowsAsync(
  () => verifySigned(token, 'wrong-secret', verifyOpts()),
  'verifySigned throws on wrong secret',
);

const tokenWithExp = await encodeSigned({ foo: 'bar' }, secret, {
  expiresIn: -1,
});
await assertThrowsAsync(
  () => verifySigned(tokenWithExp, secret, verifyOpts()),
  'verifySigned throws on expired token',
);

const tokenWithNbf = await encodeSigned({ foo: 'bar' }, secret, {
  notBefore: 999999,
});
await assertThrowsAsync(
  () => verifySigned(tokenWithNbf, secret, verifyOpts()),
  'verifySigned throws on nbf in future',
);

const tokenWithTolerance = await encodeSigned({ foo: 'bar' }, secret, {
  expiresIn: 5,
});
const toleranceResult = await verifySigned(
  tokenWithTolerance,
  secret,
  verifyOpts({ clockTolerance: 10 }),
);
assert(
  typeof toleranceResult === 'object',
  'clockTolerance allows slight skew',
);

const tokenWithClaims = await encodeSigned({ custom: 'data' }, secret, {
  issuer: 'my-app',
  audience: 'my-api',
  subject: 'user-1',
  tokenId: true,
});
const verifiedClaims = await verifySigned(
  tokenWithClaims,
  secret,
  verifyOpts({
    issuer: 'my-app',
    audience: 'my-api',
    subject: 'user-1',
  }),
);
assert(verifiedClaims.iss === 'my-app', 'issuer claim set');
assert(verifiedClaims.aud === 'my-api', 'audience claim set');
assert(verifiedClaims.sub === 'user-1', 'subject claim set');
assert(
  typeof verifiedClaims.jti === 'string' && verifiedClaims.jti.length > 0,
  'jti auto-generated',
);

await assertThrowsAsync(
  () =>
    verifySigned(
      tokenWithClaims,
      secret,
      verifyOpts({ issuer: 'wrong-issuer' }),
    ),
  'verifySigned throws on issuer mismatch',
);

await assertThrowsAsync(
  () => verifySigned(token, secret, { algorithms: [] }),
  'verifySigned throws when algorithms empty',
);

assertThrows(
  () => decodeSigned('invalid'),
  'decodeSigned throws on malformed token',
);
assertThrows(() => decodeSigned('a.b'), 'decodeSigned throws on 2-part token');
assertThrows(() => decodeSigned(''), 'decodeSigned throws on empty string');

// RSA signed tokens (encodeSigned/verifySigned with RS256)
const { publicKey: rsaPublicKey, privateKey: rsaPrivateKey } =
  generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

const rsaToken = await encodeSigned({ userId: '456' }, rsaPrivateKey, {
  algorithm: 'RS256',
  expiresIn: 3600,
});
assert(typeof rsaToken === 'string', 'encodeSigned RS256 returns string');
assert(rsaToken.split('.').length === 3, 'RSA token has 3 parts');

const rsaDecoded = decodeSigned(rsaToken);
assert(rsaDecoded.header.alg === 'RS256', 'RSA token header has RS256');

const rsaVerified = await verifySigned(rsaToken, rsaPublicKey, {
  algorithms: ['RS256'],
});
assert(rsaVerified.userId === '456', 'verifySigned RS256 returns payload');

await assertThrowsAsync(
  () =>
    verifySigned(rsaToken, rsaPublicKey, {
      algorithms: ['HS256'],
    }),
  'verifySigned RS256 throws when algorithm not in whitelist',
);

// Direct RSA sign/verify
const signingInput = 'data.to.sign';
const rsaSig = await signRsa(signingInput, rsaPrivateKey, 'RS256');
assert(typeof rsaSig === 'string', 'signRsa returns string');

const rsaValid = await verifyRsa(signingInput, rsaSig, rsaPublicKey, 'RS256');
assert(rsaValid === true, 'verifyRsa returns true for valid signature');

const rsaInvalid = await verifyRsa(
  'tampered.data',
  rsaSig,
  rsaPublicKey,
  'RS256',
);
assert(rsaInvalid === false, 'verifyRsa returns false for tampered data');

console.log(`\n✅ ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
