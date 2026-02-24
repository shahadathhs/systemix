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
    minNumbers,
    minUppercase,
    minLowercase,
    minSymbols,
    customNumbers,
    customUppercase,
    customLowercase,
    customSymbols,
  } = props;

  // * length validation (allow undefined for default)
  if (length !== undefined) {
    if (typeof length !== 'number' || length < 1) {
      throw new Error(lengthError.invalidLength);
    }
    if (length > 100) {
      throw new Error(lengthError.lengthTooLarge);
    }
  }

  // * min requirements validation
  const checkMin = (val: unknown, name: string) => {
    if (val !== undefined && (typeof val !== 'number' || val < 0)) {
      throw new Error(`${name} must be a non-negative number.`);
    }
  };

  checkMin(minNumbers, 'minNumbers');
  checkMin(minUppercase, 'minUppercase');
  checkMin(minLowercase, 'minLowercase');
  checkMin(minSymbols, 'minSymbols');

  const totalMin =
    (minNumbers ?? 0) +
    (minUppercase ?? 0) +
    (minLowercase ?? 0) +
    (minSymbols ?? 0);
  const len = length ?? 12;

  if (totalMin > len) {
    throw new Error(
      'Total minimum character requirements exceed requested password length.',
    );
  }

  // * custom charsets validation
  const checkString = (val: unknown, name: string) => {
    if (val !== undefined && typeof val !== 'string') {
      throw new Error(`${name} must be a string.`);
    }
  };

  checkString(customNumbers, 'customNumbers');
  checkString(customUppercase, 'customUppercase');
  checkString(customLowercase, 'customLowercase');
  checkString(customSymbols, 'customSymbols');

  // * useNumbers validation (allow undefined for defaults)
  if (useNumbers !== undefined && typeof useNumbers !== 'boolean') {
    throw new Error(useNumbersError);
  }

  // * useUppercase validation
  if (useUppercase !== undefined && typeof useUppercase !== 'boolean') {
    throw new Error(useUppercaseError);
  }

  // * useLowercase validation
  if (useLowercase !== undefined && typeof useLowercase !== 'boolean') {
    throw new Error(useLowercaseError);
  }

  // * useSymbols validation
  if (useSymbols !== undefined && typeof useSymbols !== 'boolean') {
    throw new Error(useSymbolsError);
  }

  // * excludeSimilarCharacters validation
  if (
    excludeSimilarCharacters !== undefined &&
    typeof excludeSimilarCharacters !== 'boolean'
  ) {
    throw new Error(excludeSimilarCharactersError);
  }

  // * exclude validation (allow undefined)
  if (exclude !== undefined && typeof exclude !== 'string') {
    throw new Error(excludeError);
  }

  // * count validation (allow undefined)
  if (count !== undefined && (typeof count !== 'number' || count < 1)) {
    throw new Error(countError.invalidCount);
  }
  if (count !== undefined && count > 10) {
    throw new Error(countError.countTooLarge);
  }

  // * throw error if all boolean props are false (excludeSimilarCharacters is not included)
  const uN = useNumbers ?? true;
  const uU = useUppercase ?? true;
  const uL = useLowercase ?? true;
  const uS = useSymbols ?? false;
  if (!uN && !uU && !uL && !uS) {
    throw new Error(allOptionsFalseError);
  }
}
