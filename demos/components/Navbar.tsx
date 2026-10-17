'use client';

import Link from 'next/link';
import { GithubIcon } from '@/components/brand-icons';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Menu } from 'lucide-react';

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-sm"
      style={{
        borderColor: 'var(--line)',
        background: 'color-mix(in srgb, var(--bg) 92%, transparent)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden -ml-2 p-2 transition-colors hover:bg-sunken"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        {/* Logo is the home link */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Logo size={22} />
          <span className="font-display text-[15px] text-ink">Systemix</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <ThemeToggle />
          <a
            href="https://github.com/shahadathhs/systemix"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-faint hover:text-ink transition-colors"
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
