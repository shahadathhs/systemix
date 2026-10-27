/**
 * Tests for file precedence, strict mode, the .env parser, number/boolean
 * parsing, secret handling and Standard Schema support.
 */
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inspect } from 'node:util';
import { createRunner } from '@systemix/runner';
import { Config, load, parseEnvFile } from '../dist/index.js';

const dir = mkdtempSync(join(tmpdir(), 'systemix-env-'));
const write = (name, body) => {
  const path = join(dir, name);
  writeFileSync(path, body);
  return path;
};

/** A minimal, spec-shaped Standard Schema (no Zod dependency). */
function standard(validate, vendor = 'test') {
  return { '~standard': { version: 1, vendor, validate } };
}
const port = standard((v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 65536
    ? { value: n }
    : { issues: [{ message: `not a port (got ${v})` }] };
});

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  // ── Precedence ──────────────────────────────────────────────────────
  const a = write('a.env', 'HOST=from-a\nONLY_A=a\nMODE=file');
  const b = write('b.env', 'HOST=from-b\nONLY_B=b');
  const schema = {
    HOST: { type: 'string' },
    ONLY_A: { type: 'string' },
    ONLY_B: { type: 'string' },
    MODE: { type: 'string' },
  };
  const env = load(schema, {
    fromFile: [a, b],
    source: { MODE: 'real-env' },
  });
  assert(env.MODE === 'real-env', 'real environment beats .env files');
  assert(env.HOST === 'from-b', 'later file overrides earlier file');
  assert(env.ONLY_A === 'a' && env.ONLY_B === 'b', 'files are merged');
  assert(
    load(schema, { fromFile: a, source: { MODE: undefined } }).MODE === 'file',
    'an undefined source value does not hide the file value',
  );
  assert(
    load(schema, { fromFile: join(dir, 'missing.env'), source: {} }).HOST ===
      undefined,
    'a missing file is skipped',
  );

  // ── strict: unknown keys in files ──────────────────────────────────
  const typo = write('typo.env', 'HOST=x\nDATABSE_URL=oops');
  assertThrows(
    () => load(schema, { fromFile: typo, source: {}, strict: true }),
    'strict rejects an unknown key in a .env file',
  );
  let message = '';
  try {
    load(schema, { fromFile: typo, source: {}, strict: true });
  } catch (e) {
    message = e.message;
  }
  assert(message.includes('DATABSE_URL'), 'strict names the unknown key');
  assert(
    load(schema, { fromFile: typo, source: {}, strict: false }).HOST === 'x',
    'non-strict ignores unknown keys',
  );
  assert(
    load(schema, { source: { UNRELATED: '1' }, strict: true }) !== null,
    'strict does not complain about unrelated real environment variables',
  );

  // ── .env parser ────────────────────────────────────────────────────
  const p = parseEnvFile(
    [
      'PLAIN=value',
      'SPACED = padded value  ',
      'export EXPORTED=yes',
      'INLINE=keep # drop this',
      'FRAGMENT=http://x.test/#anchor',
      'EMPTY=',
      'URL=postgres://u:p@h/db?a=b=c',
      'DQ="has # hash and \\"quotes\\""',
      'ESC="line1\\nline2\\ttab"',
      'KEEPBS="a\\d+b"',
      "SQ='literal \\n # not a comment'",
      'MULTI="first',
      'second"',
      'AFTER=ok',
      'BAD KEY=skipped',
      '=nokey',
      'NOEQUALS',
      '1BAD=skipped',
      '__proto__=polluted',
      '# COMMENTED=1',
      'UNTERMINATED="never closed',
    ].join('\r\n'),
  );
  assert(p.PLAIN === 'value', 'plain value');
  assert(p.SPACED === 'padded value', 'whitespace around = and value trimmed');
  assert(p.EXPORTED === 'yes', 'export prefix');
  assert(p.INLINE === 'keep', 'inline comment stripped');
  assert(p.FRAGMENT === 'http://x.test/#anchor', '# without space is kept');
  assert(p.EMPTY === '', 'empty value');
  assert(p.URL === 'postgres://u:p@h/db?a=b=c', 'value may contain =');
  assert(p.DQ === 'has # hash and "quotes"', 'quoted # and escaped quotes');
  assert(p.ESC === 'line1\nline2\ttab', 'double quotes expand \\n and \\t');
  assert(p.KEEPBS === 'a\\d+b', 'unknown escapes keep the backslash');
  assert(p.SQ === 'literal \\n # not a comment', 'single quotes are literal');
  assert(p.MULTI === 'first\nsecond', 'multi-line double-quoted value');
  assert(p.AFTER === 'ok', 'parsing continues after a multi-line value');
  assert(
    !('BAD KEY' in p) && !('' in p) && !('NOEQUALS' in p) && !('1BAD' in p),
    'invalid keys and lines are skipped',
  );
  assert(
    Object.getPrototypeOf(p) === Object.prototype && p.polluted === undefined,
    '__proto__ key is ignored',
  );
  assert(!('COMMENTED' in p), 'commented line skipped');
  assert(
    p.UNTERMINATED === '"never closed',
    'an unterminated quote falls back to the literal line',
  );

  // ── Number / boolean parsing ───────────────────────────────────────
  const num = (raw) =>
    load({ N: { type: 'number' } }, { source: { N: raw } }).N;
  assert(num('42') === 42 && num('-5') === -5, 'integers');
  assert(
    num('.5') === 0.5 && num('5.') === 5 && num('1e3') === 1000,
    'decimals',
  );
  assert(num(' 7 ') === 7, 'surrounding whitespace is trimmed');
  for (const bad of ['  ', '0x10', '0b1', 'Infinity', '1_000', 'NaN', '12px']) {
    assertThrows(
      () => num(bad),
      `rejects number "${bad.trim() || 'whitespace'}"`,
    );
  }
  const bool = (raw) =>
    load({ B: { type: 'boolean' } }, { source: { B: raw } }).B;
  assert(bool('on') === true && bool('OFF') === false, 'on/off');
  assert(bool('Yes') === true && bool('0') === false, 'yes / 0');
  assertThrows(() => bool('maybe'), 'rejects other boolean text');

  // ── Secrets ────────────────────────────────────────────────────────
  const secrets = load(
    {
      API_KEY: { type: 'string', required: true, secret: true },
      PORT: { type: 'number', default: 3000 },
    },
    { source: { API_KEY: 'sk-super-secret' } },
  );
  assert(secrets.API_KEY === 'sk-super-secret', 'secret is readable');
  assert(
    !JSON.stringify(secrets).includes('sk-super-secret'),
    'JSON.stringify does not leak a secret',
  );
  assert(
    !inspect(secrets).includes('sk-super-secret'),
    'console.log / util.inspect does not leak a secret',
  );
  assert(
    !Object.keys(secrets).includes('API_KEY') && !('API_KEY' in { ...secrets }),
    'secret is not enumerable or spreadable',
  );
  assert(Object.keys(secrets).includes('PORT'), 'non-secrets stay enumerable');
  assert(secrets.toSafeLog().API_KEY === '***', 'toSafeLog masks secrets');
  assert(secrets.toSafeLog().PORT === 3000, 'toSafeLog keeps non-secrets');
  assert(
    !Object.keys(secrets).includes('toSafeLog'),
    'toSafeLog is not enumerable',
  );
  assert(Object.isFrozen(secrets), 'result is frozen');
  assertThrows(() => {
    secrets.PORT = 1;
  }, 'result cannot be mutated');
  assert(
    Config.fromEnv(
      { K: { type: 'string', secret: true } },
      { source: { K: 'cfg-secret' } },
    ).toSafeLog().K === '***',
    'Config.toSafeLog masks secrets',
  );

  let err = '';
  try {
    load(
      { N: { type: 'number', secret: true } },
      { source: { N: 'sk-live-not-a-number' } },
    );
  } catch (e) {
    err = e.message;
  }
  assert(err.includes('N: invalid value'), 'secret parse error is generic');
  assert(!err.includes('sk-live'), 'a secret value never appears in an error');
  try {
    load({ N: { type: 'number' } }, { source: { N: 'not-a-number' } });
  } catch (e) {
    err = e.message;
  }
  assert(err.includes('not-a-number'), 'non-secret errors keep the value');

  // ── Reports every problem at once ──────────────────────────────────
  try {
    load(
      {
        A: { type: 'string', required: true },
        B: { type: 'number', min: 10 },
      },
      { source: { B: '1' } },
    );
  } catch (e) {
    err = e.message;
  }
  assert(
    err.includes('Missing required env var: A') &&
      err.includes('B: must be >= 10'),
    'all validation errors are reported together',
  );

  // ── Standard Schema ────────────────────────────────────────────────
  const std = load(
    {
      PORT: { schema: port },
      OPT: { schema: port },
      WITH_DEFAULT: { schema: port, default: 8080 },
    },
    { source: { PORT: '3000' } },
  );
  assert(std.PORT === 3000, 'Standard Schema output is used as the value');
  assert(std.OPT === undefined, 'optional Standard Schema var may be unset');
  assert(std.WITH_DEFAULT === 8080, 'Standard Schema var default');

  try {
    load({ PORT: { schema: port } }, { source: { PORT: '99999' } });
  } catch (e) {
    err = e.message;
  }
  assert(err.includes('PORT: not a port'), 'issues become error messages');
  try {
    load(
      { PORT: { schema: port, secret: true } },
      { source: { PORT: '99999' } },
    );
  } catch (e) {
    err = e.message;
  }
  assert(
    err.includes('PORT: invalid value') && !err.includes('99999'),
    'secret Standard Schema failures do not echo the value',
  );
  assertThrows(
    () =>
      load(
        { X: { schema: standard(async (v) => ({ value: v })) } },
        { source: { X: 'a' } },
      ),
    'async validators are rejected with a clear error',
  );
  assertThrows(
    () => load({ X: { schema: port, required: true } }, { source: {} }),
    'required Standard Schema var must be set',
  );
  assert(
    load(
      { X: { schema: standard((v) => ({ value: v.toUpperCase() })) } },
      { source: { X: 'abc' } },
    ).X === 'ABC',
    'transforming validators work',
  );
});
