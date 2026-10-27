import * as nodeCrypto from 'node:crypto';
import { Argon2DeriveOptions } from '../types/hash.types';
import {
  argon2ParamsError,
  argon2UnavailableError,
  keyLengthError,
} from '../utils/error.message';
import { passwordToBytes } from '../utils/encode';

/** Argon2 version implemented by Node (0x13), the only one in PHC strings. */
export const ARGON2_VERSION = 19;

/** OWASP minimum: 19 MiB, 2 passes, 1 lane. */
export const DEFAULT_ARGON2_MEMORY = 19_456;
export const DEFAULT_ARGON2_PASSES = 2;
export const DEFAULT_ARGON2_PARALLELISM = 1;

/** Upper bounds stop untrusted encoded hashes from forcing unbounded work. */
export const MAX_ARGON2_MEMORY = 262_144;
export const MAX_ARGON2_PASSES = 10;
export const MAX_ARGON2_PARALLELISM = 16;

const MIN_KEY_LENGTH = 4;
const MAX_KEY_LENGTH = 1024;

/**
 * Whether Argon2 is supported in the current runtime (Node.js 24.7+).
 */
export function isArgon2Supported(): boolean {
  return typeof nodeCrypto.argon2 === 'function';
}

/**
 * Derives a key from a password using Argon2id (RFC 9106) via node:crypto.
 * The work runs on the libuv threadpool, so it does not block the event loop.
 */
export async function argon2DeriveBits(
  password: string,
  salt: Uint8Array,
  options: Argon2DeriveOptions = {},
): Promise<Uint8Array> {
  const {
    memoryCost = DEFAULT_ARGON2_MEMORY,
    timeCost = DEFAULT_ARGON2_PASSES,
    parallelism = DEFAULT_ARGON2_PARALLELISM,
    keyLength = 32,
  } = options;

  if (!isArgon2Supported()) {
    throw new Error(argon2UnavailableError);
  }
  if (!(salt instanceof Uint8Array) || salt.length < 8) {
    throw new Error(argon2ParamsError.invalidSalt);
  }
  if (!Number.isInteger(parallelism) || parallelism <= 0) {
    throw new Error(argon2ParamsError.invalidParallelism);
  }
  if (parallelism > MAX_ARGON2_PARALLELISM) {
    throw new Error(argon2ParamsError.parallelismTooHigh);
  }
  if (!Number.isInteger(memoryCost) || memoryCost <= 0) {
    throw new Error(argon2ParamsError.invalidMemoryCost);
  }
  if (memoryCost < 8 * parallelism) {
    throw new Error(argon2ParamsError.memoryCostTooLow);
  }
  if (memoryCost > MAX_ARGON2_MEMORY) {
    throw new Error(argon2ParamsError.memoryCostTooHigh);
  }
  if (!Number.isInteger(timeCost) || timeCost <= 0) {
    throw new Error(argon2ParamsError.invalidTimeCost);
  }
  if (timeCost > MAX_ARGON2_PASSES) {
    throw new Error(argon2ParamsError.timeCostTooHigh);
  }
  if (!Number.isInteger(keyLength) || keyLength < MIN_KEY_LENGTH) {
    throw new Error(keyLengthError.invalidKeyLength);
  }
  if (keyLength > MAX_KEY_LENGTH) {
    throw new Error(keyLengthError.keyLengthTooLarge);
  }

  const derived = await new Promise<Uint8Array>((resolve, reject) => {
    nodeCrypto.argon2(
      'argon2id',
      {
        message: passwordToBytes(password),
        nonce: salt,
        parallelism,
        tagLength: keyLength,
        memory: memoryCost,
        passes: timeCost,
      },
      (err, key) => (err ? reject(err) : resolve(new Uint8Array(key))),
    );
  });

  return derived;
}
