import { ScryptDeriveOptions } from '../types/hash.types';
import {
  scryptUnavailableError,
  scryptParamsError,
  keyLengthError,
} from '../utils/error.message';
import { passwordToBytes } from '../utils/encode';
import { MAX_KEY_LENGTH } from './pbkdf2';

export const DEFAULT_SCRYPT_COST = 131_072;
export const DEFAULT_SCRYPT_BLOCK_SIZE = 8;
export const DEFAULT_SCRYPT_PARALLELIZATION = 1;

/** Upper bounds stop untrusted encoded hashes from forcing unbounded work. */
export const MAX_SCRYPT_COST = 1_048_576;
export const MAX_SCRYPT_BLOCK_SIZE = 32;
export const MAX_SCRYPT_PARALLELIZATION = 16;
/** Cap on 128 * N * r (bytes), the memory scrypt needs. */
export const MAX_SCRYPT_MEMORY = 256 * 1024 * 1024;

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
  if (costFactor > MAX_SCRYPT_COST) {
    throw new Error(scryptParamsError.costFactorTooHigh);
  }
  if (!Number.isInteger(blockSizeFactor) || blockSizeFactor <= 0) {
    throw new Error(scryptParamsError.invalidBlockSizeFactor);
  }
  if (blockSizeFactor > MAX_SCRYPT_BLOCK_SIZE) {
    throw new Error(scryptParamsError.blockSizeFactorTooHigh);
  }
  if (!Number.isInteger(parallelizationFactor) || parallelizationFactor <= 0) {
    throw new Error(scryptParamsError.invalidParallelizationFactor);
  }
  if (parallelizationFactor > MAX_SCRYPT_PARALLELIZATION) {
    throw new Error(scryptParamsError.parallelizationFactorTooHigh);
  }
  if (128 * costFactor * blockSizeFactor > MAX_SCRYPT_MEMORY) {
    throw new Error(scryptParamsError.memoryTooHigh);
  }
  if (!Number.isInteger(keyLength) || keyLength <= 0) {
    throw new Error(keyLengthError.invalidKeyLength);
  }
  if (keyLength > MAX_KEY_LENGTH) {
    throw new Error(keyLengthError.keyLengthTooLarge);
  }

  // Dynamic import keeps node:crypto out of browser bundles.
  const nodeCrypto = await import('node:crypto');
  // Async scrypt runs on the libuv threadpool instead of blocking the event loop.
  const derived = await new Promise<Buffer>((resolve, reject) => {
    nodeCrypto.scrypt(
      passwordToBytes(password),
      salt,
      keyLength,
      {
        N: costFactor,
        r: blockSizeFactor,
        p: parallelizationFactor,
        // Node's default (32 MiB) is below OWASP's N=2^17; allow headroom
        // over the 128 * N * r bytes scrypt needs. Bounded by MAX_SCRYPT_MEMORY.
        maxmem: 256 * costFactor * blockSizeFactor,
      },
      (err, key) => (err ? reject(err) : resolve(key)),
    );
  });

  return new Uint8Array(derived);
}
