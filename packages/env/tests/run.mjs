#!/usr/bin/env node
/**
 * Test runner for @systemix/env.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as loadSuite from './load.test.mjs';
import * as validationSuite from './validation.test.mjs';
import * as configSuite from './config.test.mjs';
import * as parseSuite from './parse.test.mjs';
import * as fileSuite from './file.test.mjs';

const suites = [
  { name: 'load', ...loadSuite },
  { name: 'validation', ...validationSuite },
  { name: 'config', ...configSuite },
  { name: 'parse', ...parseSuite },
  { name: 'file', ...fileSuite },
];

await runSuites(suites, { packageName: '@systemix/env' });
