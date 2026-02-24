# @systemix/env

Typed environment variable loading and validation. Zero dependencies. Built-in .env file support.

## Installation

```bash
pnpm add @systemix/env
```

## Usage

```typescript
import { loadEnv } from '@systemix/env';

const env = loadEnv({
  NODE_ENV: { type: 'string', default: 'development' },
  PORT: { type: 'number', default: 3000 },
  DATABASE_URL: { type: 'string', required: true, secret: true },
  DEBUG: { type: 'boolean', default: false },
});

console.log(env.PORT); // number
console.log(env.toSafeLog()); // { DATABASE_URL: '***', ... }
```

## Schema

| Property   | Type                    | Description                          |
| ---------- | ----------------------- | ------------------------------------ |
| `type`     | `'string' \| 'number' \| 'boolean'` | How to parse the value        |
| `required` | `boolean`               | If true, throws when missing          |
| `default`  | `string \| number \| boolean` | Used when var is missing or empty |
| `min`      | `number`                | Min value (number type)                |
| `max`      | `number`                | Max value (number type)                |
| `regex`    | `RegExp`                | Must match (string type)              |
| `oneOf`    | `string[]`              | Allowed values (string type)           |
| `transform`| `(raw) => value`        | Custom parser                         |
| `secret`   | `boolean`               | Masked in `toSafeLog()`               |

## Options

Pass options as second argument. For backward compat, a plain `Record` is treated as `{ source }`:

```typescript
loadEnv(schema, { PORT: '4000' });  // legacy: treated as source
loadEnv(schema, {
  source: { PORT: '4000' },           // Custom env source
  fromFile: '.env.local',             // Load from .env file(s)
  fromFile: ['.env', '.env.local'],   // Multiple files, later overrides
  strict: true,                       // Ignore vars not in schema
});
```

## .env File Loading

Load from file without dotenv. Cross-platform (Windows, macOS, Linux).

```typescript
const env = loadEnv(schema, { fromFile: '.env.local' });
```

Or parse content yourself:

```typescript
import { parseEnvFile } from '@systemix/env';

const vars = parseEnvFile(readFileSync('.env', 'utf-8'));
```

## Secret Masking

Mark sensitive vars with `secret: true`. Use `toSafeLog()` for logging:

```typescript
const env = loadEnv({
  API_KEY: { type: 'string', secret: true },
  PORT: { type: 'number' },
}, { source: { API_KEY: 'sk-123', PORT: '3000' } });

console.log(env.toSafeLog());
// { API_KEY: '***', PORT: 3000 }
```

## Batch Error Reporting

All validation errors are collected and thrown together:

```
Env validation failed:
  - Missing required env var: DATABASE_URL
  - PORT: must be >= 1
```

## Boolean Parsing

- `true`: `"true"`, `"1"`, `"yes"`
- `false`: `"false"`, `"0"`, `"no"`, `""`

## License

MIT © [Shahadath Hossen Sajib](https://github.com/shahadathhs)
