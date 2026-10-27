export const sizeError = {
  invalidSize: 'Invalid size. It must be a positive number.',
  sizeTooLarge: 'Invalid size. It must be less than or equal to 1024.',
};

export const alphabetError = {
  invalidAlphabet: 'Invalid alphabet. It must be a string.',
  alphabetTooSmall: 'Invalid alphabet. It must contain at least 2 characters.',
  alphabetTooLarge:
    'Invalid alphabet. It must contain no more than 256 characters.',
  duplicateAlphabetChars:
    'Invalid alphabet. It must not contain duplicate characters.',
};

export const ulidError = {
  invalidTimestamp: 'Invalid timestamp. It must be a non-negative number.',
  timestampTooLarge:
    'Invalid timestamp. It must be less than or equal to 2^48 - 1.',
  notUlid: 'Invalid ULID. It must be a 26-character Crockford Base32 string.',
};

export const ulidOverflowError =
  'Monotonic ULID overflow: the random part is exhausted for this millisecond.';

export const uuidError = {
  invalidVersion: 'Invalid version. It must be a number between 1 and 8.',
  invalidTimestamp: 'Invalid timestamp. It must be a non-negative integer.',
  timestampTooLarge:
    'Invalid timestamp. It must be less than or equal to 2^48 - 1.',
  notV7: 'Invalid UUID. It must be a version 7 UUID.',
};
