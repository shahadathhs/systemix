import { base64UrlDecodeToUtf8 } from '../common/utils/base64';
import type { DecodedToken, SignedHeader } from '../common/types/signed.types';
import { InvalidTokenError } from '../common/errors';

/**
 * Decode a signed token without verification.
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
    header = JSON.parse(base64UrlDecodeToUtf8(headerB64)) as SignedHeader;
  } catch {
    throw new InvalidTokenError('Invalid header encoding');
  }

  try {
    payload = JSON.parse(base64UrlDecodeToUtf8(payloadB64)) as T;
  } catch {
    throw new InvalidTokenError('Invalid payload encoding');
  }

  if (typeof header !== 'object' || header === null) {
    throw new InvalidTokenError('Header must be an object');
  }

  return { header, payload, signature: signatureB64 };
}
