---
'@systemix/token': major
---

Harden signed tokens per RFC 8725 and add ES256/384/512, PS256/384/512 and EdDSA. **Requires Node.js 24.7+; browser support for signing is removed.**

- New algorithms: `ES256/384/512` (raw r||s signatures), `PS256/384/512`, `EdDSA`. Keys are PEM strings or `node:crypto` `KeyObject`s.
- Key-confusion protection: a PEM can no longer be used as an HMAC secret; HMAC secrets must be at least 32/48/64 bytes (RFC 7518 §3.2); RSA keys must be 2048+ bits; EC keys must match the algorithm's curve. Violations throw the new `InvalidKeyError`.
- `verifySigned`: new `typ` and `maxAge` options; the key may be a function `(header) => key` for `kid`-based rotation; tokens with a `crit` header, non-object payloads, non-string `alg`, and non-canonical or padded signatures are rejected; a token is now expired at its exact `exp` second (previously accepted until `exp + 1`).
- Base64url decoding is strict; the encoder no longer overflows the stack on large payloads.
- Signatures and comparisons use `node:crypto` (`createHmac`, `sign`/`verify`, `timingSafeEqual`).
- Breaking: removed `isNode()` and the Web Crypto/browser RSA path. `generateToken` and the encoding helpers are unaffected and remain free of `node:` imports in the `/token` entry.
- Existing HMAC secrets shorter than 32 bytes stop working; use a longer secret.
