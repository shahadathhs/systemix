/** HMAC algorithms (symmetric - use shared secret) */
export type HmacAlgorithm = 'HS256' | 'HS384' | 'HS512';

/** RSA algorithms (asymmetric - use private key to sign, public key to verify) */
export type RsaAlgorithm = 'RS256' | 'RS384' | 'RS512';

/** All supported signing algorithms */
export type SignedAlgorithm = HmacAlgorithm | RsaAlgorithm;

export interface SignedHeader {
  alg: SignedAlgorithm;
  typ?: string;
  kid?: string;
  cty?: string;
}

/** Standard claims (issuer, subject, audience, timing, id) */
export interface StandardClaims {
  /** Issuer - principal that issued the token */
  iss?: string;
  /** Subject - principal that is the subject */
  sub?: string;
  /** Audience - intended recipients */
  aud?: string | string[];
  /** Expiration time - seconds since epoch */
  exp?: number;
  /** Not before - seconds since epoch */
  nbf?: number;
  /** Issued at - seconds since epoch */
  iat?: number;
  /** Token ID - unique identifier */
  jti?: string;
}

export type SignedPayload = Record<string, unknown> & StandardClaims;

export interface EncodeSignedOptions {
  /** Signing algorithm. Default: HS256 */
  algorithm?: SignedAlgorithm;
  /** Token type in header. Default: 'ST' (signed token) */
  typ?: string;
  /** Key ID for key rotation / JWKS */
  kid?: string;
  /** Content type for nested tokens */
  cty?: string;
  /** Expiration in seconds from now */
  expiresIn?: number;
  /** Not before in seconds from now */
  notBefore?: number;
  /** Issued at - defaults to now if not set */
  issuedAt?: number;
  /** Issuer claim */
  issuer?: string;
  /** Subject claim */
  subject?: string;
  /** Audience claim */
  audience?: string | string[];
  /** Token ID - auto-generated if true, or use provided string */
  tokenId?: string | true;
  /** Clock tolerance in seconds for exp/nbf (default: 0) */
  clockTolerance?: number;
}

export interface VerifySignedOptions {
  /** Expected algorithms (whitelist). Required - prevents algorithm confusion attacks. */
  algorithms: SignedAlgorithm[];
  /** Expected issuer - validated if provided */
  issuer?: string | string[];
  /** Expected audience - validated if provided */
  audience?: string | string[];
  /** Expected subject */
  subject?: string;
  /** Clock tolerance in seconds for exp/nbf (default: 0) */
  clockTolerance?: number;
  /** If true, ignore exp claim (not recommended) */
  ignoreExpiration?: boolean;
  /** If true, ignore nbf claim */
  ignoreNotBefore?: boolean;
}

export interface DecodedToken<T = unknown> {
  header: SignedHeader;
  payload: T;
  signature: string;
}
