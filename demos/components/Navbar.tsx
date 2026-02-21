'use client';

import {
  ExternalLink,
  Github,
  KeyRound,
  Lock,
  Menu,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const navLinks: { href: string; label: string; icon?: typeof Lock }[] = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
  { href: '/password', label: 'Password', icon: Lock },
  { href: '/passphrase', label: 'Passphrase', icon: KeyRound },
  { href: '/token', label: 'Token', icon: Shield },
];

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
          >
            <Shield className="w-7 h-7 text-blue-500" />
            <span className="font-bold text-lg tracking-tight text-white hidden sm:inline">
              Systemix
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href ||
                  (href !== '/' && pathname?.startsWith(href))
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-white/5',
              )}
            >
              {Icon && <Icon className="w-4 h-4 opacity-70" />}
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/shahadathhs/systemix"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            v0.2.0
          </span>
        </div>
      </div>
    </header>
  );
}
