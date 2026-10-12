const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}

import { PbkdfDeriveOptions } from '../types/hash.types';
import {
  iterationsError,
  keyLengthError,
  digestError,
} from '../utils/error.message';
import { passwordToBytes } from '../utils/encode';

export const DEFAULT_PBKDF2_ITERATIONS = 210_000;
export const DEFAULT_KEY_LENGTH = 32;
export const DEFAULT_DIGEST = 'SHA-256';

const ALLOWED_DIGESTS = ['SHA-256', 'SHA-384', 'SHA-512'];

/**
 * Generates a cryptographically secure random salt.
 * @param length Salt length in bytes. @default 16
 */
export function generateSalt(length = 16): Uint8Array {
  if (!Number.isInteger(length) || length < 8) {
    throw new Error(keyLengthError.invalidKeyLength);
  }
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Derives a key from a password using PBKDF2 (Web Crypto). Isomorphic:
 * works in Node.js 18+ and modern browsers.
 */
export async function pbkdf2DeriveBits(
  password: string,
  salt: Uint8Array,
  options: PbkdfDeriveOptions = {},
): Promise<Uint8Array> {
  const {
    digest = DEFAULT_DIGEST,
    iterations = DEFAULT_PBKDF2_ITERATIONS,
    keyLength = DEFAULT_KEY_LENGTH,
  } = options;

  if (!ALLOWED_DIGESTS.includes(digest)) {
    throw new Error(digestError(ALLOWED_DIGESTS));
  }
  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new Error(iterationsError.invalidIterations);
  }
  if (!Number.isInteger(keyLength) || keyLength <= 0) {
    throw new Error(keyLengthError.invalidKeyLength);
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(passwordToBytes(password)),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: digest, salt: new Uint8Array(salt), iterations },
    keyMaterial,
    keyLength * 8,
  );

  return new Uint8Array(bits);
}
