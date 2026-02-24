import type {
  EnvSchema,
  EnvVarSchema,
  EnvVarType,
  EnvResult,
  LoadOptions,
} from '../types/env';
import { parseBoolean, parseNumber } from './parse';
import { loadEnvFile, getCwd, mergeEnv, getEnvSource } from './file';

const MASK = '***';

/**
 * Load and validate environment variables from a schema.
 * Parses strings, numbers, and booleans; validates min/max, regex, oneOf.
 * Returns a typed object with toSafeLog() for safe logging (masks secrets).
 *
 * @param schema - Map of var names to schema definitions
 * @param options - Source override, fromFile, or strict mode. Legacy: plain object as source.
 * @returns Typed env object with toSafeLog()
 * @throws When required vars are missing or validation fails
 *
 * @example
 * const env = load(
 *   { PORT: { type: 'number', default: 3000 }, API_KEY: { type: 'string', required: true } },
 *   { source: process.env }
 * );
 */
export function load<T extends EnvSchema>(
  schema: T,
  options?: LoadOptions | Record<string, string | undefined>,
): EnvResult<T> {
  const opts = options ?? {};
  const isLegacySource =
    opts &&
    typeof opts === 'object' &&
    !Array.isArray(opts) &&
    !('source' in opts) &&
    !('fromFile' in opts) &&
    !('strict' in opts);
  const normalized = isLegacySource
    ? { source: opts as Record<string, string | undefined> }
    : (opts as LoadOptions);
  const { source, fromFile, strict = false } = normalized;

  let env = source ?? getEnvSource();

  if (fromFile) {
    const cwd = getCwd();
    const files = Array.isArray(fromFile) ? fromFile : [fromFile];
    for (const f of files) {
      const loaded = loadEnvFile(f, cwd);
      env = mergeEnv(env, loaded);
    }
  }

  if (strict) {
    const schemaKeys = new Set(Object.keys(schema));
    const filtered: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(env)) {
      if (schemaKeys.has(k)) filtered[k] = v;
    }
    env = filtered;
  }

  const schemaKeys = Object.keys(schema);
  const errors: string[] = [];
  const result = {} as Record<string, unknown>;

  for (const key of schemaKeys) {
    const def = schema[key] as EnvVarSchema<EnvVarType>;
    const raw = env[key];
    const { type, required = false, default: defaultValue } = def;

    if (raw === undefined || raw === '') {
      if (required && defaultValue === undefined) {
        errors.push(`Missing required env var: ${key}`);
        continue;
      }
      result[key] = defaultValue ?? undefined;
      continue;
    }

    try {
      let value: string | number | boolean;

      if (def.transform) {
        value = def.transform(raw);
      } else {
        switch (type) {
          case 'string':
            value = raw;
            break;
          case 'number':
            value = parseNumber(raw);
            break;
          case 'boolean':
            value = parseBoolean(raw);
            break;
          default:
            value = raw;
        }
      }

      if (type === 'number' && typeof value === 'number') {
        if (def.min !== undefined && value < def.min) {
          errors.push(`${key}: must be >= ${def.min}`);
          continue;
        }
        if (def.max !== undefined && value > def.max) {
          errors.push(`${key}: must be <= ${def.max}`);
          continue;
        }
      }

      if (type === 'string' && typeof value === 'string') {
        if (def.regex && !def.regex.test(value)) {
          errors.push(`${key}: must match ${def.regex}`);
          continue;
        }
        if (def.oneOf && !def.oneOf.includes(value)) {
          errors.push(`${key}: must be one of [${def.oneOf.join(', ')}]`);
          continue;
        }
      }

      result[key] = value;
    } catch (err) {
      errors.push(
        `${key}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Env validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
    );
  }

  const toSafeLog = (): Record<
    string,
    string | number | boolean | undefined
  > => {
    const safe: Record<string, string | number | boolean | undefined> = {};
    for (const key of schemaKeys) {
      const def = schema[key] as EnvVarSchema<EnvVarType>;
      const val = result[key];
      safe[key] =
        def.secret && val !== undefined
          ? MASK
          : (val as string | number | boolean | undefined);
    }
    return safe;
  };

  return Object.assign(result, { toSafeLog }) as EnvResult<T>;
}
