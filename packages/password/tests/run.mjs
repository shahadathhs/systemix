#!/usr/bin/env node
/**
 * Test runner for @systemix/password.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as basicSuite from './basic.test.mjs';
import * as edgeSuite from './edge.test.mjs';
import * as entropySuite from './entropy.test.mjs';
import * as errorsSuite from './errors.test.mjs';
import * as countSuite from './count.test.mjs';

const suites = [
  { name: 'basic', ...basicSuite },
  { name: 'edge', ...edgeSuite },
  { name: 'entropy', ...entropySuite },
  { name: 'errors', ...errorsSuite },
  { name: 'count', ...countSuite },
];

await runSuites(suites, { packageName: '@systemix/password' });
