/**
 * Detects if running in Node.js (vs browser).
 * Uses globalThis to avoid bundler issues with `process`.
 */
export function isNode(): boolean {
  return (
    typeof globalThis.process !== 'undefined' &&
    typeof globalThis.process.versions === 'object' &&
    typeof globalThis.process.versions.node === 'string'
  );
}
