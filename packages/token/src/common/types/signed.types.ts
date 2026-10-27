import type { KeyInput } from '../crypto/jws';
import type { SignedAlgorithm } from '../enums/algorithm.enum';

export type { KeyInput };

export interface SignedHeader {
  alg: SignedAlgorithm;
  typ?: string;
  kid?: string;
  cty?: string;
  crit?: string[];
}

/** Standard claims (issuer, subject, audience, timing, id) */
export interface StandardClaims {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export type SignedPayload = Record<string, unknown> & StandardClaims;

export interface EncodeSignedOptions {
  algorithm?: SignedAlgorithm;
  typ?: string;
  kid?: string;
  cty?: string;
  expiresIn?: number;
  notBefore?: number;
  issuedAt?: number;
  issuer?: string;
  subject?: string;
  audience?: string | string[];
  tokenId?: string | true;
  clockTolerance?: number;
}

/**
 * A key, or a function that picks one from the (unverified) token header —
 * typically by `kid`. The header is untrusted: use it only to look a key up in
 * a set you control, never to decide the algorithm.
 */
export type KeyResolver = (
  header: SignedHeader,
) => KeyInput | Promise<KeyInput>;

export interface VerifySignedOptions {
  /** Algorithms you accept. Required: the token's own `alg` is never trusted. */
  algorithms: SignedAlgorithm[];
  /**
   * Required `typ` header (case-insensitive), e.g. 'JWT' or 'at+jwt'. Set it
   * to stop one kind of token being accepted as another (RFC 8725 §3.11).
   */
  typ?: string;
  /** Reject tokens older than this many seconds since `iat`. */
  maxAge?: number;
  issuer?: string | string[];
  audience?: string | string[];
  subject?: string;
  clockTolerance?: number;
  ignoreExpiration?: boolean;
  ignoreNotBefore?: boolean;
}

export interface DecodedToken<T = unknown> {
  header: SignedHeader;
  payload: T;
  signature: string;
}
