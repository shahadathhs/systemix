import { bytesToBase64Url, base64UrlToBytes } from '../utils/encode';

/**
 * Compares two strings in constant time to prevent timing attacks.
 * Iterates over the longer input regardless of where a difference occurs.
 */
export function secureEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return result === 0;
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
