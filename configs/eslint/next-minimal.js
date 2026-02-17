import js from '@eslint/js';
import pluginNext from '@next/eslint-plugin-next';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

import { baseConfig } from './base.js';

/**
 * ESLint configuration for Next.js apps (minimal).
 * Uses @next/eslint-plugin-next only; omits eslint-plugin-react and
 * eslint-plugin-react-hooks which are not yet compatible with ESLint 10
 * (context.getFilename removed in flat config).
 * @type {import("eslint").Linter.Config[]}
 */
export const nextMinimalConfig = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
];
