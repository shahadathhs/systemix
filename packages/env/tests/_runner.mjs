/**
 * Creates a test runner with assert and assertThrows helpers.
 * @param suite - Callback receiving { assert, assertThrows }
 * @returns { run, getCounts } - run() executes suite, getCounts() returns { passed, failed }
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

  return {
    run: () => suite({ assert, assertThrows }),
    getCounts: () => ({ passed, failed }),
  };
}

/** Wraps a plain object as LoadOptions.source for load() / Config.fromEnv(). */
export const src = (obj) => ({ source: obj });
