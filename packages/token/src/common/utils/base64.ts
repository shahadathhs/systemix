export function base64UrlEncode(input: string | Uint8Array | Buffer): string {
  const buf =
    typeof input === 'string'
      ? Buffer.from(input, 'utf8')
      : Buffer.isBuffer(input)
        ? input
        : Buffer.from(input);
  return buf.toString('base64url');
}

export function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

export function base64UrlDecodeToUtf8(input: string): string {
  return base64UrlDecode(input).toString('utf8');
}
