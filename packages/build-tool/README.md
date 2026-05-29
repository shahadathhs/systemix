# @systemix/build-tool

Minimal TypeScript build tool for Systemix monorepo. No external dependencies, no tsup baseUrl bugs.

## Usage

### Add to your package:

```json
{
  "devDependencies": {
    "@systemix/build-tool": "workspace:*"
  },
  "scripts": {
    "build": "systemix-build --entry src/index.ts --outDir dist --clean"
  }
}
```

### Available options:

- `--entry, -e`: Entry file (default: `src/index.ts`)
- `--outDir, -o`: Output directory (default: `dist`) 
- `--tsconfig, -t`: Path to tsconfig.json (auto-detected if not specified)
- `--clean`: Clean output directory before build
- `--help, -h`: Show help

## Features

✅ **Dual CJS/ESM output** - Generates both formats in one build
✅ **TypeScript 6.0 compatible** - No baseUrl injection issues
✅ **Declaration files** - Automatic .d.ts generation
✅ **Zero external dependencies** - Only uses TypeScript compiler API
✅ **Auto-config detection** - Finds tsconfig.json automatically

## Examples

```bash
# Basic build
systemix-build

# Custom entry and output
systemix-build --entry src/lib.ts --outDir build

# With specific tsconfig
systemix-build --tsconfig ./tsconfig.json

# Clean build
systemix-build --clean
```

## Output structure

```
dist/
├── index.js           # ESM entry point
├── index.d.ts         # TypeScript declarations
├── config.js          # ESM modules (unbundled)
├── config.d.ts
├── env/
│   ├── index.js
│   └── index.d.ts
└── cjs/               # CommonJS output
    ├── index.js
    ├── index.d.cts    # CJS declarations
    ├── config.js
    └── env/
        └── index.js
```

## Why this exists

tsup injects problematic `baseUrl` options that conflict with TypeScript 6.0. This build tool:
- Avoids tsup's baseUrl injection
- Provides clean dual-format output
- Works with modern TypeScript configurations