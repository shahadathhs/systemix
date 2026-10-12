#!/usr/bin/env node
/**
 * Test runner for @systemix/rate-limit.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as windowAlgorithmsSuite from './window-algorithms.test.mjs';
import * as tokenBucketSuite from './token-bucket.test.mjs';
import * as integrationSuite from './integration.test.mjs';

const suites = [
  { name: 'window-algorithms', ...windowAlgorithmsSuite },
  { name: 'token-bucket', ...tokenBucketSuite },
  { name: 'integration', ...integrationSuite },
];

await runSuites(suites, { packageName: '@systemix/rate-limit' });
