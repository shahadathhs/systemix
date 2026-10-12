import { getRandomBytes } from '../utils/random';

/**
 * Generates a random UUID (version 4) in the standard 8-4-4-4-12 format.
 * Uses crypto.randomUUID when available, with a crypto.getRandomValues
 * fallback for older runtimes.
 */
export function generateUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const bytes = getRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    '',
  );
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
