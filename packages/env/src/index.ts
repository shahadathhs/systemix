/**
 * @systemix/env – Typed environment variable loading and validation.
 * @packageDocumentation
 */

export type {
  EnvVarType,
  EnvVarSchema,
  EnvSchema,
  CheckedEnvSchema,
  EnvResult,
  LoadOptions,
  EnvVarStandardSchema,
  StandardSchemaV1,
  StandardSchemaResult,
} from './types';

export { parseEnvFile, load } from './env';
export { Config } from './config';
