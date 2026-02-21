import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

const docsSlugs = ['', 'password', 'passphrase'] as const;

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
};

const docModules: Record<
  Slug,
  () => Promise<{ default: React.ComponentType }>
> = {
  '': () => import('@/content/docs/index.mdx'),
  password: () => import('@/content/docs/password.mdx'),
  passphrase: () => import('@/content/docs/passphrase.mdx'),
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
