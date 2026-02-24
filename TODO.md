# Systemix — Roadmap & Goals

My roadmap and package ideas for the Systemix monorepo—crypto and non-crypto.

---

## Vision: Built-in Security Toolkit

I want security features that use only Node.js built-ins and Web Crypto API. No third-party crypto deps. Easier to audit, fewer supply-chain risks.

### Modules I Rely On

| Module   | Use case                   |
| -------- | -------------------------- |
| `crypto` | Hashing, encryption, keys  |
| `buffer` | Encoding / decoding        |
| `timers` | OTP time windows           |
| `util`   | Promisification, helpers   |
| `fs`     | Key persistence (optional) |

### What I Can Do With Built-ins

- Passwords, passphrases, tokens ✅ (done)
- Hashing (scrypt, pbkdf2)
- Encryption (AES-256-GCM, ChaCha20-Poly1305)
- OTP (HOTP, TOTP)
- Key pairs (EC, RSA, Ed25519)
- Timing-safe comparison
- Encoding (base64, hex, base64url)

### What I Can’t Do Without Native/External

| Feature            | Why not                 |
| ------------------ | ----------------------- |
| Argon2             | Needs native bindings   |
| bcrypt             | External C library      |
| Full WebAuthn flow | Browser + platform APIs |
| QR code generation | Needs image rendering   |

---

## Crypto Packages (Todo)

Packages I want to add beyond password, passphrase, token, eslint, typescript:

### 1. @systemix/hash

Password hashing (PBKDF2, scrypt) via Web Crypto. Completes the auth flow: generate → hash → store → verify. Zero deps.

### 2. @systemix/env

Typed env loading and validation. Parse, validate, type env vars at startup. Common need, low complexity.

### 3. @systemix/validate

Input validation for API boundaries, config, user input. Schema validation, optional timing-safe checks.

### 4. @systemix/cipher

AES-GCM encrypt/decrypt via Web Crypto. For encrypting sensitive data at rest (DB fields, config).

### 5. @systemix/rate-limit

Rate limiting (in-memory or pluggable store). Express/Next middleware, API protection.

### 6. @systemix/id

ID generation (UUID v4, ULID, nanoid-style). Non-secret identifiers for APIs, DBs.

---

## Non-Crypto Packages (Todo)

Packages outside crypto—scalable systems, DX, async utilities:

### Developer Experience

| Package          | Purpose                                | Why                         |
| ---------------- | -------------------------------------- | --------------------------- |
| @systemix/retry  | Retry with exponential backoff, jitter | Widely useful, small scope  |
| @systemix/logger | Structured logging (levels, JSON)      | Minimal deps, consistent DX |
| @systemix/result | Result/Either-style error handling     | No exceptions, typed errors |

### Data & API

| Package          | Purpose                               | Why                    |
| ---------------- | ------------------------------------- | ---------------------- |
| @systemix/schema | Lightweight runtime schema validation | API boundaries, config |
| @systemix/fetch  | Fetch wrapper (retry, timeout, typed) | Robust HTTP client     |
| @systemix/url    | URL helpers, query parsing, building  | Common need, zero deps |

### Performance & Concurrency

| Package             | Purpose                                | Why                        |
| ------------------- | -------------------------------------- | -------------------------- |
| @systemix/cache     | In-memory LRU cache                    | Simple caching, no Redis   |
| @systemix/queue     | Simple async queue (producer/consumer) | Background jobs, buffering |
| @systemix/semaphore | Concurrency limiting                   | Limit parallel requests    |

### Async Utilities

| Package         | Purpose                                    | Why                |
| --------------- | ------------------------------------------ | ------------------ |
| @systemix/async | sleep, timeout, debounce, throttle, pLimit | Core async helpers |
