'use client';

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  Github,
  KeyRound,
  Lock,
  Shield,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-3 rounded-lg hover:bg-slate-800/50 hover:text-slate-400 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 transition-transform" />
        ) : (
          <ChevronRight className="w-4 h-4 transition-transform" />
        )}
        {title}
      </button>
      {open && <div className="pl-2">{children}</div>}
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const linkClass = (href: string, exact?: boolean) => {
    const active = exact
      ? pathname === href
      : pathname === href || pathname?.startsWith(href + '/');
    return cn(
      'flex items-center gap-2 text-sm py-2.5 px-3 rounded-lg transition-colors',
      active
        ? 'bg-cyan-500/10 text-cyan-400 font-medium'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
    );
  };

  const linkProps = (href: string) =>
    href.startsWith('http') ? {} : { onClick: onNavigate };

  return (
    <>
      <div className="space-y-1 pb-4 border-b border-slate-700/80 mb-4">
        <Link href="/" className={linkClass('/', true)} {...linkProps('/')}>
          <FileText className="w-4 h-4 shrink-0 opacity-70" />
          Home
        </Link>
        <Link
          href="/docs"
          className={linkClass('/docs', true)}
          {...linkProps('/docs')}
        >
          <BookOpen className="w-4 h-4 shrink-0 opacity-70" />
          Overview
        </Link>
        <Link
          href="/about"
          className={linkClass('/about', true)}
          {...linkProps('/about')}
        >
          <User className="w-4 h-4 shrink-0 opacity-70" />
          About
        </Link>
      </div>

      <div className="space-y-2">
        <CollapsibleSection title="Documentation" defaultOpen>
          <ul className="space-y-0.5 pt-1">
            <li>
              <Link
                href="/docs/password"
                className={linkClass('/docs/password', true)}
                {...linkProps('/docs/password')}
              >
                <Lock className="w-4 h-4 shrink-0 opacity-70" />
                Password
              </Link>
            </li>
            <li>
              <Link
                href="/docs/passphrase"
                className={linkClass('/docs/passphrase', true)}
                {...linkProps('/docs/passphrase')}
              >
                <KeyRound className="w-4 h-4 shrink-0 opacity-70" />
                Passphrase
              </Link>
            </li>
            <li>
              <Link
                href="/docs/token"
                className={linkClass('/docs/token', true)}
                {...linkProps('/docs/token')}
              >
                <Shield className="w-4 h-4 shrink-0 opacity-70" />
                Token
              </Link>
            </li>
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Live Demos" defaultOpen>
          <ul className="space-y-0.5 pt-1">
            <li>
              <Link
                href="/password"
                className={linkClass('/password', true)}
                {...linkProps('/password')}
              >
                <Lock className="w-4 h-4 shrink-0 opacity-70" />
                Password
              </Link>
            </li>
            <li>
              <Link
                href="/passphrase"
                className={linkClass('/passphrase', true)}
                {...linkProps('/passphrase')}
              >
                <KeyRound className="w-4 h-4 shrink-0 opacity-70" />
                Passphrase
              </Link>
            </li>
            <li>
              <Link
                href="/token"
                className={linkClass('/token', true)}
                {...linkProps('/token')}
              >
                <Shield className="w-4 h-4 shrink-0 opacity-70" />
                Token
              </Link>
            </li>
          </ul>
        </CollapsibleSection>

        <a
          href="https://github.com/shahadathhs/systemix"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white py-2.5 px-3 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          <Github className="w-4 h-4 shrink-0" />
          GitHub
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700/80">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          v0.2.0
        </span>
      </div>
    </>
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
    const handler = () => setOpen(false);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [setOpen]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Mobile overlay - above navbar (z-[60]) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - drawer on mobile (above navbar), sticky on desktop */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 lg:top-14 left-0 z-[60] lg:z-40 w-72 shrink-0',
          'h-screen lg:h-[calc(100vh-3.5rem)]',
          'bg-background/95 lg:bg-background border-r border-slate-800/80',
          'flex flex-col p-4 overflow-y-auto scrollbar-hide',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800/50 text-slate-400"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <nav className="flex-1 pt-4">
          <NavContent onNavigate={() => setOpen(false)} />
        </nav>
      </aside>
    </>
  );
}
