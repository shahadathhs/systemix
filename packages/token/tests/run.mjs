#!/usr/bin/env node
/**
 * Test runner for @systemix/token.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as generatorSuite from './generator.test.mjs';
import * as validationSuite from './validation.test.mjs';
import * as subpathSuite from './subpath.test.mjs';
import * as commonSuite from './common.test.mjs';
import * as signedSuite from './signed.test.mjs';
import * as rsaSuite from './rsa.test.mjs';

const suites = [
  { name: 'generator', ...generatorSuite },
  { name: 'validation', ...validationSuite },
  { name: 'subpath', ...subpathSuite },
  { name: 'common', ...commonSuite },
  { name: 'signed', ...signedSuite },
  { name: 'rsa', ...rsaSuite },
];

await runSuites(suites, { packageName: '@systemix/token' });
