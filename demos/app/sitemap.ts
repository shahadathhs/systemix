import type { MetadataRoute } from 'next';

const siteUrl = 'https://systemix.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const docs = [
    '',
    '/docs',
    '/docs/env',
    '/docs/password',
    '/docs/passphrase',
    '/docs/token',
    '/docs/hash',
    '/docs/cipher',
    '/docs/id',
    '/docs/rate-limit',
    '/docs/eslint',
    '/docs/typescript',
    '/docs/runner',
  ];
  const demos = [
    '/env',
    '/password',
    '/passphrase',
    '/token',
    '/hash',
    '/cipher',
    '/id',
    '/rate-limit',
  ];

  return [...docs, ...demos].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/docs' ? 0.9 : 0.7,
  }));
}
