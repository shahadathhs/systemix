import { createSign, createVerify } from 'node:crypto';
import type { RsaAlgorithm } from '../common/enums';
import { RSA_NODE_HASH } from '../common/enums';
import { base64UrlDecode } from '../common/utils/base64';
import { bytesToBase64Url } from '../common/utils';

export function signRsa(
  signingInput: string,
  privateKeyPem: string,
  alg: RsaAlgorithm,
): string {
  const sign = createSign(RSA_NODE_HASH[alg]);
  sign.update(signingInput, 'utf8');
  sign.end();
  const signature = sign.sign(privateKeyPem);
  return bytesToBase64Url(new Uint8Array(signature));
}

export function verifyRsa(
  signingInput: string,
  signatureB64: string,
  publicKeyPem: string,
  alg: RsaAlgorithm,
): boolean {
  const signature = base64UrlDecode(signatureB64);
  const verify = createVerify(RSA_NODE_HASH[alg]);
  verify.update(signingInput, 'utf8');
  verify.end();
  return verify.verify(publicKeyPem, Buffer.from(signature));
}
