# @systemix/runner

## 0.3.1

### Patch Changes

- 1324eac: Rebuild all packages with tsdown (tsup successor) on TypeScript 7. Published artifacts are regenerated with updated bundling and type declarations; exports maps and public APIs are unchanged. Includes fixes for code-point-unsafe string spreading in @systemix/token base64/PEM decoding, and modernized shared configs: @systemix/typescript presets migrate to bundler resolution (base/nextjs) and nodenext (express), @systemix/eslint base config switches to the project service for type-aware linting.

## 0.3.0

### Minor Changes

- 4977f49: configure dependenices

## 0.2.0

### Minor Changes

- 224813c: Update Tests & Two New Packages
