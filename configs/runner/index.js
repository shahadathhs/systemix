/**
 * @systemix/runner — Minimal test runner for Systemix packages.
 * Zero dependencies. Use with Node ESM.
 *
 * @example
 * import { createRunner, runSuites } from '@systemix/runner';
 *
 * const { run, getCounts } = createRunner(({ assert, assertThrows }) => {
 *   assert(1 + 1 === 2, 'math works');
 *   assertThrows(() => { throw new Error(); }, 'throws');
 * });
 *
 * runSuites([{ name: 'basic', run, getCounts }], { packageName: '@systemix/foo' });
 */

/**
 * @typedef {(helpers: { assert: (c: boolean, m: string) => void, assertThrows: (fn: () => void, m: string) => void, assertThrowsAsync: (fn: () => Promise<unknown>, m: string) => Promise<void> }) => void | Promise<void>} SuiteFn
 * @typedef {{ run: () => void | Promise<void>, getCounts: () => { passed: number, failed: number } }} Runner
 */

/**
 * Creates a test runner with assert and assertThrows helpers.
 * Each runner has its own pass/fail counters.
 *
 * @param {SuiteFn} suite - Callback receiving { assert, assertThrows, assertThrowsAsync }
 * @returns {Runner}
 */
export function createRunner(suite) {
  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      passed++;
      console.log(`  ✓ ${message}`);
    } else {
      failed++;
      console.error(`  ✗ ${message}`);
    }
  };

  const assertThrows = (fn, message) => {
    try {
      fn();
      failed++;
      console.error(`  ✗ ${message} (expected throw)`);
    } catch {
      passed++;
      console.log(`  ✓ ${message}`);
    }
  };

  const assertThrowsAsync = async (fn, message) => {
    try {
      await fn();
      failed++;
      console.error(`  ✗ ${message} (expected throw)`);
    } catch {
      passed++;
      console.log(`  ✓ ${message}`);
    }
  };

  return {
    run: () => suite({ assert, assertThrows, assertThrowsAsync }),
    getCounts: () => ({ passed, failed }),
  };
}

/**
 * Run multiple test suites and exit with appropriate code.
 * Supports sync and async suites (await run() when suite is async).
 *
 * @param suites - Array of { name?, run, getCounts }
 * @param options - { packageName?: string }
 */
export async function runSuites(suites, options = {}) {
  const { packageName = '' } = options;

  if (packageName) {
    console.log(`\n📦 ${packageName}\n`);
  }

  let totalPassed = 0;
  let totalFailed = 0;

  for (const { name, run, getCounts } of suites) {
    if (name) {
      console.log(`\n  ${name}`);
    }
    await run();
    const { passed, failed } = getCounts();
    totalPassed += passed;
    totalFailed += failed;
  }

  console.log(`\n✅ ${totalPassed} passed, ${totalFailed} failed\n`);
  process.exit(totalFailed > 0 ? 1 : 0);
}

/**
 * Run a single suite and exit. Convenience for one-suite packages.
 *
 * @param suite - { name?, run, getCounts }
 * @param options - { packageName?: string }
 */
export async function run(suite, options = {}) {
  await runSuites([suite], options);
}
