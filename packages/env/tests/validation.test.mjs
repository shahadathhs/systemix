/**
 * Tests for load() validation – min/max, oneOf, regex, and batch errors.
 */
import { createRunner, src } from './_runner.mjs';
import { load } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  console.log('\n  validation');

  // Number min/max
  assertThrows(
    () =>
      load(
        { PORT: { type: 'number', min: 1, max: 65535 } },
        src({ PORT: '0' }),
      ),
    'throws when number below min',
  );
  assertThrows(
    () =>
      load(
        { PORT: { type: 'number', min: 1, max: 65535 } },
        src({ PORT: '70000' }),
      ),
    'throws when number above max',
  );
  assert(
    load(
      { PORT: { type: 'number', min: 1, max: 65535 } },
      src({ PORT: '3000' }),
    ).PORT === 3000,
    'min/max valid',
  );

  // String oneOf
  assertThrows(
    () =>
      load(
        { NODE_ENV: { type: 'string', oneOf: ['development', 'production'] } },
        src({ NODE_ENV: 'staging' }),
      ),
    'throws when string not in oneOf',
  );
  assert(
    load(
      { NODE_ENV: { type: 'string', oneOf: ['dev', 'prod'] } },
      src({ NODE_ENV: 'prod' }),
    ).NODE_ENV === 'prod',
    'oneOf valid',
  );

  // String regex
  assertThrows(
    () =>
      load(
        { URL: { type: 'string', regex: /^https?:\/\// } },
        src({ URL: 'ftp://x.com' }),
      ),
    'throws when string fails regex',
  );
  assert(
    load(
      { URL: { type: 'string', regex: /^https:\/\// } },
      src({ URL: 'https://x.com' }),
    ).URL === 'https://x.com',
    'regex valid',
  );

  // Batch errors: multiple failures in one load
  try {
    load(
      { A: { type: 'string', required: true }, B: { type: 'number', min: 0 } },
      src({ B: '-1' }),
    );
    assert(false, 'batch errors thrown');
  } catch (e) {
    assert(e.message.includes('Env validation failed'), 'batch error format');
    assert(
      e.message.includes('Missing required') && e.message.includes('A'),
      'batch includes missing A',
    );
    assert(
      e.message.includes('must be >=') && e.message.includes('B'),
      'batch includes B min error',
    );
  }
});
