#!/usr/bin/env node
/**
 * Test runner for @systemix/env.
 * Run: pnpm test (builds first, then runs tests)
 */

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

console.log('\n📦 @systemix/env\n');

let totalPassed = 0;
let totalFailed = 0;

for (const { name, run, getCounts } of suites) {
  run();
  const { passed, failed } = getCounts();
  totalPassed += passed;
  totalFailed += failed;
}

console.log(`\n✅ ${totalPassed} passed, ${totalFailed} failed\n`);
process.exit(totalFailed > 0 ? 1 : 0);
