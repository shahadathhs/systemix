/**
 * Tests for load() – parsing, defaults, required vars, and error handling.
 */
import { createRunner } from '@systemix/runner';
import { src } from './helpers.mjs';
import { load } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  // Legacy format: plain object as source
  assert(
    load({ FOO: { type: 'string' } }, { FOO: 'legacy' }).FOO === 'legacy',
    'legacy source format',
  );

  // Type parsing: string, number, boolean
  assert(
    load({ FOO: { type: 'string', required: true } }, src({ FOO: 'bar' }))
      .FOO === 'bar',
    'string value',
  );
  assert(
    load({ PORT: { type: 'number', default: 3000 } }, src({ PORT: '8080' }))
      .PORT === 8080,
    'number parsing',
  );
  assert(
    load({ DEBUG: { type: 'boolean', default: false } }, src({ DEBUG: 'true' }))
      .DEBUG === true,
    'boolean true',
  );
  assert(
    load({ OFF: { type: 'boolean' } }, src({ OFF: 'false' })).OFF === false,
    'boolean false',
  );
  assert(
    load({ X: { type: 'boolean' } }, src({ X: '1' })).X === true,
    'boolean 1',
  );
  assert(
    load({ X: { type: 'boolean' } }, src({ X: '0' })).X === false,
    'boolean 0',
  );

  // Defaults when var missing or empty
  const defaultEnv = load(
    {
      NODE_ENV: { type: 'string', default: 'development' },
      PORT: { type: 'number', default: 3000 },
    },
    src({}),
  );
  assert(defaultEnv.NODE_ENV === 'development', 'string default');
  assert(defaultEnv.PORT === 3000, 'number default');

  // Optional vars
  assert(
    load({ OPT: { type: 'string' } }, src({})).OPT === undefined,
    'optional undefined',
  );

  // Error cases: required missing, invalid types
  assertThrows(
    () => load({ REQUIRED: { type: 'string', required: true } }, src({})),
    'throws when required missing',
  );
  assertThrows(
    () => load({ X: { type: 'number' } }, src({ X: 'not-a-number' })),
    'throws on invalid number',
  );
  assertThrows(
    () => load({ X: { type: 'boolean' } }, src({ X: 'invalid' })),
    'throws on invalid boolean',
  );
  assert(
    load({ FOO: { type: 'string', default: 'fallback' } }, src({ FOO: '' }))
      .FOO === 'fallback',
    'empty string uses default',
  );
});
