---
'@systemix/hash': minor
---

Argon2id, PHC format, `needsRehash`, and bounded cost parameters. **Requires Node.js 24.7+.**

- **New default: Argon2id** (19 MiB, 2 passes, 1 lane — OWASP minimum) via `node:crypto`. scrypt now defaults to N=2^17 and PBKDF2 to 600,000 iterations.
- **PHC string output** (`$argon2id$v=19$m=…,t=…,p=…$salt$hash`, `$scrypt$ln=…`, `$pbkdf2-sha256$i=…`). Hashes written by 0.1.x still verify; `parseEncodedHash` reports `format: 'legacy'` for them.
- **`needsRehash(hash, options?)`** to upgrade weak or legacy hashes at login.
- **Hostile-input protection:** PBKDF2 iterations, scrypt N/r/p and memory, Argon2 memory/passes/lanes and key length read from stored hashes are bounded, so `verifyPassword` returns `false` instead of doing unbounded work.
- scrypt and Argon2 run asynchronously on the libuv threadpool; comparison uses `crypto.timingSafeEqual`.
- Breaking: `hashPassword` output format and defaults changed; the package no longer supports browsers (Node.js 24.7+ only).
