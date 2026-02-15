# @systemix/typescript

Standard TypeScript configurations for Systemix projects, providing optimized compiler options for various environments.

## Installation

```bash
pnpm add -D @systemix/typescript
```

## Usage

In your `tsconfig.json`:

```json
{
  "extends": "@systemix/typescript/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

## Included Configs

- `@systemix/typescript/base.json`: Base configuration for modern TypeScript projects.
- `@systemix/typescript/express.json`: Optimized for Express.js services.
- `@systemix/typescript/nextjs.json`: Optimized for Next.js applications.

## License

MIT © [shahadathhs](https://github.com/shahadathhs)
