/** Browser and Node compatible (uses TextEncoder, btoa, atob) */
export function base64UrlEncode(input: string | Uint8Array | Buffer): string {
  const bytes =
    typeof input === 'string'
      ? new TextEncoder().encode(input)
      : input instanceof Uint8Array
        ? input
        : new Uint8Array(input as ArrayLike<number> & { length: number });
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Browser and Node compatible (returns Uint8Array) */
export function base64UrlDecode(input: string): Uint8Array {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  const binary = atob(base64);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

export function base64UrlDecodeToUtf8(input: string): string {
  return new TextDecoder().decode(base64UrlDecode(input));
}
