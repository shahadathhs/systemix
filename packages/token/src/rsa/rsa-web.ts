import type { RsaAlgorithm } from '../common/enums';
import { RSA_WEB_CRYPTO_HASH } from '../common/enums';
import { base64UrlDecode } from '../common/utils/base64';
import { bytesToBase64Url } from '../common/utils';

function pemToBinary(pem: string, type: 'private' | 'public'): ArrayBuffer {
  const header = type === 'private' ? 'PRIVATE KEY' : 'PUBLIC KEY';
  const regex = new RegExp(
    `-----BEGIN ${header}-----([\\s\\S]*?)-----END ${header}-----`,
  );
  const match = pem.match(regex);
  if (!match) {
    throw new Error(`Invalid PEM format: expected BEGIN ${header}`);
  }
  const base64 = match[1].replace(/\s/g, '');
  const binary = atob(base64);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0))).buffer;
}

export async function signRsa(
  signingInput: string,
  privateKeyPem: string,
  alg: RsaAlgorithm,
): Promise<string> {
  const crypto = globalThis.crypto;
  if (!crypto?.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is required');
  }
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToBinary(privateKeyPem, 'private'),
    { name: 'RSASSA-PKCS1-v1_5', hash: RSA_WEB_CRYPTO_HASH[alg] },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  );
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function verifyRsa(
  signingInput: string,
  signatureB64: string,
  publicKeyPem: string,
  alg: RsaAlgorithm,
): Promise<boolean> {
  const crypto = globalThis.crypto;
  if (!crypto?.subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is required');
  }
  const key = await crypto.subtle.importKey(
    'spki',
    pemToBinary(publicKeyPem, 'public'),
    { name: 'RSASSA-PKCS1-v1_5', hash: RSA_WEB_CRYPTO_HASH[alg] },
    false,
    ['verify'],
  );
  const signature = base64UrlDecode(signatureB64);
  return crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signature as BufferSource,
    new TextEncoder().encode(signingInput),
  );
}
