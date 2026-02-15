import { GeneratePasswordPropsEnum } from '../enum/props.enum';
import { GeneratePasswordFunctionProps } from '../types/props.types';
import {
  allOptionsFalseError,
  countError,
  excludeError,
  excludeSimilarCharactersError,
  lengthError,
  unwantedPropsError,
  useLowercaseError,
  useNumbersError,
  useSymbolsError,
  useUppercaseError,
} from '../utils/error.message';

const allValidProps = Object.values(GeneratePasswordPropsEnum) as string[];

export function generatePasswordPropValidation(
  props: GeneratePasswordFunctionProps,
) {
  const propsValue = Object.keys(props);
  const unwantedProps = propsValue.filter(
    (prop) => !allValidProps.includes(prop),
  );

  if (unwantedProps.length > 0) {
    throw new Error(unwantedPropsError(unwantedProps));
  }

  // * Destructure valid props
  const {
    length,
    useNumbers,
    useUppercase,
    useLowercase,
    useSymbols,
    excludeSimilarCharacters,
    exclude,
    count,
  } = props;

  // * length validation
  if (typeof length !== 'number' || length < 1) {
    throw new Error(lengthError.invalidLength);
  }
  if (length > 50) {
    throw new Error(lengthError.lengthTooLarge);
  }

  // * useNumbers validation
  if (typeof useNumbers !== 'boolean') {
    throw new Error(useNumbersError);
  }

  // * useUppercase validation
  if (typeof useUppercase !== 'boolean') {
    throw new Error(useUppercaseError);
  }

  // * useLowercase validation
  if (typeof useLowercase !== 'boolean') {
    throw new Error(useLowercaseError);
  }

  // * useSymbols validation
  if (typeof useSymbols !== 'boolean') {
    throw new Error(useSymbolsError);
  }

  // * excludeSimilarCharacters validation
  if (typeof excludeSimilarCharacters !== 'boolean') {
    throw new Error(excludeSimilarCharactersError);
  }

  // * exclude validation
  if (typeof exclude !== 'string') {
    throw new Error(excludeError);
  }

  // * count validation
  if (typeof count !== 'number' || count < 1) {
    throw new Error(countError.invalidCount);
  }
  if (count > 10) {
    throw new Error(countError.countTooLarge);
  }

  // * throw error if all boolean props are false (excludeSimilarCharacters is not included)
  if (!useNumbers && !useUppercase && !useLowercase && !useSymbols) {
    throw new Error(allOptionsFalseError);
  }
}
