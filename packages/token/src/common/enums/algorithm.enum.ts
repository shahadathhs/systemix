/** HMAC algorithms (symmetric - use shared secret) */
export const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
/** RSA algorithms (asymmetric - use private key to sign, public key to verify) */
export const RSA_ALGORITHMS = ['RS256', 'RS384', 'RS512'] as const;

export type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number];
export type RsaAlgorithm = (typeof RSA_ALGORITHMS)[number];
export type SignedAlgorithm = HmacAlgorithm | RsaAlgorithm;

/** Web Crypto API hash names (HMAC) — browser and Node 18+ */
export const HMAC_WEB_CRYPTO_HASH: Record<HmacAlgorithm, string> = {
  HS256: 'SHA-256',
  HS384: 'SHA-384',
  HS512: 'SHA-512',
};

/** Node crypto algorithm names (RSA sign/verify) */
export const RSA_NODE_HASH: Record<RsaAlgorithm, string> = {
  RS256: 'RSA-SHA256',
  RS384: 'RSA-SHA384',
  RS512: 'RSA-SHA512',
};

/** Web Crypto API algorithm (RSA) — browser and Node 18+ */
export const RSA_WEB_CRYPTO_HASH: Record<RsaAlgorithm, string> = {
  RS256: 'SHA-256',
  RS384: 'SHA-384',
  RS512: 'SHA-512',
};

export function isHmac(alg: SignedAlgorithm): alg is HmacAlgorithm {
  return HMAC_ALGORITHMS.includes(alg as HmacAlgorithm);
}

export function isRsa(alg: SignedAlgorithm): alg is RsaAlgorithm {
  return RSA_ALGORITHMS.includes(alg as RsaAlgorithm);
}
