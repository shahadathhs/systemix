import {
  CipherOptions,
  assertValidKey,
  assertValidOptions,
  buildAlgorithm,
  generateIv,
  importAesKey,
} from './internals';
import { IV_LENGTH } from './key';
import { InvalidPayloadError } from '../utils/errors';

const encoder = new TextEncoder();

/**
 * Converts a string or Uint8Array into bytes.
 */
export function toBytes(data: string | Uint8Array): Uint8Array {
  return typeof data === 'string' ? encoder.encode(data) : data;
}

/**
 * Encrypts data with AES-256-GCM (authenticated encryption).
 *
 * Output layout: `[12-byte IV][ciphertext + 16-byte auth tag]` — a single
 * blob safe to store or transmit.
 *
 * @param data Plaintext string (UTF-8) or bytes.
 * @param key AES key: 16, 24, or 32 bytes (see generateKeyBytes).
 * @param options Optional AAD and IV.
 */
export async function encrypt(
  data: string | Uint8Array,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<Uint8Array> {
  assertValidKey(key);
  assertValidOptions(options);

  const { additionalData, iv = generateIv() } = options;
  const cryptoKey = await importAesKey(key, ['encrypt']);
  const algorithm = buildAlgorithm(iv, additionalData);

  const encrypted = await crypto.subtle.encrypt(
    algorithm,
    cryptoKey,
    toBytes(data) as unknown as ArrayBuffer,
  );

  const payload = new Uint8Array(IV_LENGTH + encrypted.byteLength);
  payload.set(iv, 0);
  payload.set(new Uint8Array(encrypted), IV_LENGTH);
  return payload;
}

/**
 * Encrypts a string and returns the payload as a URL-safe base64 string.
 * Pair with decryptString.
 */
export async function encryptString(
  plaintext: string,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<string> {
  const payload = await encrypt(plaintext, key, options);
  return bytesToBase64Url(payload);
}

/**
 * Decrypts an AES-GCM payload produced by encrypt.
 *
 * @param payload Encrypted blob: [12-byte IV][ciphertext + tag].
 * @param key The same AES key used for encryption.
 * @param options The same AAD used for encryption, if any.
 * @throws {DecryptionError} On wrong key, tampered data, wrong AAD, or malformed payload.
 */
export async function decrypt(
  payload: Uint8Array,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<Uint8Array> {
  assertValidKey(key);
  assertValidOptions(options);

  if (!(payload instanceof Uint8Array) || payload.length < IV_LENGTH + 16) {
    throw new InvalidPayloadError();
  }

  const { additionalData } = options;
  const iv = payload.slice(0, IV_LENGTH);
  const ciphertext = payload.slice(IV_LENGTH);

  const cryptoKey = await importAesKey(key, ['decrypt']);
  const algorithm = buildAlgorithm(iv, additionalData);

  try {
    const decrypted = await crypto.subtle.decrypt(
      algorithm,
      cryptoKey,
      ciphertext as unknown as ArrayBuffer,
    );
    return new Uint8Array(decrypted);
  } catch {
    throw new InvalidPayloadError(
      'Decryption failed. Wrong key, tampered data, or wrong additional data.',
    );
  }
}

const BASE64URL_PATTERN = /-/g;
const BASE64_SLASH_PATTERN = /_/g;
const PADDING_PATTERN = /=+$/;

/**
 * Decodes a URL-safe base64 string into bytes.
 */
export function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value
    .replace(BASE64URL_PATTERN, '+')
    .replace(BASE64_SLASH_PATTERN, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const BASE64_PLUS_PATTERN = /\+/g;
const BASE64URL_SLASH_PATTERN = /\//g;

/**
 * Encodes bytes as a URL-safe base64 string without padding.
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(BASE64_PLUS_PATTERN, '-')
    .replace(BASE64URL_SLASH_PATTERN, '_')
    .replace(PADDING_PATTERN, '');
}

const decoder = new TextDecoder();

/**
 * Decrypts a URL-safe base64 payload produced by encryptString back into
 * the original string.
 *
 * @throws {DecryptionError} On wrong key, tampered data, or malformed payload.
 */
export async function decryptString(
  payload: string,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<string> {
  if (typeof payload !== 'string' || payload.length === 0) {
    throw new InvalidPayloadError();
  }

  const bytes = await decrypt(base64UrlToBytes(payload), key, options);
  return decoder.decode(bytes);
}
