import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const docsSlugs = [
  '',
  'password',
  'passphrase',
  'token',
  'eslint',
  'typescript',
] as const;

type Slug = (typeof docsSlugs)[number];

const docMeta: Record<Slug, { title: string; description: string }> = {
  '': {
    title: 'Documentation',
    description:
      'Systemix documentation. Cryptographically secure password and passphrase generators for JavaScript and TypeScript.',
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
      'API reference for @systemix/token. Secure token generator with hex, base64, base64url, alphanumeric charsets and encoding utilities.',
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
};

const docModules: Record<
  Slug,
  () => Promise<{ default: React.ComponentType }>
> = {
  '': () => import('@/docs/index.mdx'),
  password: () => import('@/docs/password.mdx'),
  passphrase: () => import('@/docs/passphrase.mdx'),
  token: () => import('@/docs/token.mdx'),
  eslint: () => import('@/docs/eslint.mdx'),
  typescript: () => import('@/docs/typescript.mdx'),
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
