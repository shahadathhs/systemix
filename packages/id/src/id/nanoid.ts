import { GenerateIdOptions } from '../types/id.types';
import { getRandomBytes } from '../utils/random';
import { alphabetError, sizeError } from '../utils/error.message';

/**
 * URL-safe alphabet (nanoid default): 64 unique characters.
 */
export const urlAlphabet =
  'useandom26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const DEFAULT_SIZE = 21;
const MAX_SIZE = 1024;
const MAX_ALPHABET_LENGTH = 256;

function validateOptions(size: number, alphabet: string): string[] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error(sizeError.invalidSize);
  }
  if (size > MAX_SIZE) {
    throw new Error(sizeError.sizeTooLarge);
  }
  if (typeof alphabet !== 'string') {
    throw new Error(alphabetError.invalidAlphabet);
  }
  // Split by code point so astral characters are one symbol, not two halves.
  const chars = Array.from(alphabet);
  if (chars.length < 2) {
    throw new Error(alphabetError.alphabetTooSmall);
  }
  if (chars.length > MAX_ALPHABET_LENGTH) {
    throw new Error(alphabetError.alphabetTooLarge);
  }
  if (new Set(chars).size !== chars.length) {
    throw new Error(alphabetError.duplicateAlphabetChars);
  }
  return chars;
}

/**
 * Generates a compact, URL-safe, nanoid-style random ID using crypto-grade
 * randomness. Bytes are drawn in batches and masked to the alphabet's bit
 * width; out-of-range values are rejected, so every character is uniform.
 *
 * @example generateId() // "V1StGXR8_Z5jdHi6B-myT"
 */
export function generateId(options: GenerateIdOptions = {}): string {
  const { size = DEFAULT_SIZE, alphabet = urlAlphabet } = options;
  const chars = validateOptions(size, alphabet);

  const length = chars.length;
  const mask = (2 << (31 - Math.clz32((length - 1) | 1))) - 1;
  // Expected bytes needed per character is (mask + 1) / length; 1.6x covers it.
  const batch = Math.ceil((1.6 * mask * size) / length);

  let id = '';
  let count = 0;
  for (;;) {
    const bytes = getRandomBytes(batch);
    for (let i = 0; i < batch; i++) {
      const index = bytes[i] & mask;
      if (index < length) {
        id += chars[index];
        if (++count === size) return id;
      }
    }
  }
}
