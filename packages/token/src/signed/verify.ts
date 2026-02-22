import { secureCompare } from '../common/crypto';
import { HMAC_WEB_CRYPTO_HASH, isHmac, isRsa } from '../common/enums';
import {
  AudienceMismatchError,
  InvalidSignatureError,
  InvalidTokenError,
  IssuerMismatchError,
  NotBeforeError,
  TokenExpiredError,
} from '../common/errors';
import type {
  SignedPayload,
  VerifySignedOptions,
} from '../common/types/signed.types';
import { bytesToBase64Url } from '../common/utils';
import { verifyRsa } from '../rsa';
import { decodeSigned } from './decode';

async function verifyHmacSignature(
  signingInput: string,
  signatureB64: string,
  secret: string,
  alg: 'HS256' | 'HS384' | 'HS512',
): Promise<boolean> {
  const crypto = globalThis.crypto;
  if (!crypto?.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is required');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: HMAC_WEB_CRYPTO_HASH[alg] },
    false,
    ['sign'],
  );
  const expectedSig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput),
  );
  const expectedB64 = bytesToBase64Url(new Uint8Array(expectedSig));
  return secureCompare(expectedB64, signatureB64);
}

function checkAudience(
  tokenAud: string | string[] | undefined,
  expected: string | string[],
): void {
  if (tokenAud == null) {
    throw new AudienceMismatchError('Token has no audience claim');
  }
  const expectedArr = Array.isArray(expected) ? expected : [expected];
  const tokenArr = Array.isArray(tokenAud) ? tokenAud : [tokenAud];
  if (!expectedArr.some((e) => tokenArr.includes(e))) {
    throw new AudienceMismatchError(
      `Expected audience in [${expectedArr.join(', ')}], got ${JSON.stringify(tokenAud)}`,
    );
  }
}

function checkIssuer(
  tokenIss: string | undefined,
  expected: string | string[],
): void {
  if (tokenIss == null) {
    throw new IssuerMismatchError('Token has no issuer claim');
  }
  const expectedArr = Array.isArray(expected) ? expected : [expected];
  if (!expectedArr.includes(tokenIss)) {
    throw new IssuerMismatchError(
      `Expected issuer in [${expectedArr.join(', ')}], got ${tokenIss}`,
    );
  }
}

/**
 * Decode and verify a signed token.
 * HMAC works in browser and Node. RSA requires Node.js.
 */
export async function verifySigned<T = SignedPayload>(
  token: string,
  secret: string,
  options: VerifySignedOptions,
): Promise<T> {
  const decoded = decodeSigned<T & SignedPayload>(token);
  const { header, payload, signature } = decoded;
  const alg = header.alg;

  if (!alg) {
    throw new InvalidTokenError('Token header missing algorithm');
  }

  const algorithms = options?.algorithms;
  if (!algorithms?.length) {
    throw new InvalidTokenError(
      'algorithms option is required - pass expected algorithm(s) to prevent algorithm confusion',
    );
  }
  if (!algorithms.includes(alg)) {
    throw new InvalidSignatureError(
      `Algorithm ${alg} not in allowed list: ${algorithms.join(', ')}`,
    );
  }

  const signingInput = token.split('.').slice(0, 2).join('.');
  let valid = false;

  if (isHmac(alg)) {
    valid = await verifyHmacSignature(signingInput, signature, secret, alg);
  } else if (isRsa(alg)) {
    valid = await verifyRsa(signingInput, signature, secret, alg);
  } else {
    throw new InvalidTokenError(`Unsupported algorithm: ${String(alg)}`);
  }

  if (!valid) {
    throw new InvalidSignatureError();
  }

  const tolerance = options?.clockTolerance ?? 0;
  const now = Math.floor(Date.now() / 1000);
  const nowForExp = now - tolerance;
  const nowForNbf = now + tolerance;

  if (!options?.ignoreExpiration && payload.exp != null) {
    if (typeof payload.exp !== 'number') {
      throw new InvalidTokenError('exp claim must be a number');
    }
    if (payload.exp < nowForExp) {
      throw new TokenExpiredError(
        `Token expired at ${new Date(payload.exp * 1000).toISOString()}`,
        payload.exp,
      );
    }
  }

  if (!options?.ignoreNotBefore && payload.nbf != null) {
    if (typeof payload.nbf !== 'number') {
      throw new InvalidTokenError('nbf claim must be a number');
    }
    if (payload.nbf > nowForNbf) {
      throw new NotBeforeError(
        `Token not valid before ${new Date(payload.nbf * 1000).toISOString()}`,
        payload.nbf,
      );
    }
  }

  if (options?.issuer != null) checkIssuer(payload.iss, options.issuer);
  if (options?.audience != null) checkAudience(payload.aud, options.audience);
  if (options?.subject != null && payload.sub !== options.subject) {
    throw new InvalidTokenError(
      `Expected subject "${options.subject}", got "${payload.sub ?? 'undefined'}"`,
    );
  }

  return payload as T;
}
