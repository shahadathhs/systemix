import { timingSafeEqual } from 'node:crypto';

const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node.js 24.7+.');
}

const encoder = new TextEncoder();

/**
 * Encodes bytes as a URL-safe base64 string without padding.
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decodes a URL-safe base64 string (with or without padding) into bytes.
 */
export function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Converts a password string into its UTF-8 bytes.
 */
export function passwordToBytes(password: string): Uint8Array {
  return encoder.encode(password);
}

/**
 * Constant-time comparison of two byte arrays (node:crypto.timingSafeEqual).
 * Differing lengths return false immediately; lengths are not secret.
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
