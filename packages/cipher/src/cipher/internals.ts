import { CipherError, InvalidKeyError } from '../utils/errors';
import { ALLOWED_KEY_LENGTHS, IV_LENGTH, TAG_LENGTH } from './key';

const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}

export interface CipherOptions {
  /**
   * Additional authenticated data (AAD). Authenticated but not encrypted —
   * the same AAD must be provided for decryption. Bind ciphertexts to their
   * context (e.g. `user:42`) so they cannot be moved between records.
   */
  additionalData?: Uint8Array;

  /**
   * Key identifier written into the envelope header (encrypt only, max 64
   * bytes UTF-8). Used by keyrings to pick the right key on decrypt.
   * @default ''
   */
  keyId?: string;

  /**
   * Whether decrypt may fall back to the pre-envelope `[IV][ciphertext+tag]`
   * format written by @systemix/cipher 0.1.x (decrypt only).
   * @default true
   */
  allowLegacy?: boolean;
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
  const { additionalData, keyId, allowLegacy } = options;
  if (
    additionalData !== undefined &&
    (!(additionalData instanceof Uint8Array) || additionalData.length === 0)
  ) {
    throw new CipherError(
      'Invalid additionalData. It must be a non-empty Uint8Array.',
    );
  }
  if (keyId !== undefined && typeof keyId !== 'string') {
    throw new CipherError('Invalid keyId. It must be a string.');
  }
  if (allowLegacy !== undefined && typeof allowLegacy !== 'boolean') {
    throw new CipherError('Invalid allowLegacy. It must be a boolean.');
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
