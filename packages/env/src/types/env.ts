/** Supported environment variable value types. */
export type EnvVarType = 'string' | 'number' | 'boolean';

/**
 * Schema definition for a single environment variable.
 * @template T - The value type ('string' | 'number' | 'boolean')
 */
export interface EnvVarSchema<T extends EnvVarType = EnvVarType> {
  /** Value type for parsing and validation. */
  type: T;
  /** If true, the variable must be present. */
  required?: boolean;
  /** Fallback when the variable is missing or empty. */
  default?: T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : never;
  /** Minimum value (numbers only). */
  min?: number;
  /** Maximum value (numbers only). */
  max?: number;
  /** Regex pattern (strings only). */
  regex?: RegExp;
  /** Allowed values (strings only). */
  oneOf?: readonly string[];
  /** Custom parser. Overrides type-based parsing. */
  transform?: (raw: string) => string | number | boolean;
  /** If true, value is masked in toSafeLog(). */
  secret?: boolean;
}

/** Map of variable names to their schema definitions. */
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

/**
 * Result of loading env vars. Typed by schema, with toSafeLog() for safe logging.
 * @template T - The schema type
 */
export type EnvResult<T extends EnvSchema> = {
  [K in keyof T]: T[K]['required'] extends true
    ? EnvValueFor<T[K]>
    : T[K]['default'] extends EnvValueFor<T[K]>
      ? EnvValueFor<T[K]>
      : EnvValueFor<T[K]> | undefined;
} & {
  toSafeLog(): Record<string, string | number | boolean | undefined>;
};

/** Options for load() and Config.fromEnv(). */
export interface LoadOptions {
  /** Override env source. Defaults to process.env. */
  source?: Record<string, string | undefined>;
  /** .env file path(s) to load. Merged with source. */
  fromFile?: string | string[];
  /** If true, only schema keys are included (extra vars dropped). */
  strict?: boolean;
}
