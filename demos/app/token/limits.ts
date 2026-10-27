export const DEMO_ALGORITHMS = [
  'HS256',
  'ES256',
  'EdDSA',
  'PS256',
  'RS256',
] as const;
export type DemoAlgorithm = (typeof DEMO_ALGORITHMS)[number];
