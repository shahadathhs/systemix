#!/usr/bin/env node
/**
 * Test runner for @systemix/passphrase.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as basicSuite from './basic.test.mjs';
import * as edgeSuite from './edge.test.mjs';
import * as formattingSuite from './formatting.test.mjs';
import * as entropySuite from './entropy.test.mjs';
import * as errorsSuite from './errors.test.mjs';
import * as wordlistSuite from './wordlist.test.mjs';

const suites = [
  { name: 'basic', ...basicSuite },
  { name: 'edge', ...edgeSuite },
  { name: 'formatting', ...formattingSuite },
  { name: 'entropy', ...entropySuite },
  { name: 'errors', ...errorsSuite },
  { name: 'wordlist', ...wordlistSuite },
];

await runSuites(suites, { packageName: '@systemix/passphrase' });
