/**
 * Tests for fromFile, strict mode, and secret masking (toSafeLog).
 */
import { createRunner } from '@systemix/test';
import { src } from './helpers.mjs';
import { load } from '../dist/index.js';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const { run, getCounts } = createRunner(({ assert }) => {
  // fromFile: load vars from .env file
  const envPath = resolve(process.cwd(), '.env.test.systemix');
  try {
    writeFileSync(envPath, 'FROM_FILE=loaded\nPORT=9999\n');
    const fileEnv = load(
      { FROM_FILE: { type: 'string' }, PORT: { type: 'number' } },
      { fromFile: '.env.test.systemix' },
    );
    assert(fileEnv.FROM_FILE === 'loaded', 'fromFile loads vars');
    assert(fileEnv.PORT === 9999, 'fromFile parses number');
  } finally {
    if (existsSync(envPath)) unlinkSync(envPath);
  }

  // strict: only schema keys in result
  const strictEnv = load(
    { FOO: { type: 'string', default: 'x' } },
    { source: { FOO: 'bar', EXTRA: 'ignored' }, strict: true },
  );
  assert(strictEnv.FOO === 'bar', 'strict: schema var present');
  assert(!('EXTRA' in strictEnv), 'strict: extra var not in result');

  // secret: masked in toSafeLog()
  const secretEnv = load(
    {
      API_KEY: { type: 'string', secret: true },
      PORT: { type: 'number', secret: false },
    },
    src({ API_KEY: 'sk-123', PORT: '3000' }),
  );
  const safe = secretEnv.toSafeLog();
  assert(safe.API_KEY === '***', 'secret masked');
  assert(safe.PORT === 3000, 'non-secret unchanged');
});
