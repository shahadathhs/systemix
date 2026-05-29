/**
 * @systemix/env – Typed environment variable loading and validation.
 * @packageDocumentation
 */

export type {
  EnvVarType,
  EnvVarSchema,
  EnvSchema,
  EnvResult,
  LoadOptions,
} from './types/index.js';

export { parseEnvFile, load } from './env/index.js';
export { Config } from './config.js';
