'use server';

import {
  decodeSigned,
  encodeSigned,
  verifySigned,
  type SignedAlgorithm,
} from '@systemix/token/signed';
import { createRateLimiter } from '@systemix/rate-limit';
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { headers } from 'next/headers';
import { DEMO_ALGORITHMS, type DemoAlgorithm } from './limits';

/**
 * Signing needs node:crypto, so it runs on the server. Public endpoint:
 * inputs are size-capped and requests are rate limited per IP (best-effort,
 * in-memory per instance). Keys generated here are throwaway demo keys.
 */
const limiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

type Fail = { ok: false; error: string };

async function guard(...inputs: string[]): Promise<Fail | null> {
  if (inputs.some((v) => v.length > 8_192)) {
    return { ok: false, error: 'Input too large for the demo.' };
  }
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const r = await limiter.limit(`token:${ip}`);
  return r.success
    ? null
    : {
        ok: false,
        error: `Rate limit reached. Retry in ${Math.ceil(r.retryAfter / 1000)}s.`,
      };
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

function isDemoAlgorithm(alg: string): alg is DemoAlgorithm {
  return (DEMO_ALGORITHMS as readonly string[]).includes(alg);
}

const pem = { type: 'spki', format: 'pem' } as const;
const pkcs8 = { type: 'pkcs8', format: 'pem' } as const;

export async function generateKeyAction(
  alg: string,
): Promise<{ ok: true; signKey: string; verifyKey: string } | Fail> {
  if (!isDemoAlgorithm(alg)) return { ok: false, error: 'Unsupported algorithm.' };
  const rate = await guard();
  if (rate) return rate;

  if (alg === 'HS256') {
    const secret = randomBytes(32).toString('base64url');
    return { ok: true, signKey: secret, verifyKey: secret };
  }
  const pair =
    alg === 'ES256'
      ? generateKeyPairSync('ec', {
          namedCurve: 'P-256',
          publicKeyEncoding: pem,
          privateKeyEncoding: pkcs8,
        })
      : alg === 'EdDSA'
        ? generateKeyPairSync('ed25519', {
            publicKeyEncoding: pem,
            privateKeyEncoding: pkcs8,
          })
        : generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: pem,
            privateKeyEncoding: pkcs8,
          });
  return { ok: true, signKey: pair.privateKey, verifyKey: pair.publicKey };
}

export async function encodeAction(
  payloadJson: string,
  alg: string,
  key: string,
  expiresIn: number,
  kid: string,
): Promise<{ ok: true; token: string } | Fail> {
  if (!isDemoAlgorithm(alg)) return { ok: false, error: 'Unsupported algorithm.' };
  const rate = await guard(payloadJson, key, kid);
  if (rate) return rate;

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(payloadJson);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { ok: false, error: 'Payload must be a JSON object.' };
    }
    payload = parsed as Record<string, unknown>;
  } catch {
    return { ok: false, error: 'Payload is not valid JSON.' };
  }

  try {
    const token = await encodeSigned(payload, key.trim(), {
      algorithm: alg,
      expiresIn: expiresIn > 0 ? Math.min(expiresIn, 31_536_000) : undefined,
      kid: kid.trim() || undefined,
    });
    return { ok: true, token };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

export async function decodeAction(
  token: string,
): Promise<{ ok: true; header: unknown; payload: unknown } | Fail> {
  const rate = await guard(token);
  if (rate) return rate;
  try {
    const { header, payload } = decodeSigned(token.trim());
    return { ok: true, header, payload };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}

export async function verifyAction(
  token: string,
  key: string,
  alg: string,
): Promise<{ ok: true; payload: unknown } | Fail> {
  if (!isDemoAlgorithm(alg)) return { ok: false, error: 'Unsupported algorithm.' };
  const rate = await guard(token, key);
  if (rate) return rate;
  try {
    // The demo accepts exactly the algorithm you pick — never the token's own
    // `alg` header. That is the rule the library enforces.
    const payload = await verifySigned(token.trim(), key.trim(), {
      algorithms: [alg satisfies SignedAlgorithm],
    });
    return { ok: true, payload };
  } catch (e) {
    return { ok: false, error: message(e) };
  }
}
