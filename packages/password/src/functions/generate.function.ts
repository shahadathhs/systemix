import { webcrypto as crypto } from 'node:crypto';
import { GeneratePasswordFunctionProps } from '../types/props.types';
import { generatePasswordPropValidation } from './validation.function';

export interface ExtendedGeneratePasswordFunctionProps extends GeneratePasswordFunctionProps {
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSymbols?: number;
  customUppercase?: string;
  customLowercase?: string;
  customNumbers?: string;
  customSymbols?: string;
}

/**
 * Calculates the theoretical entropy of a password based on its length and charset size.
 * H = L * log2(N)
 */
export function calculatePasswordEntropy(
  length: number,
  charsetSize: number,
): number {
  if (length <= 0 || charsetSize <= 0) return 0;
  return length * Math.log2(charsetSize);
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

function shuffleString(str: string): string {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = getRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export function generatePassword(
  props: ExtendedGeneratePasswordFunctionProps = {},
): string | string[] {
  const {
    length = 12,
    useNumbers = true,
    useUppercase = true,
    useLowercase = true,
    useSymbols = false,
    excludeSimilarCharacters = false,
    exclude = '',
    count = 1,
    minUppercase = 0,
    minLowercase = 0,
    minNumbers = 0,
    minSymbols = 0,
    customUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    customLowercase = 'abcdefghijklmnopqrstuvwxyz',
    customNumbers = '0123456789',
    customSymbols = '@#$%^&*()_+=<>?/|',
  } = props;

  generatePasswordPropValidation(props);

  const similarChars = 'il1Lo0O';

  const filterCharset = (base: string) => {
    let result = base;
    if (excludeSimilarCharacters) {
      result = result
        .split('')
        .filter((char) => !similarChars.includes(char))
        .join('');
    }
    if (exclude) {
      result = result
        .split('')
        .filter((char) => !exclude.includes(char))
        .join('');
    }
    return result;
  };

  const charsets = {
    uppercase: filterCharset(customUppercase),
    lowercase: filterCharset(customLowercase),
    numbers: filterCharset(customNumbers),
    symbols: filterCharset(customSymbols),
  };

  const activeCharsets: string[] = [];
  if (useUppercase && charsets.uppercase)
    activeCharsets.push(charsets.uppercase);
  if (useLowercase && charsets.lowercase)
    activeCharsets.push(charsets.lowercase);
  if (useNumbers && charsets.numbers) activeCharsets.push(charsets.numbers);
  if (useSymbols && charsets.symbols) activeCharsets.push(charsets.symbols);

  const fullCharset = activeCharsets.join('');
  if (fullCharset.length === 0) {
    throw new Error('No valid characters to generate password.');
  }

  const generateSinglePassword = () => {
    const passwordChars: string[] = [];

    // Guarantees
    const addGuaranteed = (count: number, set: string) => {
      if (count > 0 && set.length > 0) {
        for (let i = 0; i < count; i++) {
          passwordChars.push(set[getRandomInt(set.length)]);
        }
      }
    };

    if (useUppercase) addGuaranteed(minUppercase, charsets.uppercase);
    if (useLowercase) addGuaranteed(minLowercase, charsets.lowercase);
    if (useNumbers) addGuaranteed(minNumbers, charsets.numbers);
    if (useSymbols) addGuaranteed(minSymbols, charsets.symbols);

    if (passwordChars.length > length) {
      throw new Error(
        'Minimum character requirements exceed requested password length.',
      );
    }

    // Fill remaining
    const remainingLength = length - passwordChars.length;
    for (let i = 0; i < remainingLength; i++) {
      passwordChars.push(fullCharset[getRandomInt(fullCharset.length)]);
    }

    return shuffleString(passwordChars.join(''));
  };

  if (count === 1) return generateSinglePassword();
  return Array.from({ length: count }, () => generateSinglePassword());
}
