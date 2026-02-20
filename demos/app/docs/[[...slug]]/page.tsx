import { notFound } from 'next/navigation';

const docsSlugs = ['', 'password', 'passphrase'] as const;

type Slug = (typeof docsSlugs)[number];

const docModules: Record<
  Slug,
  () => Promise<{ default: React.ComponentType }>
> = {
  '': () => import('@/content/docs/index.mdx'),
  password: () => import('@/content/docs/password.mdx'),
  passphrase: () => import('@/content/docs/passphrase.mdx'),
};

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
    <article className="max-w-3xl">
      <MDX />
    </article>
  );
}

export function generateStaticParams() {
  return docsSlugs.map((s) => ({ slug: s === '' ? [] : [s] }));
}
