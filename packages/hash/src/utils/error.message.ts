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
  iterationsTooHigh:
    'Invalid iterations. It must be less than or equal to 10,000,000.',
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
  memoryTooHigh:
    'Invalid scrypt parameters. 128 * costFactor * blockSizeFactor must be at most 256 MiB.',
  costFactorTooHigh:
    'Invalid costFactor. It must be less than or equal to 1,048,576.',
  blockSizeFactorTooHigh:
    'Invalid blockSizeFactor. It must be less than or equal to 32.',
  parallelizationFactorTooHigh:
    'Invalid parallelizationFactor. It must be less than or equal to 16.',
};

export const argon2ParamsError = {
  invalidMemoryCost: 'Invalid memoryCost. It must be a positive integer (KiB).',
  memoryCostTooLow:
    'Invalid memoryCost. It must be at least 8 KiB per lane (8 * parallelism).',
  memoryCostTooHigh:
    'Invalid memoryCost. It must be less than or equal to 262,144 KiB (256 MiB).',
  invalidTimeCost: 'Invalid timeCost. It must be a positive integer.',
  timeCostTooHigh: 'Invalid timeCost. It must be less than or equal to 10.',
  invalidParallelism: 'Invalid parallelism. It must be a positive integer.',
  parallelismTooHigh:
    'Invalid parallelism. It must be less than or equal to 16.',
  invalidSalt: 'Invalid salt. It must be a Uint8Array with at least 8 bytes.',
};

export const argon2UnavailableError =
  'Argon2 requires Node.js 24.7 or newer (crypto.argon2).';

export const encodedHashError = {
  invalidFormat:
    'Invalid encoded hash. Expected PHC format: $algorithm$params$salt$hash.',
  unknownAlgorithm: 'Invalid encoded hash. Unknown algorithm.',
};

export const scryptUnavailableError =
  'scrypt is only available in Node.js. Use pbkdf2 for browser environments.';
