import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export type EnvVarType = 'string' | 'number' | 'boolean';

export interface EnvVarSchema<T extends EnvVarType = EnvVarType> {
  type: T;
  required?: boolean;
  default?: T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : never;
  /** Min value (number type only) */
  min?: number;
  /** Max value (number type only) */
  max?: number;
  /** Regex to validate (string type only) */
  regex?: RegExp;
  /** Allowed values (string type) */
  oneOf?: readonly string[];
  /** Custom transform. Return value must match type. */
  transform?: (raw: string) => string | number | boolean;
  /** If true, toSafeLog() masks this value */
  secret?: boolean;
}

export type EnvSchema = Record<
  string,
  EnvVarSchema<'string' | 'number' | 'boolean'>
>;

type EnvValueFor<S extends EnvVarSchema<EnvVarType>> =
  S['type'] extends 'string'
    ? string
    : S['type'] extends 'number'
      ? number
      : S['type'] extends 'boolean'
        ? boolean
        : never;

export type EnvResult<T extends EnvSchema> = {
  [K in keyof T]: T[K]['required'] extends true
    ? EnvValueFor<T[K]>
    : T[K]['default'] extends EnvValueFor<T[K]>
      ? EnvValueFor<T[K]>
      : EnvValueFor<T[K]> | undefined;
} & {
  toSafeLog(): Record<string, string | number | boolean | undefined>;
};

export interface LoadEnvOptions {
  /** Env source (defaults to process.env in Node) */
  source?: Record<string, string | undefined>;
  /** Path(s) to .env file(s). Loaded in order, later overrides earlier. */
  fromFile?: string | string[];
  /** If true, only vars in schema are used. Unknown vars from source are ignored. */
  strict?: boolean;
}

const MASK = '***';

function parseBoolean(raw: string): boolean {
  const lower = raw.toLowerCase().trim();
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no' || lower === '')
    return false;
  throw new Error(`Invalid boolean value: "${raw}"`);
}

function parseNumber(raw: string): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid number value: "${raw}"`);
  }
  return n;
}

function parseEnvFileContent(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1).replace(/\\(.)/g, '$1');
    }

    result[key] = value;
  }

  return result;
}

function loadEnvFile(filePath: string, cwd: string): Record<string, string> {
  const resolved = resolve(cwd, filePath);
  if (!existsSync(resolved)) {
    return {};
  }
  const content = readFileSync(resolved, 'utf-8');
  return parseEnvFileContent(content);
}

function getCwd(): string {
  return typeof globalThis.process?.cwd === 'function'
    ? globalThis.process.cwd()
    : '.';
}

function mergeEnv(
  base: Record<string, string | undefined>,
  overlay: Record<string, string>,
): Record<string, string | undefined> {
  const merged = { ...base };
  for (const [k, v] of Object.entries(overlay)) {
    merged[k] = v;
  }
  return merged;
}

/**
 * Load and validate environment variables against a schema.
 * Returns a typed object with toSafeLog(). Throws on validation failure.
 *
 * @param schema - Object mapping env var names to schema definitions
 * @param options - Optional { source, fromFile, strict }. Legacy: pass Record as second arg for source.
 */
export function loadEnv<T extends EnvSchema>(
  schema: T,
  options?: LoadEnvOptions | Record<string, string | undefined>,
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
    : (opts as LoadEnvOptions);
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

function getEnvSource(): Record<string, string | undefined> {
  const env = globalThis.process?.env;
  if (env && typeof env === 'object') {
    return env as Record<string, string | undefined>;
  }
  return {};
}

/** Parse .env file content. Useful for custom file loading. */
export function parseEnvFile(content: string): Record<string, string> {
  return parseEnvFileContent(content);
}
