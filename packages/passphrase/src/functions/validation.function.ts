import { GeneratePassphraseFunctionProps } from '../types/props.types';
import { passphraseErrors } from '../utils/error.message';

export function generatePassphrasePropValidation(
  props: GeneratePassphraseFunctionProps,
) {
  const {
    wordCount,
    separator,
    wordList,
    capitalize,
    useTitleCase,
    useUpperCase,
    includeNumber,
    randomSeparator,
  } = props;

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

  const checkBool = (val: any, name: string) => {
    if (val !== undefined && typeof val !== 'boolean') {
      throw new Error(`${name} must be a boolean.`);
    }
  };

  checkBool(useTitleCase, 'useTitleCase');
  checkBool(useUpperCase, 'useUpperCase');
  checkBool(includeNumber, 'includeNumber');
  checkBool(randomSeparator, 'randomSeparator');
}
