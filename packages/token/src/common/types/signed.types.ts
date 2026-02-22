import type { SignedAlgorithm } from '../enums/algorithm.enum';

export interface SignedHeader {
  alg: SignedAlgorithm;
  typ?: string;
  kid?: string;
  cty?: string;
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

export interface VerifySignedOptions {
  algorithms: SignedAlgorithm[];
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
