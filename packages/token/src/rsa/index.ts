import type { RsaAlgorithm } from '../common/enums';
import { isNode } from '../common/env';
import * as rsaNode from './rsa-node';
import * as rsaWeb from './rsa-web';

/**
 * RSA sign — auto-detects Node vs browser.
 * Node: uses node:crypto. Browser: uses Web Crypto API.
 */
export async function signRsa(
  signingInput: string,
  privateKeyPem: string,
  alg: RsaAlgorithm,
): Promise<string> {
  return isNode()
    ? Promise.resolve(rsaNode.signRsa(signingInput, privateKeyPem, alg))
    : rsaWeb.signRsa(signingInput, privateKeyPem, alg);
}

/**
 * RSA verify — auto-detects Node vs browser.
 */
export async function verifyRsa(
  signingInput: string,
  signatureB64: string,
  publicKeyPem: string,
  alg: RsaAlgorithm,
): Promise<boolean> {
  return isNode()
    ? Promise.resolve(
        rsaNode.verifyRsa(signingInput, signatureB64, publicKeyPem, alg),
      )
    : rsaWeb.verifyRsa(signingInput, signatureB64, publicKeyPem, alg);
}

export type { RsaAlgorithm } from '../common/enums';
