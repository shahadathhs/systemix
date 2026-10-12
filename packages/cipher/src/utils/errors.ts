/**
 * Base error class for all cipher errors.
 */
export class CipherError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CipherError';
  }
}

/**
 * Thrown when decryption fails — wrong key, tampered ciphertext,
 * wrong additional data, or a malformed payload.
 */
export class DecryptionError extends CipherError {
  constructor(
    message = 'Decryption failed. Wrong key, tampered data, or malformed payload.',
  ) {
    super(message);
    this.name = 'DecryptionError';
  }
}

/**
 * Thrown when a key is not a valid AES key (16, 24, or 32 bytes).
 */
export class InvalidKeyError extends CipherError {
  constructor() {
    super('Invalid key. It must be a Uint8Array of 16, 24, or 32 bytes.');
    this.name = 'InvalidKeyError';
  }
}

/**
 * Thrown when an encrypted payload is structurally invalid.
 */
export class InvalidPayloadError extends CipherError {
  constructor(
    message = 'Invalid payload. It must be a Uint8Array with at least an IV and a tag.',
  ) {
    super(message);
    this.name = 'InvalidPayloadError';
  }
}
