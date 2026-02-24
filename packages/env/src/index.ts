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
} from './types';

export { parseEnvFile, load } from './env';
export { Config } from './config';
