import { InvalidPayloadError } from '../utils/errors';
import { IV_LENGTH } from './key';

/**
 * Versioned envelope written by encrypt():
 *
 *   'S' 'X' | version (1) | keyIdLen (1) | keyId (0–64) | IV (12) | ciphertext + tag (≥16)
 *
 * Version 1 is AES-GCM with a 12-byte random IV and a 128-bit tag. Everything
 * before the IV (the header) is authenticated as additional data, so changing
 * the version or key id makes decryption fail instead of silently selecting a
 * different key.
 */
export const ENVELOPE_VERSION = 1;
export const MAX_KEY_ID_LENGTH = 64;
const MAGIC_0 = 0x53; // 'S'
const MAGIC_1 = 0x58; // 'X'
const TAG_BYTES = 16;

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

export interface ParsedEnvelope {
  version: number;
  keyId: string;
  /** Header bytes (authenticated as AAD). */
  header: Uint8Array;
  iv: Uint8Array;
  /** Ciphertext followed by the 16-byte tag. */
  ciphertext: Uint8Array;
}

export function buildHeader(keyId: string): Uint8Array {
  const id = encoder.encode(keyId);
  if (id.length > MAX_KEY_ID_LENGTH) {
    throw new InvalidPayloadError(
      `Invalid keyId. It must be at most ${MAX_KEY_ID_LENGTH} bytes (UTF-8).`,
    );
  }
  const header = new Uint8Array(4 + id.length);
  header[0] = MAGIC_0;
  header[1] = MAGIC_1;
  header[2] = ENVELOPE_VERSION;
  header[3] = id.length;
  header.set(id, 4);
  return header;
}

/**
 * Parses an envelope. Returns null when the payload does not start with the
 * envelope magic (e.g. a legacy `[IV][ciphertext+tag]` payload) or is
 * structurally invalid.
 */
export function parseEnvelope(payload: Uint8Array): ParsedEnvelope | null {
  if (
    payload.length < 4 ||
    payload[0] !== MAGIC_0 ||
    payload[1] !== MAGIC_1 ||
    payload[2] !== ENVELOPE_VERSION
  ) {
    return null;
  }
  const idLength = payload[3];
  const headerLength = 4 + idLength;
  if (
    idLength > MAX_KEY_ID_LENGTH ||
    payload.length < headerLength + IV_LENGTH + TAG_BYTES
  ) {
    return null;
  }
  let keyId: string;
  try {
    keyId = decoder.decode(payload.subarray(4, headerLength));
  } catch {
    return null;
  }
  return {
    version: payload[2],
    keyId,
    header: payload.slice(0, headerLength),
    iv: payload.slice(headerLength, headerLength + IV_LENGTH),
    ciphertext: payload.slice(headerLength + IV_LENGTH),
  };
}

/** Header followed by the caller's additional data (if any). */
export function buildAad(
  header: Uint8Array,
  additionalData?: Uint8Array,
): Uint8Array {
  if (!additionalData) return header;
  const aad = new Uint8Array(header.length + additionalData.length);
  aad.set(header, 0);
  aad.set(additionalData, header.length);
  return aad;
}
