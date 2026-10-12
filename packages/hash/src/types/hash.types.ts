/**
 * Supported password hashing algorithms.
 */
export type HashAlgorithm = 'pbkdf2' | 'scrypt';

/**
 * Supported digest functions for PBKDF2 (Web Crypto SHA family).
 */
export type HashDigest = 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface HashPasswordOptions {
  /**
   * Hashing algorithm to use.
   * @default 'pbkdf2'
   */
  algorithm?: HashAlgorithm;

  /**
   * Digest function for PBKDF2.
   * @default 'SHA-256'
   */
  digest?: HashDigest;

  /**
   * PBKDF2 iteration count. Higher is slower and more secure.
   * OWASP recommends at least 210,000 for PBKDF2-HMAC-SHA256.
   * @default 210_000
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
   * @default 16_384
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
  salt: Uint8Array;
  hash: Uint8Array;

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
