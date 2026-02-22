import { getRandomBytes } from '../common/crypto';
import type { SignedAlgorithm } from '../common/enums';
import { HMAC_WEB_CRYPTO_HASH, isHmac, isRsa } from '../common/enums';
import type {
  EncodeSignedOptions,
  SignedPayload,
} from '../common/types/signed.types';
import { bytesToBase64Url, bytesToHex } from '../common/utils';
import { base64UrlEncode } from '../common/utils/base64';
import { signRsa } from '../rsa';

async function signHmac(
  signingInput: string,
  secret: string,
  alg: 'HS256' | 'HS384' | 'HS512',
): Promise<Uint8Array> {
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
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(signingInput),
  );
  return new Uint8Array(sig);
}

function generateJti(): string {
  return bytesToHex(getRandomBytes(16));
}

/**
 * Encode a payload into a signed compact token.
 * Supports HMAC (HS256/384/512) in browser and Node.
 * RSA (RS256/384/512) requires Node.js.
 */
export async function encodeSigned(
  payload: SignedPayload,
  secret: string,
  options?: EncodeSignedOptions,
): Promise<string> {
  const alg: SignedAlgorithm = options?.algorithm ?? 'HS256';
  const typ = options?.typ ?? 'ST';
  const now = Math.floor(Date.now() / 1000);

  const header: Record<string, string> = { alg, typ };
  if (options?.kid) header.kid = options.kid;
  if (options?.cty) header.cty = options.cty;

  const payloadCopy = { ...payload } as Record<string, unknown>;
  if (options?.expiresIn != null) payloadCopy.exp = now + options.expiresIn;
  if (options?.notBefore != null) payloadCopy.nbf = now + options.notBefore;
  payloadCopy.iat = options?.issuedAt ?? now;
  if (options?.issuer != null) payloadCopy.iss = options.issuer;
  if (options?.subject != null) payloadCopy.sub = options.subject;
  if (options?.audience != null) payloadCopy.aud = options.audience;
  if (options?.tokenId === true) payloadCopy.jti = generateJti();
  else if (typeof options?.tokenId === 'string')
    payloadCopy.jti = options.tokenId;

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payloadCopy));
  const signingInput = `${headerB64}.${payloadB64}`;

  let signatureB64: string;
  if (isHmac(alg)) {
    const signature = await signHmac(signingInput, secret, alg);
    signatureB64 = bytesToBase64Url(signature);
  } else if (isRsa(alg)) {
    signatureB64 = await signRsa(signingInput, secret, alg);
  } else {
    throw new Error(`Unsupported algorithm: ${String(alg)}`);
  }

  return `${signingInput}.${signatureB64}`;
}
