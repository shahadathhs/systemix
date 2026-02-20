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
    ],
  },
  {
    title: 'Demos',
    items: [
      { title: 'Password Generator', href: '/password' },
      { title: 'Passphrase Generator', href: '/passphrase' },
    ],
  },
] as const;
