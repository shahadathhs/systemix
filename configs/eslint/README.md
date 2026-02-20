# @systemix/eslint

[![npm](https://img.shields.io/npm/v/@systemix/eslint.svg)](https://www.npmjs.com/package/@systemix/eslint)

Standard ESLint configurations for Systemix projects. These configurations provide a consistent linting foundation for common project types using ESLint v10 flat config.

## Installation

```bash
pnpm add -D @systemix/eslint
```

or

```bash
npm install -D @systemix/eslint
```

## Usage

In your `eslint.config.mjs`:

```javascript
import baseConfig from '@systemix/eslint/base';

export default [
  ...baseConfig,
  // your custom rules
];
```

## Included Configs

| Config | Description |
| :----- | :---------- |
| `@systemix/eslint/base` | General JavaScript/TypeScript projects. |
| `@systemix/eslint/express` | Node.js Express services. |
| `@systemix/eslint/next` | Full Next.js applications. |
| `@systemix/eslint/next-minimal` | Minimal Next.js (no framework-specific rules). |

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
