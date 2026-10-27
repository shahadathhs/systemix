/**
 * Demo-only caps for the public hash endpoint. Well below the library's own
 * safety bounds (Argon2 256 MiB, scrypt 256 MiB, PBKDF2 10M iterations).
 */
export const DEMO_LIMITS = {
  passwordLength: 128,
  argon2: { memoryCost: 65_536, timeCost: 4, parallelism: 4 },
  scrypt: { costFactor: 65_536 },
  pbkdf2: { iterations: 1_000_000 },
} as const;
