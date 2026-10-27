'use server';

import {
  hashPassword,
  needsRehash,
  parseEncodedHash,
  verifyPassword,
  type HashAlgorithm,
} from '@systemix/hash';
import { createRateLimiter } from '@systemix/rate-limit';
import { headers } from 'next/headers';
import { DEMO_LIMITS } from './limits';

/**
 * Argon2id needs node:crypto, so hashing runs on the server. This is a public
 * endpoint: parameters are capped well below the library's own safety bounds,
 * and requests are rate limited per IP (best-effort, in-memory per instance).
 */
const limiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

export type HashParams = {
  algorithm: HashAlgorithm;
  memoryCost: number;
  timeCost: number;
  parallelism: number;
  costFactor: number;
  iterations: number;
};

type Fail = { ok: false; error: string };

async function checkRate(): Promise<Fail | null> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const r = await limiter.limit(`hash:${ip}`);
  return r.success
    ? null
    : {
        ok: false,
        error: `Rate limit reached. Retry in ${Math.ceil(r.retryAfter / 1000)}s.`,
      };
}

function withinLimits(params: HashParams): string | null {
  const { argon2, scrypt, pbkdf2 } = DEMO_LIMITS;
  if (params.algorithm === 'argon2id') {
    if (
      params.memoryCost > argon2.memoryCost ||
      params.timeCost > argon2.timeCost ||
      params.parallelism > argon2.parallelism
    ) {
      return 'Parameters exceed the demo limits.';
    }
  } else if (params.algorithm === 'scrypt') {
    if (params.costFactor > scrypt.costFactor) {
      return 'Parameters exceed the demo limits.';
    }
  } else if (params.iterations > pbkdf2.iterations) {
    return 'Parameters exceed the demo limits.';
  }
  return null;
}

export async function hashAction(
  password: string,
  params: HashParams,
): Promise<{ ok: true; encoded: string; ms: number } | Fail> {
  if (!password || password.length > DEMO_LIMITS.passwordLength) {
    return { ok: false, error: 'Password must be 1–128 characters.' };
  }
  const limited = withinLimits(params);
  if (limited) return { ok: false, error: limited };
  const rate = await checkRate();
  if (rate) return rate;

  try {
    const start = performance.now();
    const encoded = await hashPassword(password, {
      algorithm: params.algorithm,
      memoryCost: params.memoryCost,
      timeCost: params.timeCost,
      parallelism: params.parallelism,
      costFactor: params.costFactor,
      iterations: params.iterations,
    });
    return { ok: true, encoded, ms: Math.round(performance.now() - start) };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Hash failed.',
    };
  }
}

export async function verifyAction(
  password: string,
  encoded: string,
): Promise<
  | { ok: true; match: boolean; ms: number; rehash: boolean; legacy: boolean }
  | Fail
> {
  if (!password || password.length > DEMO_LIMITS.passwordLength) {
    return { ok: false, error: 'Password must be 1–128 characters.' };
  }
  if (encoded.length > 512) {
    return { ok: false, error: 'Hash is too long.' };
  }

  // Refuse parameters beyond the demo caps before doing any work.
  try {
    const p = parseEncodedHash(encoded);
    const { argon2, scrypt, pbkdf2 } = DEMO_LIMITS;
    const tooBig =
      (p.algorithm === 'argon2id' &&
        ((p.memoryCost ?? 0) > argon2.memoryCost ||
          (p.timeCost ?? 0) > argon2.timeCost ||
          (p.parallelism ?? 0) > argon2.parallelism)) ||
      (p.algorithm === 'scrypt' && (p.costFactor ?? 0) > scrypt.costFactor) ||
      (p.algorithm === 'pbkdf2' && (p.iterations ?? 0) > pbkdf2.iterations);
    if (tooBig)
      return { ok: false, error: 'Parameters exceed the demo limits.' };

    const rate = await checkRate();
    if (rate) return rate;

    const start = performance.now();
    const match = await verifyPassword(password, encoded);
    return {
      ok: true,
      match,
      ms: Math.round(performance.now() - start),
      rehash: needsRehash(encoded),
      legacy: p.format === 'legacy',
    };
  } catch {
    return { ok: false, error: 'Not a valid encoded hash.' };
  }
}
