import {
  HashAlgorithm,
  HashDigest,
  HashPasswordOptions,
  ParsedHash,
} from '../types/hash.types';
import {
  ARGON2_VERSION,
  DEFAULT_ARGON2_MEMORY,
  DEFAULT_ARGON2_PARALLELISM,
  DEFAULT_ARGON2_PASSES,
  argon2DeriveBits,
} from './argon2';
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
import { base64UrlToBytes, bytesEqual } from '../utils/encode';
import {
  algorithmError,
  encodedHashError,
  keyLengthError,
  passwordError,
  saltError,
} from '../utils/error.message';

const ALLOWED_ALGORITHMS: HashAlgorithm[] = ['argon2id', 'scrypt', 'pbkdf2'];

const PHC_PBKDF2_ID: Record<HashDigest, string> = {
  'SHA-256': 'pbkdf2-sha256',
  'SHA-384': 'pbkdf2-sha384',
  'SHA-512': 'pbkdf2-sha512',
};
const PHC_PBKDF2_DIGEST = Object.fromEntries(
  Object.entries(PHC_PBKDF2_ID).map(([digest, id]) => [id, digest]),
) as Record<string, HashDigest>;

const LEGACY_PBKDF2_SEGMENTS = 5;
const LEGACY_SCRYPT_SEGMENTS = 6;

const MIN_SALT_LENGTH = 8;
const MAX_ENCODED_BYTES = 1024;
const MIN_STORED_HASH_LENGTH = 16;

/**
 * Validates common inputs shared by hashPassword and verifyPassword.
 * Algorithm-specific cost parameters are validated (and bounded) by the
 * derive functions themselves.
 */
function validateInputs(password: string, options: HashPasswordOptions): void {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error(passwordError.invalidPassword);
  }
  const {
    algorithm = 'argon2id',
    keyLength = DEFAULT_KEY_LENGTH,
    salt,
  } = options;

  if (!ALLOWED_ALGORITHMS.includes(algorithm)) {
    throw new Error(algorithmError(ALLOWED_ALGORITHMS));
  }
  if (!Number.isInteger(keyLength) || keyLength <= 0) {
    throw new Error(keyLengthError.invalidKeyLength);
  }
  if (keyLength > 1024) {
    throw new Error(keyLengthError.keyLengthTooLarge);
  }
  if (
    salt &&
    (!(salt instanceof Uint8Array) || salt.length < MIN_SALT_LENGTH)
  ) {
    throw new Error(saltError.invalidSalt);
  }
}

/** Standard base64 without padding, as used by the PHC string format. */
function bytesToPhcBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/=+$/, '');
}

function phcBase64ToBytes(value: string): Uint8Array {
  if (!/^[A-Za-z0-9+/]*$/.test(value) || value.length % 4 === 1) {
    throw new Error(encodedHashError.invalidFormat);
  }
  const binary = atob(value + '='.repeat((4 - (value.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Strict non-negative integer parsing: rejects '', '1e9', '0x10', ' 5'. */
function parseStrictInt(value: string | undefined): number {
  if (value === undefined || !/^\d{1,10}$/.test(value)) {
    throw new Error(encodedHashError.invalidFormat);
  }
  return Number(value);
}

function parsePhcParams(segment: string | undefined): Map<string, string> {
  const params = new Map<string, string>();
  if (!segment) throw new Error(encodedHashError.invalidFormat);
  for (const pair of segment.split(',')) {
    const [key, value, ...rest] = pair.split('=');
    if (!key || value === undefined || rest.length > 0 || params.has(key)) {
      throw new Error(encodedHashError.invalidFormat);
    }
    params.set(key, value);
  }
  return params;
}

function requireParams(params: Map<string, string>, names: string[]): number[] {
  if (params.size !== names.length) {
    throw new Error(encodedHashError.invalidFormat);
  }
  return names.map((name) => parseStrictInt(params.get(name)));
}

function finalizeParsed(parsed: ParsedHash): ParsedHash {
  if (
    parsed.salt.length < MIN_SALT_LENGTH ||
    parsed.salt.length > MAX_ENCODED_BYTES ||
    parsed.hash.length < MIN_STORED_HASH_LENGTH ||
    parsed.hash.length > MAX_ENCODED_BYTES
  ) {
    throw new Error(encodedHashError.invalidFormat);
  }
  return parsed;
}

function parsePhc(encodedHash: string): ParsedHash {
  const segments = encodedHash.split('$');
  // ['', id, ('v=19',)? params, salt, hash]
  const id = segments[1];

  if (id === 'argon2id') {
    if (segments.length !== 6 || segments[2] !== `v=${ARGON2_VERSION}`) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [memoryCost, timeCost, parallelism] = requireParams(
      parsePhcParams(segments[3]),
      ['m', 't', 'p'],
    );
    return finalizeParsed({
      algorithm: 'argon2id',
      format: 'phc',
      memoryCost,
      timeCost,
      parallelism,
      salt: phcBase64ToBytes(segments[4]),
      hash: phcBase64ToBytes(segments[5]),
    });
  }

  if (id === 'scrypt') {
    if (segments.length !== 5) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [ln, blockSizeFactor, parallelizationFactor] = requireParams(
      parsePhcParams(segments[2]),
      ['ln', 'r', 'p'],
    );
    if (ln > 30) throw new Error(encodedHashError.invalidFormat);
    return finalizeParsed({
      algorithm: 'scrypt',
      format: 'phc',
      costFactor: 2 ** ln,
      blockSizeFactor,
      parallelizationFactor,
      salt: phcBase64ToBytes(segments[3]),
      hash: phcBase64ToBytes(segments[4]),
    });
  }

  if (id !== undefined && id in PHC_PBKDF2_DIGEST) {
    if (segments.length !== 5) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [iterations] = requireParams(parsePhcParams(segments[2]), ['i']);
    return finalizeParsed({
      algorithm: 'pbkdf2',
      format: 'phc',
      digest: PHC_PBKDF2_DIGEST[id],
      iterations,
      salt: phcBase64ToBytes(segments[3]),
      hash: phcBase64ToBytes(segments[4]),
    });
  }

  throw new Error(encodedHashError.unknownAlgorithm);
}

/** Parses the `pbkdf2$...` / `scrypt$...` format written by 0.1.x. */
function parseLegacy(encodedHash: string): ParsedHash {
  const segments = encodedHash.split('$');
  const algorithm = segments[0];

  if (algorithm === 'pbkdf2') {
    if (segments.length !== LEGACY_PBKDF2_SEGMENTS) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [, digest, iterations, salt, hash] = segments;
    return finalizeParsed({
      algorithm,
      format: 'legacy',
      digest: digest as HashDigest,
      iterations: parseStrictInt(iterations),
      salt: base64UrlToBytes(salt),
      hash: base64UrlToBytes(hash),
    });
  }

  if (algorithm === 'scrypt') {
    if (segments.length !== LEGACY_SCRYPT_SEGMENTS) {
      throw new Error(encodedHashError.invalidFormat);
    }
    const [, costFactor, blockSizeFactor, parallelizationFactor, salt, hash] =
      segments;
    return finalizeParsed({
      algorithm,
      format: 'legacy',
      costFactor: parseStrictInt(costFactor),
      blockSizeFactor: parseStrictInt(blockSizeFactor),
      parallelizationFactor: parseStrictInt(parallelizationFactor),
      salt: base64UrlToBytes(salt),
      hash: base64UrlToBytes(hash),
    });
  }

  throw new Error(encodedHashError.unknownAlgorithm);
}

/**
 * Parses an encoded hash string. Accepts the PHC format written by
 * hashPassword (`$argon2id$v=19$m=…,t=…,p=…$salt$hash`) and the legacy
 * `pbkdf2$…` / `scrypt$…` format from @systemix/hash 0.1.x.
 * Throws on malformed input.
 */
export function parseEncodedHash(encodedHash: string): ParsedHash {
  if (typeof encodedHash !== 'string' || encodedHash.length === 0) {
    throw new Error(encodedHashError.invalidFormat);
  }
  try {
    return encodedHash.startsWith('$')
      ? parsePhc(encodedHash)
      : parseLegacy(encodedHash);
  } catch (error) {
    // base64 decoding errors (atob) and the like → uniform error
    if (
      error instanceof Error &&
      (error.message === encodedHashError.invalidFormat ||
        error.message === encodedHashError.unknownAlgorithm)
    ) {
      throw error;
    }
    throw new Error(encodedHashError.invalidFormat);
  }
}

/**
 * Hashes a password and returns a self-describing PHC string safe for
 * database storage. The output embeds algorithm, parameters, salt, and hash.
 *
 * @example
 * const encoded = await hashPassword('hunter2');
 * // "$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>"
 */
export async function hashPassword(
  password: string,
  options: HashPasswordOptions = {},
): Promise<string> {
  validateInputs(password, options);

  const {
    algorithm = 'argon2id',
    keyLength = DEFAULT_KEY_LENGTH,
    salt = generateSalt(),
  } = options;

  if (algorithm === 'argon2id') {
    const {
      memoryCost = DEFAULT_ARGON2_MEMORY,
      timeCost = DEFAULT_ARGON2_PASSES,
      parallelism = DEFAULT_ARGON2_PARALLELISM,
    } = options;
    const hash = await argon2DeriveBits(password, salt, {
      memoryCost,
      timeCost,
      parallelism,
      keyLength,
    });
    return `$argon2id$v=${ARGON2_VERSION}$m=${memoryCost},t=${timeCost},p=${parallelism}$${bytesToPhcBase64(salt)}$${bytesToPhcBase64(hash)}`;
  }

  if (algorithm === 'scrypt') {
    const {
      costFactor = DEFAULT_SCRYPT_COST,
      blockSizeFactor = DEFAULT_SCRYPT_BLOCK_SIZE,
      parallelizationFactor = DEFAULT_SCRYPT_PARALLELIZATION,
    } = options;
    const hash = await scryptDeriveBits(password, salt, {
      costFactor,
      blockSizeFactor,
      parallelizationFactor,
      keyLength,
    });
    return `$scrypt$ln=${Math.log2(costFactor)},r=${blockSizeFactor},p=${parallelizationFactor}$${bytesToPhcBase64(salt)}$${bytesToPhcBase64(hash)}`;
  }

  const { digest = DEFAULT_DIGEST, iterations = DEFAULT_PBKDF2_ITERATIONS } =
    options;
  const hash = await pbkdf2DeriveBits(password, salt, {
    digest,
    iterations,
    keyLength,
  });
  return `$${PHC_PBKDF2_ID[digest]}$i=${iterations}$${bytesToPhcBase64(salt)}$${bytesToPhcBase64(hash)}`;
}

/**
 * Verifies a password against an encoded hash from hashPassword (PHC or
 * legacy format). Comparison is performed in constant time. Malformed hashes
 * and hashes with out-of-bounds cost parameters return false instead of
 * throwing.
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
    const keyLength = parsed.hash.length;
    let derived: Uint8Array;
    if (parsed.algorithm === 'argon2id') {
      derived = await argon2DeriveBits(password, parsed.salt, {
        memoryCost: parsed.memoryCost,
        timeCost: parsed.timeCost,
        parallelism: parsed.parallelism,
        keyLength,
      });
    } else if (parsed.algorithm === 'scrypt') {
      derived = await scryptDeriveBits(password, parsed.salt, {
        costFactor: parsed.costFactor,
        blockSizeFactor: parsed.blockSizeFactor,
        parallelizationFactor: parsed.parallelizationFactor,
        keyLength,
      });
    } else {
      derived = await pbkdf2DeriveBits(password, parsed.salt, {
        digest: parsed.digest,
        iterations: parsed.iterations,
        keyLength,
      });
    }
    return bytesEqual(derived, parsed.hash);
  } catch {
    return false;
  }
}

/**
 * Whether a stored hash should be re-hashed with current parameters. Call it
 * after a successful verifyPassword and, if true, store a fresh hashPassword
 * result. Returns true for unparseable hashes, legacy-format hashes, a
 * different algorithm, or any cost parameter weaker than the target.
 *
 * The target is the same as hashPassword: pass the same options you hash
 * with (defaults: Argon2id, 19 MiB, 2 passes, 1 lane).
 */
export function needsRehash(
  encodedHash: string,
  options: HashPasswordOptions = {},
): boolean {
  let parsed: ParsedHash;
  try {
    parsed = parseEncodedHash(encodedHash);
  } catch {
    return true;
  }

  const { algorithm = 'argon2id', keyLength = DEFAULT_KEY_LENGTH } = options;
  if (parsed.format === 'legacy' || parsed.algorithm !== algorithm) {
    return true;
  }
  if (parsed.hash.length < keyLength) return true;

  if (parsed.algorithm === 'argon2id') {
    const {
      memoryCost = DEFAULT_ARGON2_MEMORY,
      timeCost = DEFAULT_ARGON2_PASSES,
      parallelism = DEFAULT_ARGON2_PARALLELISM,
    } = options;
    return (
      (parsed.memoryCost ?? 0) < memoryCost ||
      (parsed.timeCost ?? 0) < timeCost ||
      parsed.parallelism !== parallelism
    );
  }

  if (parsed.algorithm === 'scrypt') {
    const {
      costFactor = DEFAULT_SCRYPT_COST,
      blockSizeFactor = DEFAULT_SCRYPT_BLOCK_SIZE,
      parallelizationFactor = DEFAULT_SCRYPT_PARALLELIZATION,
    } = options;
    return (
      (parsed.costFactor ?? 0) < costFactor ||
      parsed.blockSizeFactor !== blockSizeFactor ||
      parsed.parallelizationFactor !== parallelizationFactor
    );
  }

  const { digest = DEFAULT_DIGEST, iterations = DEFAULT_PBKDF2_ITERATIONS } =
    options;
  return parsed.digest !== digest || (parsed.iterations ?? 0) < iterations;
}
