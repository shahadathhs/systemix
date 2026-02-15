import { baseConfig } from '@systemix/eslint/base.js';
import { expressConfig } from '@systemix/eslint/express.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**'],
  },
  ...baseConfig,
  ...expressConfig.map((config) => ({
    ...config,
    files: ['services/**/*.{js,ts,tsx}', 'gateway/**/*.{js,ts,tsx}'],
  })),
];
