export type SignedAlgorithm = 'HS256' | 'HS384' | 'HS512';

export interface SignedHeader {
  alg: SignedAlgorithm;
  typ?: string;
}

export type SignedPayload = Record<string, unknown> & {
  iat?: number;
  exp?: number;
  nbf?: number;
  sub?: string;
  iss?: string;
  aud?: string | string[];
  tokenId?: string;
};

export interface EncodeSignedOptions {
  algorithm?: SignedAlgorithm;
  expiresIn?: number; // seconds
  notBefore?: number;
  issuer?: string;
  subject?: string;
  audience?: string | string[];
  tokenId?: string;
}
