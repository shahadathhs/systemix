import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time comparison of two byte arrays (node:crypto.timingSafeEqual).
 * Differing lengths return false immediately; lengths are not secret.
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Constant-time comparison of two strings (UTF-8 bytes). Use when comparing
 * signatures or secrets to prevent timing attacks.
 */
export function secureCompare(a: string, b: string): boolean {
  const enc = new TextEncoder();
  return bytesEqual(enc.encode(a), enc.encode(b));
}
