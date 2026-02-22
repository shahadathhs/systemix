'use client';

import {
  BookOpen,
  ExternalLink,
  Github,
  Home,
  Menu,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const navLinks: { href: string; label: string; icon: typeof Home }[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/docs', label: 'Docs', icon: BookOpen },
  { href: '/about', label: 'About', icon: User },
];

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-14 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-800/50 text-white transition-colors shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0"
          >
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
            <span className="font-bold text-base sm:text-lg tracking-tight text-white hidden sm:inline">
              Systemix
            </span>
          </Link>
        </div>

        <nav className="flex items-center gap-0.5 sm:gap-1 min-w-0 flex-1 justify-center overflow-x-auto scrollbar-hide">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0',
                pathname === href ||
                  (href !== '/' && pathname?.startsWith(href))
                  ? 'text-cyan-400 bg-cyan-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
              )}
              title={label}
            >
              <Icon className="w-4 h-4 shrink-0 opacity-80" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <a
            href="https://github.com/shahadathhs/systemix"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="w-3 h-3 opacity-60 hidden sm:inline" />
          </a>
        </div>
      </div>
    </header>
  );
}
