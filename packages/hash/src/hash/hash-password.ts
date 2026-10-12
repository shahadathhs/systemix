import {
  HashAlgorithm,
  HashPasswordOptions,
  ParsedHash,
} from '../types/hash.types';
import {
  DEFAULT_DIGEST,
  DEFAULT_KEY_LENGTH,
  DEFAULT_PBKDF2_ITERATIONS,
  generateSalt,
  pbkdf2DeriveBits,
} from './pbkdf2';
import {
  DEFAULT_SCRYPT_BLOCK_SIZE,
  DEFAULT_SCRYPT_COST,
  DEFAULT_SCRYPT_PARALLELIZATION,
  scryptDeriveBits,
} from './scrypt';
import {
  bytesToBase64Url,
  base64UrlToBytes,
  bytesEqual,
} from '../utils/encode';
import {
  algorithmError,
  digestError,
  encodedHashError,
  iterationsError,
  keyLengthError,
  passwordError,
  saltError,
} from '../utils/error.message';

const ALLOWED_ALGORITHMS: HashAlgorithm[] = ['pbkdf2', 'scrypt'];
const ALLOWED_DIGESTS = ['SHA-256', 'SHA-384', 'SHA-512'];

const PBKDF2_SEGMENTS = 5;
const SCRYPT_SEGMENTS = 6;

/**
 * Validates common inputs shared by hashPassword and verifyPassword.
 */
function validateInputs(password: string, options: HashPasswordOptions): void {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error(passwordError.invalidPassword);
  }
  const {
    algorithm = 'pbkdf2',
    digest = DEFAULT_DIGEST,
    iterations = DEFAULT_PBKDF2_ITERATIONS,
    keyLength = DEFAULT_KEY_LENGTH,
    salt,
  } = options;

  if (!ALLOWED_ALGORITHMS.includes(algorithm)) {
    throw new Error(algorithmError(ALLOWED_ALGORITHMS));
  }
  if (algorithm === 'pbkdf2') {
    if (!ALLOWED_DIGESTS.includes(digest)) {
      throw new Error(digestError(ALLOWED_DIGESTS));
    }
    if (!Number.isInteger(iterations) || iterations <= 0) {
      throw new Error(iterationsError.invalidIterations);
    }
  }
  if (!Number.isInteger(keyLength) || keyLength <= 0) {
    throw new Error(keyLengthError.invalidKeyLength);
  }
  if (keyLength > 1024) {
    throw new Error(keyLengthError.keyLengthTooLarge);
  }
  if (salt && (!(salt instanceof Uint8Array) || salt.length < 8)) {
    throw new Error(saltError.invalidSalt);
  }
}

/**
 * Hashes a password and returns a self-describing encoded string safe for
 * database storage. The output embeds algorithm, parameters, salt, and hash.
 *
 * @example
 * const encoded = await hashPassword('hunter2');
 * // "pbkdf2$SHA-256$210000$<saltB64url>$<hashB64url>"
 */
export async function hashPassword(
  password: string,
  options: HashPasswordOptions = {},
): Promise<string> {
  validateInputs(password, options);

  const {
    algorithm = 'pbkdf2',
    digest = DEFAULT_DIGEST,
    iterations = DEFAULT_PBKDF2_ITERATIONS,
    keyLength = DEFAULT_KEY_LENGTH,
    salt = generateSalt(),
    costFactor = DEFAULT_SCRYPT_COST,
    blockSizeFactor = DEFAULT_SCRYPT_BLOCK_SIZE,
    parallelizationFactor = DEFAULT_SCRYPT_PARALLELIZATION,
  } = options;

  if (algorithm === 'scrypt') {
    const hash = await scryptDeriveBits(password, salt, {
      costFactor,
      blockSizeFactor,
      parallelizationFactor,
      keyLength,
    });
    return [
      algorithm,
      costFactor,
      blockSizeFactor,
      parallelizationFactor,
      bytesToBase64Url(salt),
      bytesToBase64Url(hash),
    ].join('$');
  }

  const hash = await pbkdf2DeriveBits(password, salt, {
    digest,
    iterations,
    keyLength,
  });
  return [
    algorithm,
    digest,
    iterations,
    bytesToBase64Url(salt),
    bytesToBase64Url(hash),
  ].join('$');
}

/**
 * Parses an encoded hash string produced by hashPassword.
 */
export function parseEncodedHash(encodedHash: string): ParsedHash {
  if (typeof encodedHash !== 'string' || encodedHash.length === 0) {
    throw new Error(encodedHashError.invalidFormat);
  }

  const segments = encodedHash.split('$');
  const algorithm = segments[0];

  if (algorithm === 'pbkdf2') {
    if (segments.length !== PBKDF2_SEGMENTS) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [, digest, iterations, salt, hash] = segments;
    return {
      algorithm,
      digest: digest as ParsedHash['digest'],
      iterations: Number(iterations),
      salt: base64UrlToBytes(salt),
      hash: base64UrlToBytes(hash),
    };
  }

  if (algorithm === 'scrypt') {
    if (segments.length !== SCRYPT_SEGMENTS) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [, costFactor, blockSizeFactor, parallelizationFactor, salt, hash] =
      segments;
    return {
      algorithm,
      costFactor: Number(costFactor),
      blockSizeFactor: Number(blockSizeFactor),
      parallelizationFactor: Number(parallelizationFactor),
      salt: base64UrlToBytes(salt),
      hash: base64UrlToBytes(hash),
    };
  }

  throw new Error(encodedHashError.unknownAlgorithm);
}

/**
 * Verifies a password against an encoded hash from hashPassword.
 * Comparison is performed in constant time. Always returns a boolean —
 * malformed hashes return false instead of throwing.
 */
export async function verifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error(passwordError.invalidPassword);
  }

  let parsed: ParsedHash;
  try {
    parsed = parseEncodedHash(encodedHash);
  } catch {
    return false;
  }

  try {
    const derived =
      parsed.algorithm === 'scrypt'
        ? await scryptDeriveBits(password, parsed.salt, {
            costFactor: parsed.costFactor,
            blockSizeFactor: parsed.blockSizeFactor,
            parallelizationFactor: parsed.parallelizationFactor,
            keyLength: parsed.hash.length,
          })
        : await pbkdf2DeriveBits(password, parsed.salt, {
            digest: parsed.digest,
            iterations: parsed.iterations,
            keyLength: parsed.hash.length,
          });

    return bytesEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}
