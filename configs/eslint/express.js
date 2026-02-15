import importPlugin from 'eslint-plugin-import';
import { baseConfig } from './base.js';

/** @type {import('eslint').Linter.Config[]} */
export const expressConfig = [
  ...baseConfig,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      // Add any Express specific rules here
    },
  },
];

export default expressConfig;
