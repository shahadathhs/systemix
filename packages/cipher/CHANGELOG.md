# @systemix/cipher

## 0.1.1

### Patch Changes

- a7348f0: Validate npm Trusted Publishing (OIDC) configuration across all packages: each package publishes once through the trusted publisher so its configuration is validated before the npm deadline.

## 0.1.0

### Minor Changes

- Initial release: authenticated AES-256-GCM encryption and decryption with embedded IV, AAD support, PBKDF2 key derivation, and typed errors.
