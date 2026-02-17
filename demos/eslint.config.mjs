import { nextMinimalConfig } from '@systemix/eslint/next-minimal.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['postcss.config.mjs', 'next-env.d.ts'] },
  ...nextMinimalConfig,
];
