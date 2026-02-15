import { webcrypto as crypto } from 'node:crypto';
import { GeneratePassphraseFunctionProps } from '../types/props.types';
import { defaultWordList } from '../utils/default.value';
import { generatePassphrasePropValidation } from './validation.function';

export function generatePassphrase(
  options: GeneratePassphraseFunctionProps = {},
): string {
  const {
    wordCount = 4,
    separator = ' ',
    wordList = defaultWordList,
    capitalize = false,
  } = options;

  generatePassphrasePropValidation(options);

  const getSecureRandomIndex = (max: number): number => {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  const passphraseWords: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = getSecureRandomIndex(wordList.length);
    let word = wordList[randomIndex];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    passphraseWords.push(word);
  }

  return passphraseWords.join(separator);
}
