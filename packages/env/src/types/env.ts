/** Supported environment variable value types. */
export type EnvVarType = 'string' | 'number' | 'boolean';

/**
 * The Standard Schema interface (https://standardschema.dev) implemented by
 * Zod, Valibot, ArkType and others. Declared here so this package stays
 * dependency-free.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => StandardSchemaResult<Output> | Promise<StandardSchemaResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output };
  };
}

export type StandardSchemaResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | {
      readonly issues: ReadonlyArray<{
        readonly message: string;
        readonly path?: ReadonlyArray<
          PropertyKey | { readonly key: PropertyKey }
        >;
      }>;
    };

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
  /**
   * If true, the value is masked in toSafeLog(), hidden from enumeration
   * (`console.log`, `JSON.stringify`, spread), and never echoed in errors.
   */
  secret?: boolean;
}

/**
 * A variable validated by any Standard Schema validator. The raw string is
 * passed to the validator, so coercing schemas work, e.g.
 * `{ schema: z.coerce.number().int().min(1) }`. The result type is the
 * schema's output type. The validator must be synchronous.
 */
export interface EnvVarStandardSchema<Output = unknown> {
  schema: StandardSchemaV1<string, Output>;
  required?: boolean;
  /** Fallback (already of the output type) when the variable is missing or empty. */
  default?: Output;
  /** See EnvVarSchema.secret. */
  secret?: boolean;
}

/** Map of variable names to their schema definitions. */
export type EnvSchema = Record<
  string,
  EnvVarSchema<'string' | 'number' | 'boolean'> | EnvVarStandardSchema
>;

type EnvValueFor<S> =
  S extends EnvVarStandardSchema<infer O>
    ? O
    : S extends EnvVarSchema<EnvVarType>
      ? S['type'] extends 'string'
        ? string
        : S['type'] extends 'number'
          ? number
          : S['type'] extends 'boolean'
            ? boolean
            : never
      : never;

/**
 * Result of loading env vars. Typed by schema, with toSafeLog() for safe logging.
 * The object is frozen.
 * @template T - The schema type
 */
export type EnvResult<T extends EnvSchema> = {
  readonly [K in keyof T]: T[K]['required'] extends true
    ? EnvValueFor<T[K]>
    : T[K]['default'] extends EnvValueFor<T[K]>
      ? EnvValueFor<T[K]>
      : EnvValueFor<T[K]> | undefined;
} & {
  toSafeLog(): Record<string, unknown>;
};

/**
 * Checks that a Standard Schema variable's `default` matches the schema's
 * output type (the EnvSchema union alone would accept any default).
 */
export type CheckedEnvSchema<T extends EnvSchema> = {
  [K in keyof T]: T[K] extends { schema: StandardSchemaV1<string, infer O> }
    ? { default?: O }
    : unknown;
};

/** Options for load() and Config.fromEnv(). */
export interface LoadOptions {
  /**
   * Environment source. Defaults to process.env. Values here always win over
   * values from `fromFile`.
   */
  source?: Record<string, string | undefined>;
  /**
   * .env file path(s), relative to the working directory. Missing files are
   * skipped. With several files, later files override earlier ones; the
   * source overrides all of them.
   */
  fromFile?: string | string[];
  /**
   * If true, a `.env` file containing a key that is not in the schema is an
   * error. This catches typos such as `DATABSE_URL` that would otherwise be
   * silently ignored.
   */
  strict?: boolean;
}
