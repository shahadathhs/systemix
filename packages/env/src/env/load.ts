import type {
  CheckedEnvSchema,
  EnvSchema,
  EnvVarSchema,
  EnvVarStandardSchema,
  EnvVarType,
  EnvResult,
  LoadOptions,
} from '../types/env';
import { parseBoolean, parseNumber } from './parse';
import { loadEnvFile, getCwd, mergeEnv, getEnvSource } from './file';

const MASK = '***';

type Definition = EnvVarSchema<EnvVarType> | EnvVarStandardSchema;

function isStandard(def: Definition): def is EnvVarStandardSchema {
  return 'schema' in def && def.schema !== undefined;
}

/** Parses and validates one raw value. Returns the value or throws. */
function parseValue(def: Definition, raw: string): unknown {
  if (isStandard(def)) {
    const result = def.schema['~standard'].validate(raw);
    if (result instanceof Promise) {
      void result.catch(() => undefined);
      throw new Error('async validators are not supported; use a sync schema');
    }
    if (result.issues) {
      throw new Error(result.issues.map((issue) => issue.message).join('; '));
    }
    return result.value;
  }

  const { type } = def;
  let value: string | number | boolean;
  if (def.transform) {
    value = def.transform(raw);
  } else if (type === 'number') {
    value = parseNumber(raw);
  } else if (type === 'boolean') {
    value = parseBoolean(raw);
  } else {
    value = raw;
  }

  if (type === 'number' && typeof value === 'number') {
    if (def.min !== undefined && value < def.min) {
      throw new Error(`must be >= ${def.min}`);
    }
    if (def.max !== undefined && value > def.max) {
      throw new Error(`must be <= ${def.max}`);
    }
  }
  if (type === 'string' && typeof value === 'string') {
    if (def.regex && !def.regex.test(value)) {
      throw new Error(`must match ${def.regex}`);
    }
    if (def.oneOf && !def.oneOf.includes(value)) {
      throw new Error(`must be one of [${def.oneOf.join(', ')}]`);
    }
  }
  return value;
}

/**
 * Load and validate environment variables from a schema.
 *
 * Parses strings, numbers and booleans; validates min/max, regex, oneOf, or
 * delegates to any Standard Schema validator (Zod, Valibot, ArkType). Returns
 * a frozen, typed object. Variables marked `secret` are non-enumerable (so
 * `console.log`, `JSON.stringify` and spread don't expose them), never appear
 * in error messages, and are masked by `toSafeLog()`.
 *
 * Precedence, highest first: `source` (default `process.env`), then the
 * `fromFile` files (later files override earlier ones), then schema defaults.
 * A `.env` file never overrides a variable that is really set.
 *
 * @throws When required vars are missing or validation fails (all problems are reported together)
 *
 * @example
 * const env = load(
 *   { PORT: { type: 'number', default: 3000 }, API_KEY: { type: 'string', required: true, secret: true } },
 *   { fromFile: '.env' },
 * );
 */
export function load<T extends EnvSchema>(
  schema: T & CheckedEnvSchema<T>,
  options: LoadOptions = {},
): EnvResult<T> {
  const { source, fromFile, strict = false } = options;
  const schemaKeys = Object.keys(schema);
  const errors: string[] = [];

  const fileVars: Record<string, string> = {};
  if (fromFile) {
    const cwd = getCwd();
    const files = Array.isArray(fromFile) ? fromFile : [fromFile];
    for (const file of files) Object.assign(fileVars, loadEnvFile(file, cwd));
  }
  if (strict) {
    const known = new Set(schemaKeys);
    for (const key of Object.keys(fileVars)) {
      if (!known.has(key)) errors.push(`Unknown env var in .env file: ${key}`);
    }
  }

  const env = mergeEnv(fileVars, source ?? getEnvSource());
  const values: Record<string, unknown> = {};

  for (const key of schemaKeys) {
    const def = schema[key] as Definition;
    const raw = env[key];
    const { required = false, default: defaultValue } = def;

    if (raw === undefined || raw === '') {
      if (required && defaultValue === undefined) {
        errors.push(`Missing required env var: ${key}`);
        continue;
      }
      values[key] = defaultValue ?? undefined;
      continue;
    }

    try {
      values[key] = parseValue(def, raw);
    } catch (err) {
      // Never echo a secret's raw value through an error message.
      const detail = def.secret
        ? 'invalid value'
        : err instanceof Error
          ? err.message
          : String(err);
      errors.push(`${key}: ${detail}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Env validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  const result = {} as Record<string, unknown>;
  for (const key of schemaKeys) {
    Object.defineProperty(result, key, {
      value: values[key],
      enumerable: !(schema[key] as Definition).secret,
      writable: false,
      configurable: false,
    });
  }
  Object.defineProperty(result, 'toSafeLog', {
    value: (): Record<string, unknown> => {
      const safe: Record<string, unknown> = {};
      for (const key of schemaKeys) {
        safe[key] =
          (schema[key] as Definition).secret && values[key] !== undefined
            ? MASK
            : values[key];
      }
      return safe;
    },
    enumerable: false,
  });
  return Object.freeze(result) as EnvResult<T>;
}
