/**
 * @systemix/runner — Type declarations
 */

export interface AssertHelpers {
  assert: (condition: boolean, message: string) => void;
  assertThrows: (fn: () => void, message: string) => void;
  assertThrowsAsync: (
    fn: () => Promise<unknown>,
    message: string,
  ) => Promise<void>;
}

export type SuiteFn = (
  helpers: AssertHelpers,
) => void | Promise<void>;

export interface Runner {
  run: () => void | Promise<void>;
  getCounts: () => { passed: number; failed: number };
}

export interface Suite {
  name?: string;
  run: () => void | Promise<void>;
  getCounts: () => { passed: number; failed: number };
}

export interface RunSuitesOptions {
  packageName?: string;
}

/**
 * Creates a test runner with assert and assertThrows helpers.
 */
export function createRunner(suite: SuiteFn): Runner;

/**
 * Run multiple test suites and exit with appropriate code.
 */
export function runSuites(
  suites: Suite[],
  options?: RunSuitesOptions,
): Promise<never>;

/**
 * Run a single suite and exit. Convenience for one-suite packages.
 */
export function run(
  suite: Suite,
  options?: RunSuitesOptions,
): Promise<never>;
