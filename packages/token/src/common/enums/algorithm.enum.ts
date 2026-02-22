/** HMAC algorithms (symmetric - use shared secret) */
export const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
/** RSA algorithms (asymmetric - use private key to sign, public key to verify) */
export const RSA_ALGORITHMS = ['RS256', 'RS384', 'RS512'] as const;

export type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number];
export type RsaAlgorithm = (typeof RSA_ALGORITHMS)[number];
export type SignedAlgorithm = HmacAlgorithm | RsaAlgorithm;

export const ALG_TO_HASH: Record<SignedAlgorithm, string> = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
  RS256: 'RSA-SHA256',
  RS384: 'RSA-SHA384',
  RS512: 'RSA-SHA512',
};

export function isHmac(alg: SignedAlgorithm): alg is HmacAlgorithm {
  return HMAC_ALGORITHMS.includes(alg as HmacAlgorithm);
}

export function isRsa(alg: SignedAlgorithm): alg is RsaAlgorithm {
  return RSA_ALGORITHMS.includes(alg as RsaAlgorithm);
}
