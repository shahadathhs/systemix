import type { DecodedToken, SignedHeader } from './types';
import { InvalidTokenError } from './errors';
import { base64UrlDecodeToUtf8 } from './utils';

/**
 * Decode a signed token without verification.
 * Use this when you need to inspect the payload before deciding whether to verify.
 * For verified decoding, use verifySigned instead.
 *
 * @param token - The signed token string
 * @returns Decoded header, payload, and raw signature
 * @throws InvalidTokenError if token is malformed
 */
export function decodeSigned<T = unknown>(token: string): DecodedToken<T> {
  if (typeof token !== 'string' || !token.trim()) {
    throw new InvalidTokenError('Token must be a non-empty string');
  }

  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    throw new InvalidTokenError(
      'Token must have exactly 3 parts (header.payload.signature)',
    );
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header: SignedHeader;
  let payload: T;

  try {
    const headerJson = base64UrlDecodeToUtf8(headerB64);
    header = JSON.parse(headerJson) as SignedHeader;
  } catch {
    throw new InvalidTokenError('Invalid header encoding');
  }

  try {
    const payloadJson = base64UrlDecodeToUtf8(payloadB64);
    payload = JSON.parse(payloadJson) as T;
  } catch {
    throw new InvalidTokenError('Invalid payload encoding');
  }

  if (typeof header !== 'object' || header === null) {
    throw new InvalidTokenError('Header must be an object');
  }

  return {
    header,
    payload,
    signature: signatureB64,
  };
}
