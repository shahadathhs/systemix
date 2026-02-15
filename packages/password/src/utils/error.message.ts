export const lengthError = {
  invalidLength: 'Invalid length. Length must be a positive number.',
  lengthTooLarge: 'Invalid length. Length must be less than or equal to 50.',
};

export const useNumbersError =
  'Invalid useNumbers. It must be a boolean value.';
export const useUppercaseError =
  'Invalid useUppercase. It must be a boolean value.';
export const useLowercaseError =
  'Invalid useLowercase. It must be a boolean value.';
export const useSymbolsError =
  'Invalid useSymbols. It must be a boolean value.';
export const excludeSimilarCharactersError =
  'Invalid excludeSimilarCharacters. It must be a boolean value.';
export const excludeError = 'Invalid exclude. It must be a string.';

export const countError = {
  invalidCount: 'Invalid count. Count must be a positive number.',
  countTooLarge: 'Invalid count. Count must be less than or equal to 10.',
};

export const unwantedPropsError = (unwantedProps: string[]) => {
  return `Invalid prop(s): ${unwantedProps.join(', ')}. Only the following options are allowed: length, useNumbers, useUppercase, useLowercase, useSymbols, excludeSimilarCharacters, exclude, count.`;
};

export const allOptionsFalseError = 'At least one of the options must be true.';
