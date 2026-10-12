import { ScryptDeriveOptions } from '../types/hash.types';
import {
  scryptUnavailableError,
  scryptParamsError,
  keyLengthError,
} from '../utils/error.message';
import { passwordToBytes } from '../utils/encode';

export const DEFAULT_SCRYPT_COST = 16_384;
export const DEFAULT_SCRYPT_BLOCK_SIZE = 8;
export const DEFAULT_SCRYPT_PARALLELIZATION = 1;

/**
 * Whether scrypt is supported in the current runtime (Node.js only).
 */
export function isScryptSupported(): boolean {
  return (
    typeof process !== 'undefined' &&
    !!process.versions &&
    !!process.versions.node
  );
}

/**
 * Derives a key from a password using scrypt. Node.js only — scrypt is not
 * part of the Web Crypto API. Use pbkdf2DeriveBits in browser environments.
 */
export async function scryptDeriveBits(
  password: string,
  salt: Uint8Array,
  options: ScryptDeriveOptions = {},
): Promise<Uint8Array> {
  const {
    costFactor = DEFAULT_SCRYPT_COST,
    blockSizeFactor = DEFAULT_SCRYPT_BLOCK_SIZE,
    parallelizationFactor = DEFAULT_SCRYPT_PARALLELIZATION,
    keyLength = 64,
  } = options;

  if (!isScryptSupported()) {
    throw new Error(scryptUnavailableError);
  }
  if (
    !Number.isInteger(costFactor) ||
    costFactor < 2 ||
    (costFactor & (costFactor - 1)) !== 0
  ) {
    throw new Error(scryptParamsError.invalidCostFactor);
  }
  if (costFactor < 1024) {
    throw new Error(scryptParamsError.costFactorTooLow);
  }
  if (!Number.isInteger(blockSizeFactor) || blockSizeFactor <= 0) {
    throw new Error(scryptParamsError.invalidBlockSizeFactor);
  }
  if (!Number.isInteger(parallelizationFactor) || parallelizationFactor <= 0) {
    throw new Error(scryptParamsError.invalidParallelizationFactor);
  }
  if (!Number.isInteger(keyLength) || keyLength <= 0) {
    throw new Error(keyLengthError.invalidKeyLength);
  }

  // Dynamic import keeps node:crypto out of browser bundles.
  const nodeCrypto = await import('node:crypto');
  const derived = nodeCrypto.scryptSync(
    passwordToBytes(password),
    salt,
    keyLength,
    {
      N: costFactor,
      r: blockSizeFactor,
      p: parallelizationFactor,
    },
  );

  return new Uint8Array(derived);
}
