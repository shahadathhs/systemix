# @systemix/token

## 1.4.2

### Patch Changes

- a7348f0: Validate npm Trusted Publishing (OIDC) configuration across all packages: each package publishes once through the trusted publisher so its configuration is validated before the npm deadline.

## 1.4.1

### Patch Changes

- 1324eac: Rebuild all packages with tsdown (tsup successor) on TypeScript 7. Published artifacts are regenerated with updated bundling and type declarations; exports maps and public APIs are unchanged. Includes fixes for code-point-unsafe string spreading in @systemix/token base64/PEM decoding, and modernized shared configs: @systemix/typescript presets migrate to bundler resolution (base/nextjs) and nodenext (express), @systemix/eslint base config switches to the project service for type-aware linting.

## 1.4.0

### Minor Changes

- 4977f49: configure dependenices

## 1.3.0

### Minor Changes

- 224813c: Update Tests & Two New Packages

## 1.2.0

### Minor Changes

- d4a5ee4: Some small fixes. No bracking chages

## 1.1.0

### Minor Changes

- d38a6c3: Impore browser support and code structure

## 1.0.0

### Major Changes

- 1731b3c: Token package: add signed-token module (encode/decode/verify), restructure with common enums/types/errors/utils, require algorithms on verify for security. Breaking: verifySigned now requires options.algorithms; TokenPropsEnum replaces GenerateTokenPropsEnum; new /common subpath export.

## 0.2.0

### Minor Changes

- bff481d: Add @systemix/token package for secure token generation
