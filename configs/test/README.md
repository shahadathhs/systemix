# @systemix/test

Minimal test runner for Systemix packages. Zero dependencies.

## Installation

```bash
pnpm add -D @systemix/test
```

## Usage

### createRunner + runSuites (multi-suite)

```javascript
import { createRunner, runSuites } from '@systemix/test';

const loadSuite = createRunner(({ assert, assertThrows }) => {
  assert(1 + 1 === 2, 'math works');
  assertThrows(() => {
    throw new Error('expected');
  }, 'throws');
});

const parseSuite = createRunner(({ assert }) => {
  assert(true, 'parse ok');
});

runSuites(
  [
    { name: 'load', ...loadSuite },
    { name: 'parse', ...parseSuite },
  ],
  { packageName: '@systemix/env' }
);
```

### Single suite (run)

```javascript
import { createRunner, run } from '@systemix/test';

const suite = createRunner(({ assert, assertThrows }) => {
  assert(foo() === 'bar', 'foo returns bar');
  assertThrows(() => bad(), 'bad throws');
});

await run(suite, { packageName: '@systemix/password' });
```

Or with runSuites:

```javascript
import { createRunner, runSuites } from '@systemix/test';

const suite = createRunner(({ assert, assertThrows }) => {
  assert(foo() === 'bar', 'foo returns bar');
  assertThrows(() => bad(), 'bad throws');
});

await runSuites([suite], { packageName: '@systemix/password' });
```

### Async tests

```javascript
const { run, getCounts } = createRunner(
  ({ assert, assertThrows, assertThrowsAsync }) => {
    assert(sync(), 'sync works');
    await assertThrowsAsync(async () => await badAsync(), 'async throws');
  }
);
```

## API

- **createRunner(suite)** — Returns `{ run, getCounts }`. `suite` receives `{ assert, assertThrows, assertThrowsAsync }`.
- **runSuites(suites, options)** — Runs suites, prints summary, exits with 0 or 1. `options.packageName` for header.
- **run(suite, options)** — Run a single suite and exit. Convenience for one-suite packages.

## License

MIT
