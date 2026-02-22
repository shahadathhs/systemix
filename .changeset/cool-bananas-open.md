---
'@systemix/token': major
---

Token package: add signed-token module (encode/decode/verify), restructure with common enums/types/errors/utils, require algorithms on verify for security. Breaking: verifySigned now requires options.algorithms; TokenPropsEnum replaces GenerateTokenPropsEnum; new /common subpath export.
