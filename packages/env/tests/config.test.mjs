/**
 * Tests for Config – fromEnv, get, getOrThrow, has, toSafeLog.
 */
import { createRunner } from '@systemix/runner';
import { src } from './helpers.mjs';
import { Config } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
  const config = Config.fromEnv(
    { PORT: { type: 'number', default: 3000 }, FOO: { type: 'string' } },
    src({ PORT: '8080' }),
  );

  assert(config.get('PORT') === 8080, 'get');
  assert(config.get('FOO') === undefined, 'get undefined');
  assert(config.get('PORT', 9999) === 8080, 'get with default (value exists)');
  assert(config.get('FOO', 'fallback') === 'fallback', 'get with default');
  assert(config.getOrThrow('PORT') === 8080, 'getOrThrow');
  assert(config.has('PORT'), 'has');
  assert(!config.has('FOO'), 'has false');
  assertThrows(() => config.getOrThrow('FOO'), 'getOrThrow throws');
  assert(config.toSafeLog().PORT === 8080, 'toSafeLog');
});
