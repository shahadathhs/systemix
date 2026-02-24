/**
 * Tests for parseEnvFile() – key=value parsing, comments, quoted values.
 */
import { createRunner } from '@systemix/runner';
import { parseEnvFile } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const parsed = parseEnvFile('FOO=bar\n# comment\nBAR=123\n');
  assert(parsed.FOO === 'bar', 'parseEnvFile FOO');
  assert(parsed.BAR === '123', 'parseEnvFile BAR');
  assert(!parsed['# comment'], 'skips comments');
});
