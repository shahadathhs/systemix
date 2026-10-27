import { timingSafeEqual } from 'node:crypto';
import { bytesToBase64Url, base64UrlToBytes } from '../utils/encode';

/**
 * Compares two strings in constant time (node:crypto.timingSafeEqual) to
 * prevent timing attacks. Compares UTF-8 bytes; when lengths differ it still
 * performs a comparison of equal cost before returning false.
 */
export function secureEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBytes = enc.encode(a);
  const bBytes = enc.encode(b);
  if (aBytes.length !== bBytes.length) {
    timingSafeEqual(aBytes, aBytes);
    return false;
  }
  return timingSafeEqual(aBytes, bBytes);
}

/**
 * Encodes a derived hash into a self-describing string for storage.
 *
 * Format:
 * - pbkdf2: `pbkdf2$<digest>$<iterations>$<saltB64url>$<hashB64url>`
 * - scrypt: `scrypt$<N>$<r>$<p>$<saltB64url>$<hashB64url>`
 */
export function encodeHashString(parts: string[]): string {
  return parts.join('$');
}

export { bytesToBase64Url, base64UrlToBytes };
