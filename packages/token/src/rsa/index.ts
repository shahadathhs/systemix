import { signBytes, verifyBytes, type KeyInput } from '../common/crypto/jws';
import type { RsaAlgorithm } from '../common/enums';
import { base64UrlDecode } from '../common/utils/base64';
import { bytesToBase64Url } from '../common/utils';

/**
 * RSASSA-PKCS1-v1_5 sign (RS256/384/512). Returns a base64url signature.
 * For new code prefer encodeSigned with PS256 or ES256/EdDSA.
 */
export async function signRsa(
  signingInput: string,
  privateKey: KeyInput,
  alg: RsaAlgorithm,
): Promise<string> {
  return bytesToBase64Url(signBytes(alg, signingInput, privateKey));
}

/**
 * RSASSA-PKCS1-v1_5 verify (RS256/384/512).
 */
export async function verifyRsa(
  signingInput: string,
  signatureB64: string,
  publicKey: KeyInput,
  alg: RsaAlgorithm,
): Promise<boolean> {
  return verifyBytes(
    alg,
    signingInput,
    base64UrlDecode(signatureB64),
    publicKey,
  );
}

export type { RsaAlgorithm } from '../common/enums';
