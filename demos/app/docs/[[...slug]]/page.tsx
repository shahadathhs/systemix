import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const docsSlugs = [
  '',
  'env',
  'password',
  'passphrase',
  'token',
  'hash',
  'cipher',
  'id',
  'rate-limit',
  'eslint',
  'typescript',
  'runner',
] as const;

type Slug = (typeof docsSlugs)[number];

const docMeta: Record<Slug, { title: string; description: string }> = {
  '': {
    title: 'Documentation',
    description:
      'Systemix documentation. Cryptographically secure password and passphrase generators for JavaScript and TypeScript.',
  },
  env: {
    title: '@systemix/env',
    description:
      'Typed environment variable loading and validation with .env file support.',
  },
  password: {
    title: '@systemix/password',
    description:
      'API reference for @systemix/password. Cryptographically secure password generator with customizable complexity and entropy tools.',
  },
  passphrase: {
    title: '@systemix/passphrase',
    description:
      'API reference for @systemix/passphrase. Secure, memorable passphrase generator using high-entropy word lists.',
  },
  token: {
    title: '@systemix/token',
    description:
      'API reference for @systemix/token. Secure token generator and hardened JWS signing (HS, RS, PS, ES, EdDSA).',
  },
  hash: {
    title: '@systemix/hash',
    description:
      'API reference for @systemix/hash. Argon2id password hashing in PHC format, with scrypt and PBKDF2 support.',
  },
  cipher: {
    title: '@systemix/cipher',
    description:
      'API reference for @systemix/cipher. Authenticated AES-256-GCM encryption with a versioned envelope and key rotation.',
  },
  id: {
    title: '@systemix/id',
    description:
      'API reference for @systemix/id. UUIDv7, UUID v4, ULID, and nanoid-style ID generation with crypto-grade randomness.',
  },
  'rate-limit': {
    title: '@systemix/rate-limit',
    description:
      'API reference for @systemix/rate-limit. Fixed-window, sliding-window, and token-bucket rate limiting with Express middleware.',
  },
  eslint: {
    title: '@systemix/eslint',
    description:
      'Shareable ESLint v10 flat configs for JavaScript, TypeScript, React, Express, and Next.js.',
  },
  typescript: {
    title: '@systemix/typescript',
    description:
      'Shareable TypeScript configs for base, Express, and Next.js projects.',
  },
  runner: {
    title: '@systemix/runner',
    description:
      'Minimal test runner for Systemix packages. assert, assertThrows, createRunner, runSuites.',
  },
};

const docModules: Record<
  Slug,
  () => Promise<{ default: React.ComponentType }>
> = {
  '': () => import('../../../docs/index.mdx'),
  env: () => import('../../../docs/env.mdx'),
  password: () => import('../../../docs/password.mdx'),
  passphrase: () => import('../../../docs/passphrase.mdx'),
  token: () => import('../../../docs/token.mdx'),
  hash: () => import('../../../docs/hash.mdx'),
  cipher: () => import('../../../docs/cipher.mdx'),
  id: () => import('../../../docs/id.mdx'),
  'rate-limit': () => import('../../../docs/rate-limit.mdx'),
  eslint: () => import('../../../docs/eslint.mdx'),
  typescript: () => import('../../../docs/typescript.mdx'),
  runner: () => import('../../../docs/runner.mdx'),
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const path = (slug?.join('/') ?? '') as Slug;
  const validSlug = docsSlugs.includes(path);
  const meta = validSlug ? docMeta[path] : docMeta[''];
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: `${meta.title} | Systemix Demos`,
      description: meta.description,
    },
    twitter: {
      title: `${meta.title} | Systemix Demos`,
      description: meta.description,
    },
  };
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const path = (slug?.join('/') ?? '') as Slug;

  const validSlug = docsSlugs.includes(path);
  if (!validSlug) notFound();

  const { default: MDX } = await docModules[path]();

  return (
    <article>
      <MDX />
    </article>
  );
}

export function generateStaticParams() {
  return docsSlugs.map((s) => ({ slug: s === '' ? [] : [s] }));
}
