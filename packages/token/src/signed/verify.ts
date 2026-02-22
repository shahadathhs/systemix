import { createHmac, createVerify } from 'node:crypto';
import { base64UrlDecode } from '../common/utils/base64';
import { decodeSigned } from './decode';
import { ALG_TO_HASH, isHmac, isRsa } from '../common/enums';
import type {
  SignedPayload,
  VerifySignedOptions,
} from '../common/types/signed.types';
import {
  AudienceMismatchError,
  InvalidSignatureError,
  InvalidTokenError,
  IssuerMismatchError,
  NotBeforeError,
  TokenExpiredError,
} from '../common/errors';

function verifyHmacSignature(
  signingInput: string,
  signatureB64: string,
  secret: string,
  alg: 'HS256' | 'HS384' | 'HS512',
): boolean {
  const hmac = createHmac(ALG_TO_HASH[alg], secret);
  hmac.update(signingInput, 'utf8');
  return hmac.digest().toString('base64url') === signatureB64;
}

function verifyRsaSignature(
  signingInput: string,
  signatureB64: string,
  publicKey: string,
  alg: 'RS256' | 'RS384' | 'RS512',
): boolean {
  const signature = base64UrlDecode(signatureB64);
  const verify = createVerify(ALG_TO_HASH[alg]);
  verify.update(signingInput, 'utf8');
  verify.end();
  return verify.verify(publicKey, signature);
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
 */
export function verifySigned<T = SignedPayload>(
  token: string,
  secret: string,
  options: VerifySignedOptions,
): T {
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
    valid = verifyHmacSignature(signingInput, signature, secret, alg);
  } else if (isRsa(alg)) {
    valid = verifyRsaSignature(signingInput, signature, secret, alg);
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
