import { CipherError, InvalidKeyError } from '../utils/errors';
import { ALLOWED_KEY_LENGTHS, IV_LENGTH, TAG_LENGTH } from './key';

const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}

export interface CipherOptions {
  /**
   * Additional authenticated data (AAD). Authenticated but not encrypted —
   * the same AAD must be provided for decryption.
   */
  additionalData?: Uint8Array;

  /**
   * Custom 12-byte IV. If omitted, a random IV is generated.
   * Provide only when an external process controls IV generation.
   */
  iv?: Uint8Array;
}

/**
 * Validates an AES key.
 */
export function assertValidKey(key: Uint8Array): void {
  if (
    !(key instanceof Uint8Array) ||
    !ALLOWED_KEY_LENGTHS.includes(key.length)
  ) {
    throw new InvalidKeyError();
  }
}

/**
 * Validates optional cipher inputs (AAD and IV).
 */
export function assertValidOptions(options: CipherOptions): void {
  const { additionalData, iv } = options;
  if (
    additionalData !== undefined &&
    (!(additionalData instanceof Uint8Array) || additionalData.length === 0)
  ) {
    throw new CipherError(
      'Invalid additionalData. It must be a non-empty Uint8Array.',
    );
  }
  if (
    iv !== undefined &&
    (!(iv instanceof Uint8Array) || iv.length !== IV_LENGTH)
  ) {
    throw new CipherError(
      `Invalid iv. It must be a Uint8Array of exactly ${IV_LENGTH} bytes.`,
    );
  }
}

/**
 * Imports raw bytes as a non-extractable AES-GCM CryptoKey.
 */
export async function importAesKey(
  key: Uint8Array,
  usages: KeyUsage[],
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    key as unknown as ArrayBuffer,
    { name: 'AES-GCM' },
    false,
    usages,
  );
}

/**
 * Builds the Web Crypto AES-GCM algorithm descriptor.
 */
export function buildAlgorithm(
  iv: Uint8Array,
  additionalData?: Uint8Array,
): AesGcmParams {
  const algorithm: AesGcmParams = {
    name: 'AES-GCM',
    iv: iv as unknown as ArrayBuffer,
    tagLength: TAG_LENGTH,
  };
  if (additionalData) {
    algorithm.additionalData = additionalData as unknown as ArrayBuffer;
  }
  return algorithm;
}

/**
 * Generates a fresh random IV.
 */
export function generateIv(): Uint8Array {
  const iv = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(iv);
  return iv;
}
