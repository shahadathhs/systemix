export const passphraseErrors = {
  invalidWordCount:
    'Invalid wordCount. It must be a positive number between 1 and 100.',
  emptyWordList: 'Invalid wordList. It must be a non-empty array.',
  invalidSeparator: 'Invalid separator. It must be a string.',
  invalidCapitalize: 'Invalid capitalize. It must be a boolean value.',
};

export const unwantedPropsError = (unwantedProps: string[]) =>
  `Invalid prop(s): ${unwantedProps.join(', ')}. Only the following options are allowed: wordCount, separator, wordList, capitalize, useTitleCase, useUpperCase, includeNumber, randomSeparator.`;
