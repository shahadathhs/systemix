import { verifyBytes } from '../common/crypto/jws';
import { SIGNED_ALGORITHMS, type SignedAlgorithm } from '../common/enums';
import {
  AudienceMismatchError,
  InvalidSignatureError,
  InvalidTokenError,
  IssuerMismatchError,
  NotBeforeError,
  TokenExpiredError,
} from '../common/errors';
import type { KeyInput } from '../common/crypto/jws';
import type {
  KeyResolver,
  SignedPayload,
  VerifySignedOptions,
} from '../common/types/signed.types';
import { bytesToBase64Url } from '../common/utils';
import { base64UrlDecode } from '../common/utils/base64';
import { decodeSigned } from './decode';

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
 * Decode and verify a signed token (JWS).
 *
 * `algorithms` is required: the token's own `alg` header is never trusted, and
 * a key is only usable with an algorithm of its own type (an RSA public key
 * can't be used as an HMAC secret). Pass a function as `key` to choose the key
 * by `kid` — see KeyResolver.
 */
export async function verifySigned<T = SignedPayload>(
  token: string,
  key: KeyInput | KeyResolver,
  options: VerifySignedOptions,
): Promise<T> {
  const decoded = decodeSigned<T & SignedPayload>(token);
  const { header, payload, signature } = decoded;
  const alg = header.alg;

  if (typeof alg !== 'string' || !alg) {
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
  if (!SIGNED_ALGORITHMS.includes(alg as SignedAlgorithm)) {
    throw new InvalidTokenError(`Unsupported algorithm: ${String(alg)}`);
  }

  // RFC 7515 §4.1.11: reject critical extensions we don't understand (none).
  if (header.crit !== undefined) {
    throw new InvalidTokenError('Unsupported critical header parameter(s)');
  }
  if (
    options.typ !== undefined &&
    (typeof header.typ !== 'string' ||
      header.typ.toLowerCase() !== options.typ.toLowerCase())
  ) {
    throw new InvalidTokenError(
      `Expected typ "${options.typ}", got ${JSON.stringify(header.typ)}`,
    );
  }

  let signatureBytes: Uint8Array;
  try {
    signatureBytes = base64UrlDecode(signature);
  } catch {
    throw new InvalidTokenError('Invalid signature encoding');
  }
  // Reject non-canonical encodings of the same bytes (signature malleability).
  if (bytesToBase64Url(signatureBytes) !== signature) {
    throw new InvalidTokenError('Invalid signature encoding');
  }

  const resolved = typeof key === 'function' ? await key(header) : key;
  const signingInput = token.split('.').slice(0, 2).join('.');
  const valid = verifyBytes(
    alg as SignedAlgorithm,
    signingInput,
    signatureBytes,
    resolved,
  );
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
    if (payload.exp <= nowForExp) {
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

  if (options?.maxAge != null) {
    if (typeof payload.iat !== 'number') {
      throw new InvalidTokenError('maxAge requires a numeric iat claim');
    }
    if (now - tolerance - payload.iat > options.maxAge) {
      throw new TokenExpiredError(
        `Token is older than maxAge (${options.maxAge}s)`,
        payload.iat + options.maxAge,
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
