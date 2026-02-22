# @systemix/token

## 1.0.0

### Major Changes

- 1731b3c: Token package: add signed-token module (encode/decode/verify), restructure with common enums/types/errors/utils, require algorithms on verify for security. Breaking: verifySigned now requires options.algorithms; TokenPropsEnum replaces GenerateTokenPropsEnum; new /common subpath export.

## 0.2.0

### Minor Changes

- bff481d: Add @systemix/token package for secure token generation
