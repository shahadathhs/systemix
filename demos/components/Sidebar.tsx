'use client';

import Link from 'next/link';
import { GithubIcon } from '@/components/brand-icons';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { X } from 'lucide-react';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const sections = [
  {
    title: 'Guide',
    items: [
      { href: '/docs', label: 'Introduction' },
      { href: '/docs/eslint', label: 'ESLint Config' },
      { href: '/docs/typescript', label: 'TypeScript Config' },
      { href: '/docs/runner', label: 'Test Runner' },
      { href: '/docs/security', label: 'Security & support' },
    ],
  },
  {
    title: 'Packages',
    items: [
      { href: '/docs/env', label: 'env' },
      { href: '/docs/password', label: 'password' },
      { href: '/docs/passphrase', label: 'passphrase' },
      { href: '/docs/token', label: 'token' },
      { href: '/docs/hash', label: 'hash' },
      { href: '/docs/cipher', label: 'cipher' },
      { href: '/docs/id', label: 'id' },
      { href: '/docs/rate-limit', label: 'rate-limit' },
    ],
  },
  {
    title: 'Demos',
    items: [
      { href: '/env', label: 'Env Loader' },
      { href: '/password', label: 'Password' },
      { href: '/passphrase', label: 'Passphrase' },
      { href: '/token', label: 'Token' },
      { href: '/hash', label: 'Hash' },
      { href: '/cipher', label: 'Cipher' },
      { href: '/id', label: 'ID' },
      { href: '/rate-limit', label: 'Rate Limit' },
    ],
  },
] as const;

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-7">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="hud mb-2.5 px-2">{section.title}</div>
          <ul>
            {section.items.map(({ href, label }) => {
              // Sidebar items map 1:1 to pages — exact match only, so
              // /docs/cipher never highlights the /docs introduction too
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      'block py-1.5 px-2 text-sm transition-colors border-l-2 -ml-px hover:bg-sunken',
                      active
                        ? 'text-ink font-medium'
                        : 'text-faint hover:text-ink',
                    )}
                    style={
                      active
                        ? { borderColor: 'var(--accent)' }
                        : { borderColor: 'transparent' }
                    }
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <a
        href="https://github.com/shahadathhs/systemix"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 py-1.5 px-2 text-sm text-faint hover:text-ink transition-colors"
      >
        <GithubIcon className="size-3.5" />
        GitHub
      </a>
    </nav>
  );
}

export function Sidebar({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-zinc-950/20"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-14 left-0 z-[60] lg:z-30 w-60 shrink-0',
          'h-screen lg:h-[calc(100vh-3.5rem)]',
          'border-r flex flex-col p-4 overflow-y-auto scrollbar-hide',
          'transition-transform duration-200',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: 'var(--bg)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <span className="font-display text-sm text-ink">Systemix</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 text-faint hover:text-ink hover:bg-sunken"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <NavContent onNavigate={() => setOpen(false)} />
      </aside>
    </>
  );
}
