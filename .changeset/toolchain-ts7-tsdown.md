---
'@systemix/env': patch
'@systemix/password': patch
'@systemix/passphrase': patch
'@systemix/token': patch
'@systemix/eslint': minor
'@systemix/typescript': minor
'@systemix/runner': patch
---

Rebuild all packages with tsdown (tsup successor) on TypeScript 7. Published artifacts are regenerated with updated bundling and type declarations; exports maps and public APIs are unchanged. Includes fixes for code-point-unsafe string spreading in @systemix/token base64/PEM decoding, and modernized shared configs: @systemix/typescript presets migrate to bundler resolution (base/nextjs) and nodenext (express), @systemix/eslint base config switches to the project service for type-aware linting.
