# @systemix/token

## 2.0.0

### Major Changes

- ad40f40: Require Node.js 24.7 or newer (`engines.node`). Older runtimes are no longer supported or tested; CI runs on Node 24 and 26.
- 377b3dd: Harden signed tokens per RFC 8725 and add ES256/384/512, PS256/384/512 and EdDSA. **Requires Node.js 24.7+; browser support for signing is removed.**

  - New algorithms: `ES256/384/512` (raw r||s signatures), `PS256/384/512`, `EdDSA`. Keys are PEM strings or `node:crypto` `KeyObject`s.
  - Key-confusion protection: a PEM can no longer be used as an HMAC secret; HMAC secrets must be at least 32/48/64 bytes (RFC 7518 §3.2); RSA keys must be 2048+ bits; EC keys must match the algorithm's curve. Violations throw the new `InvalidKeyError`.
  - `verifySigned`: new `typ` and `maxAge` options; the key may be a function `(header) => key` for `kid`-based rotation; tokens with a `crit` header, non-object payloads, non-string `alg`, and non-canonical or padded signatures are rejected; a token is now expired at its exact `exp` second (previously accepted until `exp + 1`).
  - Base64url decoding is strict; the encoder no longer overflows the stack on large payloads.
  - Signatures and comparisons use `node:crypto` (`createHmac`, `sign`/`verify`, `timingSafeEqual`).
  - Breaking: removed `isNode()` and the Web Crypto/browser RSA path. `generateToken` and the encoding helpers are unaffected and remain free of `node:` imports in the `/token` entry.
  - Existing HMAC secrets shorter than 32 bytes stop working; use a longer secret.

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
