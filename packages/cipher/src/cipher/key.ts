import { CipherError } from '../utils/errors';

/**
 * Default key length in bytes (AES-256).
 */
export const DEFAULT_KEY_LENGTH = 32;

/**
 * GCM standard IV length in bytes. A unique IV per encryption is required
 * for security; the library enforces 12 bytes (96 bits), the GCM standard.
 */
export const IV_LENGTH = 12;

/**
 * GCM authentication tag length in bits.
 */
export const TAG_LENGTH = 128;

/**
 * Allowed AES key lengths in bytes (AES-128, AES-192, AES-256).
 */
export const ALLOWED_KEY_LENGTHS = [16, 24, 32];

const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}

/**
 * Generates a cryptographically secure random AES key.
 * @param length Key length in bytes: 16 (AES-128), 24 (AES-192), or 32 (AES-256). @default 32
 */
export function generateKeyBytes(length = DEFAULT_KEY_LENGTH): Uint8Array {
  if (!ALLOWED_KEY_LENGTHS.includes(length)) {
    throw new CipherError(
      `Invalid key length. Allowed values: ${ALLOWED_KEY_LENGTHS.join(', ')} bytes.`,
    );
  }
  const key = new Uint8Array(length);
  crypto.getRandomValues(key);
  return key;
}

/**
 * Derives an AES-256 key from a password using PBKDF2-HMAC-SHA256.
 *
 * The salt must be stored alongside the ciphertext — pass it back to this
 * function when deriving the same key later. Use `generateSalt` for new salts.
 *
 * @param password Password to derive from.
 * @param salt Salt bytes (min 8 bytes). Must be reused for the same key.
 * @param iterations PBKDF2 iteration count. @default 210_000
 */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations = 210_000,
): Promise<Uint8Array> {
  if (typeof password !== 'string' || password.length === 0) {
    throw new CipherError('Invalid password. It must be a non-empty string.');
  }
  if (!(salt instanceof Uint8Array) || salt.length < 8) {
    throw new CipherError(
      'Invalid salt. It must be a Uint8Array with at least 8 bytes.',
    );
  }
  if (!Number.isInteger(iterations) || iterations <= 0) {
    throw new CipherError('Invalid iterations. It must be a positive number.');
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password) as unknown as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: salt as unknown as ArrayBuffer,
      iterations,
    },
    keyMaterial,
    256,
  );

  return new Uint8Array(bits);
}

/**
 * Generates a cryptographically secure random salt (for deriveKeyFromPassword).
 * @param length Salt length in bytes. @default 16
 */
export function generateSalt(length = 16): Uint8Array {
  if (!Number.isInteger(length) || length < 8) {
    throw new CipherError('Invalid length. Salt must be at least 8 bytes.');
  }
  const salt = new Uint8Array(length);
  crypto.getRandomValues(salt);
  return salt;
}
