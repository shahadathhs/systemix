import { GenerateIdOptions } from '../types/id.types';
import { getRandomInt } from '../utils/random';
import { alphabetError, sizeError } from '../utils/error.message';

/**
 * URL-safe alphabet (nanoid default): 64 unique characters.
 */
export const urlAlphabet =
  'useandom26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const DEFAULT_SIZE = 21;
const MAX_SIZE = 1024;
const MAX_ALPHABET_LENGTH = 256;

function validateOptions(size: number, alphabet: string): void {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error(sizeError.invalidSize);
  }
  if (size > MAX_SIZE) {
    throw new Error(sizeError.sizeTooLarge);
  }
  if (typeof alphabet !== 'string') {
    throw new Error(alphabetError.invalidAlphabet);
  }
  if (alphabet.length < 2) {
    throw new Error(alphabetError.alphabetTooSmall);
  }
  if (alphabet.length > MAX_ALPHABET_LENGTH) {
    throw new Error(alphabetError.alphabetTooLarge);
  }
  const seen = new Set<string>();
  for (const char of alphabet) {
    if (seen.has(char)) {
      throw new Error(alphabetError.duplicateAlphabetChars);
    }
    seen.add(char);
  }
}

/**
 * Generates a compact, URL-safe, nanoid-style random ID using
 * crypto-grade randomness with bias-free character selection.
 *
 * @example generateId() // "V1StGXR8_Z5jdHi6B-myT"
 */
export function generateId(options: GenerateIdOptions = {}): string {
  const { size = DEFAULT_SIZE, alphabet = urlAlphabet } = options;
  validateOptions(size, alphabet);

  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[getRandomInt(alphabet.length)];
  }
  return id;
}
