/**
 * Normalizes a client IP into a rate-limit key.
 *
 * - IPv4 addresses are returned as is.
 * - IPv4-mapped IPv6 (`::ffff:1.2.3.4`) becomes the IPv4 address.
 * - Other IPv6 addresses are reduced to their /64 prefix (`2001:db8:1:2::/64`):
 *   a single subscriber normally owns a whole /64, so keying on the full
 *   address would give one client 2^64 separate allowances.
 * - Anything unparseable is returned trimmed and lowercased, capped at 128
 *   characters.
 */
export function normalizeIp(ip: string): string {
  let value = ip.trim().toLowerCase();
  const zone = value.indexOf('%');
  if (zone !== -1) value = value.slice(0, zone);
  if (!value.includes(':')) return value.slice(0, 128);

  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(value);
  if (mapped) return mapped[1];

  const groups = expandIpv6(value);
  if (!groups) return value.slice(0, 128);
  return `${groups.slice(0, 4).join(':')}::/64`;
}

/** Expands an IPv6 literal to 8 lowercase hex groups without leading zeros. */
function expandIpv6(value: string): string[] | null {
  let text = value;
  // Embedded IPv4 tail (e.g. 64:ff9b::1.2.3.4) → two hex groups.
  const tail = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(text);
  if (tail) {
    const [a, b, c, d] = tail.slice(1).map(Number);
    if ([a, b, c, d].some((n) => n > 255)) return null;
    text =
      text.slice(0, tail.index) +
      `${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }

  const halves = text.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const rest = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const missing = 8 - head.length - rest.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null;

  const all = [
    ...head,
    ...Array<string>(halves.length === 2 ? missing : 0).fill('0'),
    ...rest,
  ];
  if (all.length !== 8) return null;
  const out: string[] = [];
  for (const group of all) {
    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
    out.push(group.replace(/^0+(?=.)/, ''));
  }
  return out;
}
