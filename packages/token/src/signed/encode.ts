import { createHmac, createSign } from 'node:crypto';
import { getRandomBytes } from '../shared/crypto';
import { bytesToHex } from '../common/utils';
import { base64UrlEncode } from '../common/utils/base64';
import { ALG_TO_HASH, isHmac, isRsa } from '../common/enums';
import type {
  SignedPayload,
  EncodeSignedOptions,
} from '../common/types/signed.types';
import type { SignedAlgorithm } from '../common/enums';

function generateJti(): string {
  return bytesToHex(getRandomBytes(16));
}

/**
 * Encode a payload into a signed compact token.
 * Supports HMAC (HS256/384/512) and RSA (RS256/384/512).
 * Pure Node.js - no external dependencies.
 */
export function encodeSigned(
  payload: SignedPayload,
  secret: string,
  options?: EncodeSignedOptions,
): string {
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

  return `${signingInput}.${signature.toString('base64url')}`;
}
