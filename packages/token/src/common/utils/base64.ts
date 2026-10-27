const BASE64URL = /^[A-Za-z0-9_-]*$/;

export function base64UrlEncode(input: string | Uint8Array): string {
  return Buffer.from(input).toString('base64url');
}

/**
 * Strict base64url decoding (RFC 7515 §2): URL-safe alphabet only, no padding,
 * no whitespace. Throws on anything else.
 */
export function base64UrlDecode(input: string): Uint8Array {
  if (
    typeof input !== 'string' ||
    !BASE64URL.test(input) ||
    input.length % 4 === 1
  ) {
    throw new Error('Invalid base64url');
  }
  return new Uint8Array(Buffer.from(input, 'base64url'));
}

export function base64UrlDecodeToUtf8(input: string): string {
  return new TextDecoder('utf-8', { fatal: true }).decode(
    base64UrlDecode(input),
  );
}
