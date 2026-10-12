export const limitError = {
  invalidLimit: 'Invalid limit. It must be a positive number.',
  invalidWindowMs: 'Invalid windowMs. It must be a positive number.',
};

export const algorithmError = (allowed: string[]): string => {
  return `Invalid algorithm. Allowed values: ${allowed.join(', ')}.`;
};

export const keyError = 'Invalid key. It must be a non-empty string.';

export const statusCodeError =
  'Invalid statusCode. It must be an integer between 400 and 599.';

export const rateLimitExceededMessage =
  'Too many requests, please try again later.';
