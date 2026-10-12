export const docsNav = [
  {
    title: 'Introduction',
    href: '/docs',
  },
  {
    title: 'Packages',
    items: [
      { title: 'Env', href: '/docs/env' },
      { title: 'Password', href: '/docs/password' },
      { title: 'Passphrase', href: '/docs/passphrase' },
      { title: 'Token', href: '/docs/token' },
      { title: 'Hash', href: '/docs/hash' },
      { title: 'Cipher', href: '/docs/cipher' },
      { title: 'Id', href: '/docs/id' },
      { title: 'Rate Limit', href: '/docs/rate-limit' },
    ],
  },
  {
    title: 'Configs',
    items: [
      { title: 'ESLint', href: '/docs/eslint' },
      { title: 'TypeScript', href: '/docs/typescript' },
      { title: 'Runner', href: '/docs/runner' },
    ],
  },
  {
    title: 'Demos',
    items: [
      { title: 'Env Loader', href: '/env' },
      { title: 'Password Generator', href: '/password' },
      { title: 'Passphrase Generator', href: '/passphrase' },
      { title: 'Token Generator', href: '/token' },
      { title: 'Hash Playground', href: '/hash' },
      { title: 'Cipher Demo', href: '/cipher' },
      { title: 'ID Generator', href: '/id' },
      { title: 'Rate Limiter', href: '/rate-limit' },
    ],
  },
] as const;
