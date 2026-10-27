import { getRandomBytes } from '../common/crypto';
import { signBytes, type KeyInput } from '../common/crypto/jws';
import { SIGNED_ALGORITHMS, type SignedAlgorithm } from '../common/enums';
import type {
  EncodeSignedOptions,
  SignedPayload,
} from '../common/types/signed.types';
import { bytesToBase64Url, bytesToHex } from '../common/utils';
import { base64UrlEncode } from '../common/utils/base64';

function generateJti(): string {
  return bytesToHex(getRandomBytes(16));
}

/**
 * Encode a payload into a signed compact token (JWS).
 *
 * Algorithms: HS256/384/512 (secret ≥ 32/48/64 bytes), RS256/384/512,
 * PS256/384/512, ES256/384/512, and EdDSA. Asymmetric algorithms take a PEM
 * private key or a node:crypto KeyObject.
 */
export async function encodeSigned(
  payload: SignedPayload,
  secret: KeyInput,
  options?: EncodeSignedOptions,
): Promise<string> {
  const alg: SignedAlgorithm = options?.algorithm ?? 'HS256';
  if (!SIGNED_ALGORITHMS.includes(alg)) {
    throw new Error(`Unsupported algorithm: ${String(alg)}`);
  }
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

  const signature = signBytes(alg, signingInput, secret);
  return `${signingInput}.${bytesToBase64Url(signature)}`;
}
