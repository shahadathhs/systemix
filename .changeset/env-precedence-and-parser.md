---
'@systemix/env': minor
---

Fix `.env` precedence and parsing, hide secrets, and add Standard Schema support.

- Fix: a `.env` file no longer overrides variables that are really set. Precedence is now `source` (default `process.env`) over `fromFile` files (later over earlier) over defaults. This is a behavior change: previously a stray `.env` could replace deployed secrets.
- Fix: the `.env` parser handles inline comments, an `export ` prefix, multi-line quoted values, `\n`/`\t` escapes in double quotes and literal single quotes. Previously `KEY=value # note` kept the comment and `\n` became the letter `n`. Invalid keys are skipped and `__proto__` is ignored.
- Fix: `parseNumber` rejects empty/whitespace-only input (was `0`) and non-decimal forms (`0x10`, `Infinity`, `1_000`); booleans also accept `on`/`off`.
- `secret: true` variables are non-enumerable (so `console.log`, `JSON.stringify` and spread don't leak them), never echoed in validation errors, and the result object is frozen.
- New: any Standard Schema validator (Zod, Valibot, ArkType) via `{ schema, required?, default?, secret? }`; the result type is the schema's output type and `default` is type-checked against it. Validators must be synchronous.
- `strict: true` now errors on unknown keys in `.env` files (typo detection). It was previously a no-op, since only schema keys are ever read.
- Breaking: the legacy plain-object overload `load(schema, { KEY: 'v' })` is removed (it misdetected sources containing keys named `source`, `fromFile` or `strict`); pass `{ source }`.
