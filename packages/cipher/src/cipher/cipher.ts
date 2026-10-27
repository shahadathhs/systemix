import {
  CipherOptions,
  assertValidKey,
  assertValidOptions,
  buildAlgorithm,
  generateIv,
  importAesKey,
} from './internals';
import { IV_LENGTH } from './key';
import { DecryptionError, InvalidPayloadError } from '../utils/errors';
import { buildAad, buildHeader, parseEnvelope } from './envelope';

const encoder = new TextEncoder();

/**
 * Converts a string or Uint8Array into bytes.
 */
export function toBytes(data: string | Uint8Array): Uint8Array {
  return typeof data === 'string' ? encoder.encode(data) : data;
}

/**
 * Encrypts data with AES-GCM (authenticated encryption).
 *
 * Output is a versioned envelope — see ./envelope.ts:
 * `SX | version | keyIdLen | keyId | 12-byte IV | ciphertext + 16-byte tag`.
 * The header is authenticated, the IV is random per call, and the whole thing
 * is a single blob safe to store or transmit.
 *
 * A random 96-bit IV is safe for roughly 2^32 messages per key; rotate keys
 * well before that (see createKeyring).
 *
 * @param data Plaintext string (UTF-8) or bytes.
 * @param key AES key: 16, 24, or 32 bytes (see generateKeyBytes).
 * @param options Optional AAD and key id.
 */
export async function encrypt(
  data: string | Uint8Array,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<Uint8Array> {
  assertValidKey(key);
  assertValidOptions(options);

  const header = buildHeader(options.keyId ?? '');
  const iv = generateIv();
  const cryptoKey = await importAesKey(key, ['encrypt']);
  const algorithm = buildAlgorithm(
    iv,
    buildAad(header, options.additionalData),
  );

  const encrypted = await crypto.subtle.encrypt(
    algorithm,
    cryptoKey,
    toBytes(data) as unknown as ArrayBuffer,
  );

  const payload = new Uint8Array(
    header.length + IV_LENGTH + encrypted.byteLength,
  );
  payload.set(header, 0);
  payload.set(iv, header.length);
  payload.set(new Uint8Array(encrypted), header.length + IV_LENGTH);
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

async function aesGcmDecrypt(
  key: Uint8Array,
  iv: Uint8Array,
  ciphertext: Uint8Array,
  aad: Uint8Array | undefined,
): Promise<Uint8Array> {
  const cryptoKey = await importAesKey(key, ['decrypt']);
  try {
    const decrypted = await crypto.subtle.decrypt(
      buildAlgorithm(iv, aad),
      cryptoKey,
      ciphertext as unknown as ArrayBuffer,
    );
    return new Uint8Array(decrypted);
  } catch {
    throw new DecryptionError(
      'Decryption failed. Wrong key, tampered data, or wrong additional data.',
    );
  }
}

/**
 * Decrypts a payload produced by encrypt. Also accepts the legacy
 * `[IV][ciphertext+tag]` format from 0.1.x unless `allowLegacy` is false.
 *
 * @param payload Encrypted blob.
 * @param key The same AES key used for encryption.
 * @param options The same AAD used for encryption, if any.
 * @throws {InvalidPayloadError} If the payload is too short to be valid.
 * @throws {DecryptionError} On wrong key, tampered data, or wrong AAD.
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

  const { additionalData, allowLegacy = true } = options;
  const envelope = parseEnvelope(payload);

  if (envelope) {
    try {
      return await aesGcmDecrypt(
        key,
        envelope.iv,
        envelope.ciphertext,
        buildAad(envelope.header, additionalData),
      );
    } catch (error) {
      // A legacy payload can, rarely, start with the envelope magic.
      if (!allowLegacy) throw error;
    }
  } else if (!allowLegacy) {
    throw new InvalidPayloadError(
      'Unrecognized payload. Expected a versioned envelope.',
    );
  }

  return aesGcmDecrypt(
    key,
    payload.slice(0, IV_LENGTH),
    payload.slice(IV_LENGTH),
    additionalData,
  );
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
