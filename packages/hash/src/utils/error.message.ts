export const passwordError = {
  invalidPassword: 'Invalid password. It must be a non-empty string.',
};

export const saltError = {
  invalidSalt: 'Invalid salt. It must be a Uint8Array with at least 8 bytes.',
};

export const iterationsError = {
  invalidIterations: 'Invalid iterations. It must be a positive number.',
  iterationsTooLow:
    'Invalid iterations. It must be at least 1,000 for security.',
};

export const keyLengthError = {
  invalidKeyLength: 'Invalid keyLength. It must be a positive number.',
  keyLengthTooLarge:
    'Invalid keyLength. It must be less than or equal to 1024 bytes.',
};

export const algorithmError = (allowed: string[]): string => {
  return `Invalid algorithm. Allowed values: ${allowed.join(', ')}.`;
};

export const digestError = (allowed: string[]): string => {
  return `Invalid digest. Allowed values: ${allowed.join(', ')}.`;
};

export const scryptParamsError = {
  invalidCostFactor: 'Invalid costFactor. It must be a power of 2.',
  costFactorTooLow: 'Invalid costFactor. It must be at least 1024.',
  invalidBlockSizeFactor:
    'Invalid blockSizeFactor. It must be a positive number.',
  invalidParallelizationFactor:
    'Invalid parallelizationFactor. It must be a positive number.',
};

export const encodedHashError = {
  invalidFormat:
    'Invalid encoded hash. Expected format: algorithm$params$saltB64url$hashB64url.',
  unknownAlgorithm: 'Invalid encoded hash. Unknown algorithm.',
};

export const scryptUnavailableError =
  'scrypt is only available in Node.js. Use pbkdf2 for browser environments.';
