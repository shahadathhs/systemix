export const byteLengthError = {
  invalidByteLength: 'Invalid byteLength. Must be a positive number.',
  byteLengthTooLarge: 'Invalid byteLength. Must be less than or equal to 1024.',
};

export const charsetError =
  'Invalid charset. Must be one of: hex, base64, base64url, alphanumeric.';

export const countError = {
  invalidCount: 'Invalid count. Count must be a positive number.',
  countTooLarge: 'Invalid count. Count must be less than or equal to 10.',
};

export const unwantedPropsError = (unwantedProps: string[]) => {
  return `Invalid prop(s): ${unwantedProps.join(', ')}. Only the following options are allowed: byteLength, charset, count.`;
};
