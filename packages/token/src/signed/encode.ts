import type { SignedPayload } from './types';

/**
 * Encode a payload into a signed compact token.
 * @internal Placeholder for implementation.
 */
export function encodeSigned(
  _payload: SignedPayload,
  _secret: string,
  _options?: { algorithm?: 'HS256' },
): string {
  throw new Error(
    'encodeSigned is not yet implemented. Coming in a future release.',
  );
}
