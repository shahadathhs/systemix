# @systemix/eslint

## 0.6.1

### Patch Changes

- a7348f0: Validate npm Trusted Publishing (OIDC) configuration across all packages: each package publishes once through the trusted publisher so its configuration is validated before the npm deadline.

## 0.6.0

### Minor Changes

- 1324eac: Rebuild all packages with tsdown (tsup successor) on TypeScript 7. Published artifacts are regenerated with updated bundling and type declarations; exports maps and public APIs are unchanged. Includes fixes for code-point-unsafe string spreading in @systemix/token base64/PEM decoding, and modernized shared configs: @systemix/typescript presets migrate to bundler resolution (base/nextjs) and nodenext (express), @systemix/eslint base config switches to the project service for type-aware linting.

## 0.5.0

### Minor Changes

- 4977f49: configure dependenices

## 0.4.0

### Minor Changes

- 224813c: Update Tests & Two New Packages

## 0.3.0

### Minor Changes

- 157ee8d: Minor Chnages

## 0.2.2

### Patch Changes

- aff388a: Add browser support, per-package tests, and fix flaky password test

## 0.2.1

### Patch Changes

- 80b1184: Simplify GitHub Packages names (@shahadathhs/\*), add install docs to package READMEs

## 0.2.0

### Minor Changes

- d17292f: Improve package metadata: keywords, descriptions, Node engines

## 0.1.0

### Minor Changes

- bf80490: Enable npm publishing for ESLint and TypeScript config packages
