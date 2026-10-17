'use client';

import Link from 'next/link';
import { GithubIcon } from '@/components/brand-icons';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
] as const;

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden -ml-2 p-2 transition-colors hover:bg-zinc-950/5"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex size-6 items-center justify-center bg-zinc-950 text-[12px] font-bold text-white">
            S
          </span>
          <span className="font-display text-[15px] text-zinc-950">
            Systemix
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors',
                  active
                    ? 'text-zinc-950'
                    : 'text-zinc-500 hover:text-zinc-950',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <a
            href="https://github.com/shahadathhs/systemix"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 hover:text-zinc-950 transition-colors"
          >
            <GithubIcon className="size-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <Link
            href="/docs"
            className="btn btn-primary hidden sm:inline-flex !h-8 !px-3"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
