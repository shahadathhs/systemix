const crypto = globalThis.crypto;
if (!crypto) {
  throw new Error('Crypto not available. Requires Node 18+ or browser.');
}

export function getRandomInt(max: number): number {
  if (max <= 1) return 0;
  const array = new Uint32Array(1);
  const range = Math.floor(0xffffffff / max) * max;
  let randomValue;
  do {
    crypto.getRandomValues(array);
    randomValue = array[0];
  } while (randomValue >= range);
  return randomValue % max;
}

export function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}
