/**
 * Supported password hashing algorithms.
 */
export type HashAlgorithm = 'argon2id' | 'scrypt' | 'pbkdf2';

/**
 * Supported digest functions for PBKDF2 (Web Crypto SHA family).
 */
export type HashDigest = 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface HashPasswordOptions {
  /**
   * Hashing algorithm to use. Argon2id is the OWASP first choice; use
   * 'pbkdf2' only where FIPS-140 compliance is required.
   * @default 'argon2id'
   */
  algorithm?: HashAlgorithm;

  /**
   * Argon2id memory cost in KiB.
   * @default 19_456 (19 MiB, OWASP minimum)
   */
  memoryCost?: number;

  /**
   * Argon2id time cost (number of passes).
   * @default 2
   */
  timeCost?: number;

  /**
   * Argon2id parallelism (lanes).
   * @default 1
   */
  parallelism?: number;

  /**
   * Digest function for PBKDF2.
   * @default 'SHA-256'
   */
  digest?: HashDigest;

  /**
   * PBKDF2 iteration count. Higher is slower and more secure.
   * OWASP recommends at least 600,000 for PBKDF2-HMAC-SHA256.
   * @default 600_000
   */
  iterations?: number;

  /**
   * Length of the derived key in bytes.
   * @default 32
   */
  keyLength?: number;

  /**
   * Custom salt. If omitted, a random 16-byte salt is generated.
   */
  salt?: Uint8Array;

  /**
   * scrypt CPU/memory cost factor (N). Must be a power of 2.
   * OWASP recommends at least 2^17 with r=8, p=1.
   * @default 131_072 (2^17)
   */
  costFactor?: number;

  /**
   * scrypt block size factor (r).
   * @default 8
   */
  blockSizeFactor?: number;

  /**
   * scrypt parallelization factor (p).
   * @default 1
   */
  parallelizationFactor?: number;
}

export interface PbkdfDeriveOptions {
  digest?: HashDigest;
  iterations?: number;
  keyLength?: number;
}

export interface Argon2DeriveOptions {
  /** Memory cost in KiB. */
  memoryCost?: number;
  /** Number of passes. */
  timeCost?: number;
  /** Degree of parallelism. */
  parallelism?: number;
  keyLength?: number;
}

export interface ScryptDeriveOptions {
  costFactor?: number;
  blockSizeFactor?: number;
  parallelizationFactor?: number;
  keyLength?: number;
}

/**
 * Parsed representation of an encoded hash string produced by `hashPassword`.
 */
export interface ParsedHash {
  algorithm: HashAlgorithm;
  /**
   * 'phc' for the standard `$id$params$salt$hash` format, 'legacy' for the
   * `pbkdf2$...` / `scrypt$...` format written by @systemix/hash 0.1.x.
   */
  format: 'phc' | 'legacy';
  salt: Uint8Array;
  hash: Uint8Array;

  /** Present for argon2id: memory cost in KiB. */
  memoryCost?: number;

  /** Present for argon2id: number of passes. */
  timeCost?: number;

  /** Present for argon2id: parallelism. */
  parallelism?: number;

  /** Present for pbkdf2: digest name. */
  digest?: HashDigest;

  /** Present for pbkdf2: iteration count. */
  iterations?: number;

  /** Present for scrypt: cost factor (N). */
  costFactor?: number;

  /** Present for scrypt: block size factor (r). */
  blockSizeFactor?: number;

  /** Present for scrypt: parallelization factor (p). */
  parallelizationFactor?: number;
}
