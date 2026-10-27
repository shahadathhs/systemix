#!/usr/bin/env node
/**
 * Test runner for @systemix/id.
 * Run: pnpm test (builds first, then runs tests)
 */

import { runSuites } from '@systemix/runner';
import * as nanoidSuite from './nanoid.test.mjs';
import * as ulidSuite from './ulid.test.mjs';
import * as uuidSuite from './uuid.test.mjs';
import * as orderingSuite from './ordering.test.mjs';

const suites = [
  { name: 'nanoid', ...nanoidSuite },
  { name: 'ulid', ...ulidSuite },
  { name: 'uuid', ...uuidSuite },
  { name: 'ordering', ...orderingSuite },
];

await runSuites(suites, { packageName: '@systemix/id' });
