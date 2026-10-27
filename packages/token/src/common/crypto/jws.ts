import {
  constants,
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign as nodeSign,
  verify as nodeVerify,
  type KeyObject,
} from 'node:crypto';
import type {
  AsymmetricAlgorithm,
  HmacAlgorithm,
  SignedAlgorithm,
} from '../enums';
import { isHmac } from '../enums';
import { InvalidKeyError } from '../errors';
import { bytesEqual } from './compare';

/**
 * Key material: an HMAC secret (string or bytes), or for asymmetric
 * algorithms a PEM string or a node:crypto KeyObject.
 */
export type KeyInput = string | Uint8Array | KeyObject;

const HMAC_HASH: Record<HmacAlgorithm, string> = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
};

/** RFC 7518 §3.2: the HMAC key must be at least as long as the hash output. */
export const MIN_HMAC_KEY_BYTES: Record<HmacAlgorithm, number> = {
  HS256: 32,
  HS384: 48,
  HS512: 64,
};

const SHA: Record<Exclude<AsymmetricAlgorithm, 'EdDSA'>, string> = {
  RS256: 'sha256',
  RS384: 'sha384',
  RS512: 'sha512',
  PS256: 'sha256',
  PS384: 'sha384',
  PS512: 'sha512',
  ES256: 'sha256',
  ES384: 'sha384',
  ES512: 'sha512',
};

const EC_CURVE = {
  ES256: 'prime256v1',
  ES384: 'secp384r1',
  ES512: 'secp521r1',
} as const;

export const MIN_RSA_MODULUS_BITS = 2048;

function hmacSecret(alg: HmacAlgorithm, key: KeyInput): Uint8Array {
  if (typeof key !== 'string' && !(key instanceof Uint8Array)) {
    throw new InvalidKeyError(`${alg} requires a string or byte secret.`);
  }
  if (typeof key === 'string' && /-----BEGIN [A-Z ]+-----/.test(key)) {
    // A public key used as an HMAC secret is the classic RS256 → HS256
    // downgrade (RFC 8725 §3.1).
    throw new InvalidKeyError(
      `${alg} cannot use a PEM key as its secret. Use an asymmetric algorithm or a random secret.`,
    );
  }
  const bytes = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  if (bytes.length < MIN_HMAC_KEY_BYTES[alg]) {
    throw new InvalidKeyError(
      `${alg} secret must be at least ${MIN_HMAC_KEY_BYTES[alg]} bytes (got ${bytes.length}).`,
    );
  }
  return bytes;
}

function toKeyObject(
  alg: AsymmetricAlgorithm,
  key: KeyInput,
  use: 'sign' | 'verify',
): KeyObject {
  if (key instanceof Uint8Array) {
    throw new InvalidKeyError(`${alg} requires a PEM string or KeyObject.`);
  }
  let keyObject: KeyObject;
  try {
    if (typeof key === 'string') {
      keyObject = use === 'sign' ? createPrivateKey(key) : createPublicKey(key);
    } else if (use === 'verify' && key.type === 'private') {
      keyObject = createPublicKey(key);
    } else {
      keyObject = key;
    }
  } catch {
    throw new InvalidKeyError(
      `Invalid ${use === 'sign' ? 'private' : 'public'} key for ${alg}.`,
    );
  }
  if (use === 'sign' && keyObject.type !== 'private') {
    throw new InvalidKeyError(`${alg} signing requires a private key.`);
  }

  const type = keyObject.asymmetricKeyType;
  if (alg === 'EdDSA') {
    if (type !== 'ed25519' && type !== 'ed448') {
      throw new InvalidKeyError('EdDSA requires an Ed25519 or Ed448 key.');
    }
  } else if (alg.startsWith('ES')) {
    const curve = keyObject.asymmetricKeyDetails?.namedCurve;
    if (type !== 'ec' || curve !== EC_CURVE[alg as keyof typeof EC_CURVE]) {
      throw new InvalidKeyError(
        `${alg} requires an EC key on curve ${EC_CURVE[alg as keyof typeof EC_CURVE]}.`,
      );
    }
  } else {
    if (type !== 'rsa' && type !== 'rsa-pss') {
      throw new InvalidKeyError(`${alg} requires an RSA key.`);
    }
    const bits = keyObject.asymmetricKeyDetails?.modulusLength ?? 0;
    if (bits < MIN_RSA_MODULUS_BITS) {
      throw new InvalidKeyError(
        `RSA keys must be at least ${MIN_RSA_MODULUS_BITS} bits (got ${bits}).`,
      );
    }
  }
  return keyObject;
}

function algorithmOptions(alg: Exclude<AsymmetricAlgorithm, 'EdDSA'>) {
  if (alg.startsWith('ES')) return { dsaEncoding: 'ieee-p1363' as const };
  if (alg.startsWith('PS')) {
    return {
      padding: constants.RSA_PKCS1_PSS_PADDING,
      saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
    };
  }
  return {};
}

/** Signs the JWS signing input. Returns the raw signature bytes. */
export function signBytes(
  alg: SignedAlgorithm,
  signingInput: string,
  key: KeyInput,
): Uint8Array {
  if (isHmac(alg)) {
    return new Uint8Array(
      createHmac(HMAC_HASH[alg], hmacSecret(alg, key))
        .update(signingInput, 'utf8')
        .digest(),
    );
  }
  const keyObject = toKeyObject(alg, key, 'sign');
  const data = Buffer.from(signingInput, 'utf8');
  if (alg === 'EdDSA') return new Uint8Array(nodeSign(null, data, keyObject));
  return new Uint8Array(
    nodeSign(SHA[alg], data, { key: keyObject, ...algorithmOptions(alg) }),
  );
}

/** Verifies a raw signature. Key problems throw; a bad signature returns false. */
export function verifyBytes(
  alg: SignedAlgorithm,
  signingInput: string,
  signature: Uint8Array,
  key: KeyInput,
): boolean {
  if (isHmac(alg)) {
    const expected = createHmac(HMAC_HASH[alg], hmacSecret(alg, key))
      .update(signingInput, 'utf8')
      .digest();
    return bytesEqual(new Uint8Array(expected), signature);
  }
  const keyObject = toKeyObject(alg, key, 'verify');
  const data = Buffer.from(signingInput, 'utf8');
  try {
    if (alg === 'EdDSA') return nodeVerify(null, data, keyObject, signature);
    return nodeVerify(
      SHA[alg],
      data,
      { key: keyObject, ...algorithmOptions(alg) },
      signature,
    );
  } catch {
    return false;
  }
}
