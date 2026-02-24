import type { EnvSchema, EnvResult, LoadOptions } from './types/env';
import { load } from './env/load';

/**
 * Typed configuration container built from env vars.
 * Use fromEnv() to load from schema, or from() to wrap an existing result.
 *
 * @template T - Schema type (keys and value types)
 */
export class Config<T extends EnvSchema> {
  private readonly config: EnvResult<T>;

  private constructor(config: EnvResult<T>) {
    this.config = config;
  }

  /**
   * Create Config from a schema and env source.
   * @param schema - Env variable definitions
   * @param options - Source, fromFile, or strict. Legacy: plain object as source.
   */
  static fromEnv<S extends EnvSchema>(
    schema: S,
    options?: LoadOptions | Record<string, string | undefined>,
  ): Config<S> {
    const config = load(schema, options);
    return new Config(config);
  }

  /** Create Config from an existing load() result. */
  static from<S extends EnvSchema>(config: EnvResult<S>): Config<S> {
    return new Config(config);
  }

  /**
   * Get value by key.
   * @param key - Schema key
   * @param defaultValue - Optional fallback when value is undefined
   */
  get<K extends keyof T>(key: K): EnvResult<T>[K] | undefined;
  get<K extends keyof T>(
    key: K,
    defaultValue: EnvResult<T>[K],
  ): EnvResult<T>[K];
  get<K extends keyof T>(
    key: K,
    defaultValue?: EnvResult<T>[K],
  ): EnvResult<T>[K] | undefined {
    const val = this.config[key];
    if (defaultValue !== undefined && val === undefined) return defaultValue;
    return val;
  }

  /** Get value by key, or throw if not set. */
  getOrThrow<K extends keyof T>(key: K): EnvResult<T>[K] {
    const val = this.config[key];
    if (val === undefined) {
      throw new Error(`Config key "${String(key)}" is not set`);
    }
    return val;
  }

  /** Check if key is set. */
  has(key: keyof T): boolean {
    return this.config[key] !== undefined;
  }

  /** Return a copy with secret values masked as '***'. */
  toSafeLog(): Record<string, string | number | boolean | undefined> {
    return this.config.toSafeLog();
  }

  /** Get the raw env result (no masking). */
  getRaw(): EnvResult<T> {
    return this.config;
  }
}
