export class SignedTokenError extends Error {
  override name = 'SignedTokenError';
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, SignedTokenError.prototype);
  }
}

export class TokenExpiredError extends SignedTokenError {
  override name = 'TokenExpiredError';
  constructor(
    message: string,
    public readonly expiredAt?: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

export class NotBeforeError extends SignedTokenError {
  override name = 'NotBeforeError';
  constructor(
    message: string,
    public readonly date?: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, NotBeforeError.prototype);
  }
}

export class InvalidSignatureError extends SignedTokenError {
  override name = 'InvalidSignatureError';
  constructor(message = 'Invalid token signature') {
    super(message);
    Object.setPrototypeOf(this, InvalidSignatureError.prototype);
  }
}

export class InvalidTokenError extends SignedTokenError {
  override name = 'InvalidTokenError';
  constructor(message = 'Invalid or malformed token') {
    super(message);
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

export class AudienceMismatchError extends SignedTokenError {
  override name = 'AudienceMismatchError';
  constructor(message = 'Audience claim does not match') {
    super(message);
    Object.setPrototypeOf(this, AudienceMismatchError.prototype);
  }
}

export class IssuerMismatchError extends SignedTokenError {
  override name = 'IssuerMismatchError';
  constructor(message = 'Issuer claim does not match') {
    super(message);
    Object.setPrototypeOf(this, IssuerMismatchError.prototype);
  }
}
