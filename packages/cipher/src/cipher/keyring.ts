import { base64UrlToBytes, bytesToBase64Url, decrypt, encrypt } from './cipher';
import { MAX_KEY_ID_LENGTH, parseEnvelope } from './envelope';
import { CipherOptions, assertValidKey } from './internals';
import {
  CipherError,
  DecryptionError,
  InvalidPayloadError,
} from '../utils/errors';

export interface KeyringOptions {
  /** Key id → AES key. Keep retired keys here until nothing uses them. */
  keys: Record<string, Uint8Array>;
  /** Id of the key used to encrypt new data. Must exist in `keys`. */
  current: string;
}

export type KeyringCipherOptions = Omit<CipherOptions, 'keyId'>;

export interface Keyring {
  readonly currentKeyId: string;
  encrypt(
    data: string | Uint8Array,
    options?: KeyringCipherOptions,
  ): Promise<Uint8Array>;
  decrypt(
    payload: Uint8Array,
    options?: KeyringCipherOptions,
  ): Promise<Uint8Array>;
  encryptString(
    plaintext: string,
    options?: KeyringCipherOptions,
  ): Promise<string>;
  decryptString(
    payload: string,
    options?: KeyringCipherOptions,
  ): Promise<string>;
  /**
   * Whether a payload should be re-encrypted with the current key: true for
   * legacy payloads, payloads made with an older key, and unreadable input.
   */
  needsRotation(payload: Uint8Array | string): boolean;
}

/**
 * Creates a keyring for key rotation. Encrypts with the current key and
 * stamps its id into the envelope; decrypts with whichever key the envelope
 * names, so retired keys keep working until you re-encrypt.
 *
 * @example
 * const ring = createKeyring({
 *   keys: { k2: newKey, k1: oldKey },
 *   current: 'k2',
 * });
 * const blob = await ring.encryptString('secret'); // stamped "k2"
 * if (ring.needsRotation(oldBlob)) {
 *   store(await ring.encryptString(await ring.decryptString(oldBlob)));
 * }
 */
export function createKeyring(options: KeyringOptions): Keyring {
  const { keys, current } = options ?? ({} as KeyringOptions);
  const ids = Object.keys(keys ?? {});
  if (ids.length === 0) {
    throw new CipherError('Invalid keys. Provide at least one key.');
  }

  const ring = new Map<string, Uint8Array>();
  for (const id of ids) {
    if (
      id.length === 0 ||
      new TextEncoder().encode(id).length > MAX_KEY_ID_LENGTH
    ) {
      throw new CipherError(
        `Invalid key id "${id}". It must be 1–${MAX_KEY_ID_LENGTH} bytes.`,
      );
    }
    assertValidKey(keys[id]);
    ring.set(id, keys[id].slice());
  }
  const currentKey = ring.get(current);
  if (!currentKey) {
    throw new CipherError(`Invalid current key id "${current}": not in keys.`);
  }

  const toPayload = (payload: string): Uint8Array => {
    if (typeof payload !== 'string' || payload.length === 0) {
      throw new InvalidPayloadError();
    }
    try {
      return base64UrlToBytes(payload);
    } catch {
      throw new InvalidPayloadError();
    }
  };

  const decryptBytes = async (
    payload: Uint8Array,
    opts: KeyringCipherOptions = {},
  ): Promise<Uint8Array> => {
    const envelope =
      payload instanceof Uint8Array ? parseEnvelope(payload) : null;
    const known = envelope ? ring.get(envelope.keyId) : undefined;
    if (known) return decrypt(payload, known, opts);

    if (envelope && opts.allowLegacy === false) {
      throw new DecryptionError(`Unknown key id "${envelope.keyId}".`);
    }
    if (opts.allowLegacy === false) {
      throw new InvalidPayloadError(
        'Unrecognized payload. Expected a versioned envelope.',
      );
    }

    // Legacy payloads carry no key id: try the current key first, then the rest.
    const candidates = [
      currentKey,
      ...[...ring].filter(([id]) => id !== current).map(([, key]) => key),
    ];
    let failure: unknown = new DecryptionError();
    for (const key of candidates) {
      try {
        return await decrypt(payload, key, opts);
      } catch (error) {
        if (error instanceof InvalidPayloadError) throw error;
        failure = error;
      }
    }
    throw failure;
  };

  return {
    currentKeyId: current,
    encrypt: (data, opts = {}) =>
      encrypt(data, currentKey, { ...opts, keyId: current }),
    decrypt: decryptBytes,
    encryptString: async (plaintext, opts = {}) =>
      bytesToBase64Url(
        await encrypt(plaintext, currentKey, { ...opts, keyId: current }),
      ),
    decryptString: async (payload, opts = {}) =>
      new TextDecoder().decode(await decryptBytes(toPayload(payload), opts)),
    needsRotation: (payload) => {
      try {
        const bytes =
          typeof payload === 'string' ? base64UrlToBytes(payload) : payload;
        return parseEnvelope(bytes)?.keyId !== current;
      } catch {
        return true;
      }
    },
  };
}
