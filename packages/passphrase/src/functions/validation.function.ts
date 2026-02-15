import { GeneratePassphraseFunctionProps } from '../types/props.types';
import { passphraseErrors } from '../utils/error.message';

export function generatePassphrasePropValidation(
  props: GeneratePassphraseFunctionProps,
) {
  const { wordCount, separator, wordList, capitalize } = props;

  if (
    wordCount !== undefined &&
    (typeof wordCount !== 'number' || wordCount < 1 || wordCount > 100)
  ) {
    throw new Error(passphraseErrors.invalidWordCount);
  }

  if (separator !== undefined && typeof separator !== 'string') {
    throw new Error(passphraseErrors.invalidSeparator);
  }

  if (wordList !== undefined) {
    if (!Array.isArray(wordList) || wordList.length === 0) {
      throw new Error(passphraseErrors.emptyWordList);
    }
  }

  if (capitalize !== undefined && typeof capitalize !== 'boolean') {
    throw new Error(passphraseErrors.invalidCapitalize);
  }
}
