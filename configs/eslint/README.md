# @systemix/eslint

Standard ESLint configurations for Systemix projects. These configurations provide a consistent linting foundation for common project types.

## Installation

```bash
pnpm add -D @systemix/eslint
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

- `@systemix/eslint/base`: General JavaScript/TypeScript projects.
- `@systemix/eslint/express`: Node.js Express services.
- `@systemix/eslint/next`: Next.js applications.

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
