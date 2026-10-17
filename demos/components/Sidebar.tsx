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
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          <div className="label mb-2">{section.title}</div>
          <ul className="space-y-0.5">
            {section.items.map(({ href, label }) => {
              const active =
                pathname === href || pathname?.startsWith(href + '/');
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      'block py-1.5 px-2 rounded-md text-sm transition-colors',
                      active
                        ? 'text-zinc-950 font-medium bg-zinc-100'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50',
                    )}
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
        className="flex items-center gap-2 py-1.5 px-2 rounded-md text-sm text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
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
          'fixed lg:sticky top-0 lg:top-14 left-0 z-[60] lg:z-30 w-64 shrink-0',
          'h-screen lg:h-[calc(100vh-3.5rem)]',
          'bg-white border-r border-zinc-200',
          'flex flex-col p-4 overflow-y-auto scrollbar-hide',
          'transition-transform duration-200',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="text-sm font-semibold text-zinc-950">Systemix</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
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
