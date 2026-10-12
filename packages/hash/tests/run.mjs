#!/usr/bin/env node
/**
 * Test runner for @systemix/hash.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as pbkdf2Suite from './pbkdf2.test.mjs';
import * as hashPasswordSuite from './hash-password.test.mjs';

const suites = [
  { name: 'pbkdf2', ...pbkdf2Suite },
  { name: 'hash-password', ...hashPasswordSuite },
];

await runSuites(suites, { packageName: '@systemix/hash' });
