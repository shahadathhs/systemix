import { GeneratePassphrasePropsEnum } from '../enum/props.enum';
import { GeneratePassphraseFunctionProps } from '../types/props.types';
import { passphraseErrors, unwantedPropsError } from '../utils/error.message';

const allValidProps = Object.values(GeneratePassphrasePropsEnum) as string[];

export function generatePassphrasePropValidation(
  props: GeneratePassphraseFunctionProps,
) {
  const propsValue = Object.keys(props);
  const unwantedProps = propsValue.filter(
    (prop) => !allValidProps.includes(prop),
  );
  if (unwantedProps.length > 0) {
    throw new Error(unwantedPropsError(unwantedProps));
  }

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

  const checkBool = (val: unknown, name: string) => {
    if (val !== undefined && typeof val !== 'boolean') {
      throw new Error(`${name} must be a boolean.`);
    }
  };

  checkBool(useTitleCase, 'useTitleCase');
  checkBool(useUpperCase, 'useUpperCase');
  checkBool(includeNumber, 'includeNumber');
  checkBool(randomSeparator, 'randomSeparator');
}
