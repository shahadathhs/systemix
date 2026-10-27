/** HMAC algorithms (symmetric — shared secret). */
export const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const;
/** RSASSA-PKCS1-v1_5 algorithms. */
export const RSA_ALGORITHMS = ['RS256', 'RS384', 'RS512'] as const;
/** RSASSA-PSS algorithms (preferred over PKCS1-v1_5 for new systems). */
export const PSS_ALGORITHMS = ['PS256', 'PS384', 'PS512'] as const;
/** ECDSA algorithms (P-256, P-384, P-521). */
export const ECDSA_ALGORITHMS = ['ES256', 'ES384', 'ES512'] as const;
/** EdDSA (Ed25519 / Ed448). */
export const EDDSA_ALGORITHMS = ['EdDSA'] as const;

export type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number];
export type RsaAlgorithm = (typeof RSA_ALGORITHMS)[number];
export type PssAlgorithm = (typeof PSS_ALGORITHMS)[number];
export type EcdsaAlgorithm = (typeof ECDSA_ALGORITHMS)[number];
export type EddsaAlgorithm = (typeof EDDSA_ALGORITHMS)[number];
export type AsymmetricAlgorithm =
  RsaAlgorithm | PssAlgorithm | EcdsaAlgorithm | EddsaAlgorithm;
export type SignedAlgorithm = HmacAlgorithm | AsymmetricAlgorithm;

export const SIGNED_ALGORITHMS: readonly SignedAlgorithm[] = [
  ...HMAC_ALGORITHMS,
  ...RSA_ALGORITHMS,
  ...PSS_ALGORITHMS,
  ...ECDSA_ALGORITHMS,
  ...EDDSA_ALGORITHMS,
];

export function isHmac(alg: SignedAlgorithm): alg is HmacAlgorithm {
  return HMAC_ALGORITHMS.includes(alg as HmacAlgorithm);
}

export function isRsa(alg: SignedAlgorithm): alg is RsaAlgorithm {
  return RSA_ALGORITHMS.includes(alg as RsaAlgorithm);
}

export function isAsymmetric(alg: SignedAlgorithm): alg is AsymmetricAlgorithm {
  return SIGNED_ALGORITHMS.includes(alg) && !isHmac(alg);
}
