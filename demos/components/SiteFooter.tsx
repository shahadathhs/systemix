import Link from 'next/link';

const columns = [
  {
    title: 'Packages',
    links: [
      { label: 'env', href: '/docs/env' },
      { label: 'password', href: '/docs/password' },
      { label: 'passphrase', href: '/docs/passphrase' },
      { label: 'token', href: '/docs/token' },
      { label: 'hash', href: '/docs/hash' },
      { label: 'cipher', href: '/docs/cipher' },
      { label: 'id', href: '/docs/id' },
      { label: 'rate-limit', href: '/docs/rate-limit' },
    ],
  },
  {
    title: 'Tooling',
    links: [
      { label: 'ESLint config', href: '/docs/eslint' },
      { label: 'TypeScript config', href: '/docs/typescript' },
      { label: 'Test runner', href: '/docs/runner' },
    ],
  },
  {
    title: 'Demos',
    links: [
      { label: 'Password', href: '/password' },
      { label: 'Hash', href: '/hash' },
      { label: 'Cipher', href: '/cipher' },
      { label: 'Rate limiter', href: '/rate-limit' },
      { label: 'All demos', href: '/env' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'GitHub', href: 'https://github.com/shahadathhs/systemix' },
      { label: 'npm org', href: 'https://www.npmjs.com/org/systemix' },
      {
        label: 'MIT License',
        href: 'https://github.com/shahadathhs/systemix/blob/main/LICENSE',
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t" style={{ borderColor: 'var(--line)' }}>
      <div className="max-w-[1280px] mx-auto border-x px-6 sm:px-10 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <div className="hud mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith('/') ? (
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-14 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'var(--line)' }}
        >
          <span className="text-xs text-zinc-500">
            © {new Date().getFullYear()} Shahadath Hossen Sajib. MIT License.
          </span>
          <span className="hud">made for builders · zero deps</span>
        </div>
      </div>
    </footer>
  );
}
