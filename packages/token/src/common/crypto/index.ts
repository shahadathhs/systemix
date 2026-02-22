const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}

/**
 * Constant-time comparison of two byte arrays. Prevents timing attacks when
 * comparing signatures, tokens, or secrets.
 */
export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Constant-time string comparison. Use when comparing signatures or secrets
 * to prevent timing attacks.
 */
export function secureCompare(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  if (aBytes.length !== bBytes.length) return false;
  return bytesEqual(aBytes, bBytes);
}

export function getRandomInt(max: number): number {
  if (max <= 1) return 0;
  const array = new Uint32Array(1);
  const range = Math.floor(0xffffffff / max) * max;
  let randomValue;
  do {
    crypto.getRandomValues(array);
    randomValue = array[0];
  } while (randomValue >= range);
  return randomValue % max;
}

export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}
