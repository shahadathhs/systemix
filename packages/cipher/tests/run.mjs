#!/usr/bin/env node
/**
 * Test runner for @systemix/cipher.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as cipherSuite from './cipher.test.mjs';
import * as keySuite from './key.test.mjs';
import * as envelopeSuite from './envelope.test.mjs';

const suites = [
  { name: 'cipher', ...cipherSuite },
  { name: 'key', ...keySuite },
  { name: 'envelope', ...envelopeSuite },
];

await runSuites(suites, { packageName: '@systemix/cipher' });
