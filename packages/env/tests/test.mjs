#!/usr/bin/env node
/**
 * Tests for @systemix/env.
 * Run: pnpm test (builds first, then runs tests)
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadEnv, parseEnvFile } from '../dist/index.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    failed++;
    console.error(`  ✗ ${message} (expected throw)`);
  } catch {
    passed++;
    console.log(`  ✓ ${message}`);
  }
}

console.log('\n📦 @systemix/env\n');

const src = (obj) => ({ source: obj });

// Legacy: loadEnv(schema, source) - backward compat
assert(loadEnv({ FOO: { type: 'string' } }, { FOO: 'legacy' }).FOO === 'legacy', 'legacy source format');

// String
const strEnv = loadEnv(
  { FOO: { type: 'string', required: true } },
  src({ FOO: 'bar' }),
);
assert(strEnv.FOO === 'bar', 'string value');

// Number
const numEnv = loadEnv(
  { PORT: { type: 'number', default: 3000 } },
  src({ PORT: '8080' }),
);
assert(numEnv.PORT === 8080, 'number parsing');

// Boolean
const boolEnv = loadEnv(
  { DEBUG: { type: 'boolean', default: false } },
  src({ DEBUG: 'true' }),
);
assert(boolEnv.DEBUG === true, 'boolean true');

const boolEnv2 = loadEnv(
  { OFF: { type: 'boolean' } },
  src({ OFF: 'false' }),
);
assert(boolEnv2.OFF === false, 'boolean false');

assert(loadEnv({ X: { type: 'boolean' } }, src({ X: '1' })).X === true, 'boolean 1');
assert(loadEnv({ X: { type: 'boolean' } }, src({ X: '0' })).X === false, 'boolean 0');

// Defaults
const defaultEnv = loadEnv(
  {
    NODE_ENV: { type: 'string', default: 'development' },
    PORT: { type: 'number', default: 3000 },
  },
  src({}),
);
assert(defaultEnv.NODE_ENV === 'development', 'string default');
assert(defaultEnv.PORT === 3000, 'number default');

// Optional (no default)
const optEnv = loadEnv({ OPT: { type: 'string' } }, src({}));
assert(optEnv.OPT === undefined, 'optional undefined');

// Required missing
assertThrows(
  () => loadEnv({ REQUIRED: { type: 'string', required: true } }, src({})),
  'throws when required var missing',
);

// Invalid number
assertThrows(
  () => loadEnv({ X: { type: 'number' } }, src({ X: 'not-a-number' })),
  'throws on invalid number',
);

// Invalid boolean
assertThrows(
  () => loadEnv({ X: { type: 'boolean' } }, src({ X: 'invalid' })),
  'throws on invalid boolean',
);

// Empty string treated as missing
const emptyEnv = loadEnv(
  { FOO: { type: 'string', default: 'fallback' } },
  src({ FOO: '' }),
);
assert(emptyEnv.FOO === 'fallback', 'empty string uses default');

// Validation rules: min/max
assertThrows(
  () => loadEnv({ PORT: { type: 'number', min: 1, max: 65535 } }, src({ PORT: '0' })),
  'throws when number below min',
);
assertThrows(
  () => loadEnv({ PORT: { type: 'number', min: 1, max: 65535 } }, src({ PORT: '70000' })),
  'throws when number above max',
);
assert(loadEnv({ PORT: { type: 'number', min: 1, max: 65535 } }, src({ PORT: '3000' })).PORT === 3000, 'min/max valid');

// Validation rules: oneOf
assertThrows(
  () => loadEnv({ NODE_ENV: { type: 'string', oneOf: ['development', 'production'] } }, src({ NODE_ENV: 'staging' })),
  'throws when string not in oneOf',
);
assert(loadEnv({ NODE_ENV: { type: 'string', oneOf: ['dev', 'prod'] } }, src({ NODE_ENV: 'prod' })).NODE_ENV === 'prod', 'oneOf valid');

// Validation rules: regex
assertThrows(
  () => loadEnv({ URL: { type: 'string', regex: /^https?:\/\// } }, src({ URL: 'ftp://x.com' })),
  'throws when string fails regex',
);
assert(loadEnv({ URL: { type: 'string', regex: /^https:\/\// } }, src({ URL: 'https://x.com' })).URL === 'https://x.com', 'regex valid');

// Batch error reporting
try {
  loadEnv(
    {
      A: { type: 'string', required: true },
      B: { type: 'number', min: 0 },
    },
    src({ B: '-1' }),
  );
  failed++;
  console.error('  ✗ batch errors (expected throw)');
} catch (e) {
  const msg = e.message;
  assert(msg.includes('Missing required') && msg.includes('A'), 'batch includes missing A');
  assert(msg.includes('must be >=') && msg.includes('B'), 'batch includes B min error');
  passed++;
  console.log('  ✓ batch error reporting');
}

// Secret masking
const secretEnv = loadEnv(
  {
    API_KEY: { type: 'string', secret: true },
    PORT: { type: 'number', secret: false },
  },
  src({ API_KEY: 'sk-123', PORT: '3000' }),
);
const safe = secretEnv.toSafeLog();
assert(safe.API_KEY === '***', 'secret masked');
assert(safe.PORT === 3000, 'non-secret unchanged');

// Strict mode
const strictEnv = loadEnv(
  { FOO: { type: 'string', default: 'x' } },
  { source: { FOO: 'bar', EXTRA: 'ignored' }, strict: true },
);
assert(strictEnv.FOO === 'bar', 'strict: schema var present');
assert(!('EXTRA' in strictEnv), 'strict: extra var not in result');

// parseEnvFile
const parsed = parseEnvFile('FOO=bar\n# comment\nBAR=123\n');
assert(parsed.FOO === 'bar', 'parseEnvFile FOO');
assert(parsed.BAR === '123', 'parseEnvFile BAR');
assert(!parsed['# comment'], 'parseEnvFile skips comments');

// fromFile
const tmpDir = process.cwd();
const envPath = resolve(tmpDir, '.env.test.systemix');
try {
  writeFileSync(envPath, 'FROM_FILE=loaded\nPORT=9999\n');
  const fileEnv = loadEnv(
    { FROM_FILE: { type: 'string' }, PORT: { type: 'number' } },
    { fromFile: '.env.test.systemix' },
  );
  assert(fileEnv.FROM_FILE === 'loaded', 'fromFile loads vars');
  assert(fileEnv.PORT === 9999, 'fromFile parses number');
} finally {
  if (existsSync(envPath)) unlinkSync(envPath);
}

console.log(`\n✅ ${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
