export const docsNav = [
  {
    title: 'Introduction',
    href: '/docs',
  },
  {
    title: 'Packages',
    items: [
      { title: 'Password', href: '/docs/password' },
      { title: 'Passphrase', href: '/docs/passphrase' },
      { title: 'Token', href: '/docs/token' },
    ],
  },
  {
    title: 'Configs',
    items: [
      { title: 'ESLint', href: '/docs/eslint' },
      { title: 'TypeScript', href: '/docs/typescript' },
    ],
  },
  {
    title: 'Demos',
    items: [
      { title: 'Password Generator', href: '/password' },
      { title: 'Passphrase Generator', href: '/passphrase' },
      { title: 'Token Generator', href: '/token' },
    ],
  },
] as const;
