import { createHmac, createSign } from 'node:crypto';
import { getRandomBytes } from '../shared/crypto';
import { bytesToHex } from '../token/encode';
import type { SignedPayload } from './types';
import type { EncodeSignedOptions, SignedAlgorithm } from './types';
import { base64UrlEncode } from './utils';

const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
const RSA_ALGORITHMS = ['RS256', 'RS384', 'RS512'] as const;

const ALG_TO_HASH: Record<string, string> = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
  RS256: 'RSA-SHA256',
  RS384: 'RSA-SHA384',
  RS512: 'RSA-SHA512',
};

function isHmac(alg: SignedAlgorithm): alg is 'HS256' | 'HS384' | 'HS512' {
  return HMAC_ALGORITHMS.includes(alg as (typeof HMAC_ALGORITHMS)[number]);
}

function isRsa(alg: SignedAlgorithm): alg is 'RS256' | 'RS384' | 'RS512' {
  return RSA_ALGORITHMS.includes(alg as (typeof RSA_ALGORITHMS)[number]);
}

function generateJti(): string {
  return bytesToHex(getRandomBytes(16));
}

/**
 * Encode a payload into a signed compact token.
 * Supports HMAC (HS256/384/512) and RSA (RS256/384/512).
 * Pure Node.js - no external dependencies.
 *
 * @param payload - Claims to encode (object)
 * @param secret - HMAC secret (string) or RSA private key (PEM string)
 * @param options - Encoding options (algorithm, claims, etc.)
 * @returns Signed token string (header.payload.signature)
 */
export function encodeSigned(
  payload: SignedPayload,
  secret: string,
  options?: EncodeSignedOptions,
): string {
  const alg: SignedAlgorithm = options?.algorithm ?? 'HS256';
  const typ = options?.typ ?? 'ST';
  const now = Math.floor(Date.now() / 1000);

  const header: Record<string, string> = {
    alg,
    typ,
  };
  if (options?.kid) header.kid = options.kid;
  if (options?.cty) header.cty = options.cty;

  const payloadCopy = { ...payload } as Record<string, unknown>;

  if (options?.expiresIn != null) {
    payloadCopy.exp = now + options.expiresIn;
  }
  if (options?.notBefore != null) {
    payloadCopy.nbf = now + options.notBefore;
  }
  payloadCopy.iat = options?.issuedAt ?? now;
  if (options?.issuer != null) payloadCopy.iss = options.issuer;
  if (options?.subject != null) payloadCopy.sub = options.subject;
  if (options?.audience != null) payloadCopy.aud = options.audience;

  if (options?.tokenId === true) {
    payloadCopy.jti = generateJti();
  } else if (typeof options?.tokenId === 'string') {
    payloadCopy.jti = options.tokenId;
  }

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payloadCopy));
  const signingInput = `${headerB64}.${payloadB64}`;

  let signature: Buffer;
  if (isHmac(alg)) {
    const hmac = createHmac(ALG_TO_HASH[alg], secret);
    hmac.update(signingInput, 'utf8');
    signature = hmac.digest();
  } else if (isRsa(alg)) {
    const sign = createSign(ALG_TO_HASH[alg]);
    sign.update(signingInput, 'utf8');
    sign.end();
    signature = sign.sign(secret);
  } else {
    throw new Error(`Unsupported algorithm: ${String(alg)}`);
  }

  const signatureB64 = signature.toString('base64url');
  return `${signingInput}.${signatureB64}`;
}
