# @systemix/passphrase

## 0.6.0

### Minor Changes

- ad40f40: Require Node.js 24.7 or newer (`engines.node`). Older runtimes are no longer supported or tested; CI runs on Node 24 and 26.
- 1a78887: Replace the 10-word default list with the EFF large wordlist (7,776 words). The previous default gave a 4-word passphrase only ~13 bits of entropy; it now gives ~51.7 bits. Passphrases generated before this release with the default list are weak and should be regenerated.

## 0.5.2

### Patch Changes

- a7348f0: Validate npm Trusted Publishing (OIDC) configuration across all packages: each package publishes once through the trusted publisher so its configuration is validated before the npm deadline.

## 0.5.1

### Patch Changes

- 1324eac: Rebuild all packages with tsdown (tsup successor) on TypeScript 7. Published artifacts are regenerated with updated bundling and type declarations; exports maps and public APIs are unchanged. Includes fixes for code-point-unsafe string spreading in @systemix/token base64/PEM decoding, and modernized shared configs: @systemix/typescript presets migrate to bundler resolution (base/nextjs) and nodenext (express), @systemix/eslint base config switches to the project service for type-aware linting.

## 0.5.0

### Minor Changes

- 4977f49: configure dependenices

## 0.4.0

### Minor Changes

- 224813c: Update Tests & Two New Packages

## 0.3.0

### Minor Changes

- d4a5ee4: Some small fixes. No bracking chages

## 0.2.0

### Minor Changes

- 157ee8d: Minor Chnages

## 0.1.0

### Minor Changes

- aff388a: Add browser support, per-package tests, and fix flaky password test

## 0.0.3

### Patch Changes

- 80b1184: Simplify GitHub Packages names (@shahadathhs/\*), add install docs to package READMEs

## 0.0.2

### Patch Changes

- 34ae8af: Moving to version 0.0.2
- 8d304cf: Improve version
