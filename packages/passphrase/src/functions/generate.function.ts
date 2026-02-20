// Use globalThis.crypto (browser + Node 18+) for isomorphic support
const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}
import { GeneratePassphraseFunctionProps } from '../types/props.types';
import { defaultWordList } from '../utils/default.value';
import { generatePassphrasePropValidation } from './validation.function';

/**
 * Calculates the theoretical entropy of a passphrase.
 * H = L * log2(N)
 */
export function calculatePassphraseEntropy(
  wordCount: number,
  wordListSize: number,
): number {
  if (wordCount <= 0 || wordListSize <= 0) return 0;
  return wordCount * Math.log2(wordListSize);
}

function getRandomInt(max: number): number {
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

export function generatePassphrase(
  options: GeneratePassphraseFunctionProps = {},
): string {
  const {
    wordCount = 4,
    separator = ' ',
    wordList = defaultWordList,
    capitalize = false,
    useTitleCase = false,
    useUpperCase = false,
    includeNumber = false,
    randomSeparator = false,
  } = options;

  generatePassphrasePropValidation(options);

  const separators = ['-', '_', '.', ' ', '', '/'];

  const passphraseWords: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = getRandomInt(wordList.length);
    let word = wordList[randomIndex];

    if (useUpperCase) {
      word = word.toUpperCase();
    } else if (useTitleCase || capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }

    if (includeNumber) {
      const num = getRandomInt(10);
      const position = getRandomInt(2); // 0 = start, 1 = end
      word = position === 0 ? num + word : word + num;
    }

    passphraseWords.push(word);
  }

  if (randomSeparator) {
    let result = passphraseWords[0];
    for (let i = 1; i < passphraseWords.length; i++) {
      const sep = separators[getRandomInt(separators.length)];
      result += sep + passphraseWords[i];
    }
    return result;
  }

  return passphraseWords.join(separator);
}
