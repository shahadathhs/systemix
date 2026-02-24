'use client';

import {
  BookOpen,
  Braces,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileCode,
  FileText,
  Github,
  KeyRound,
  Lock,
  Settings,
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

const iconShortcuts = [
  { href: '/', icon: FileText, title: 'Home' },
  { href: '/docs', icon: BookOpen, title: 'Docs' },
  { href: '/about', icon: User, title: 'About' },
  {
    href: 'https://github.com/shahadathhs/systemix',
    icon: Github,
    title: 'GitHub',
  },
] as const;

const mainNav = [
  { href: '/', icon: FileText, label: 'Home', exact: true },
  { href: '/docs', icon: BookOpen, label: 'Overview', exact: true },
  { href: '/about', icon: User, label: 'About', exact: true },
] as const;

const docItems = [
  { href: '/docs/env', icon: Settings, label: 'Env' },
  { href: '/docs/password', icon: Lock, label: 'Password' },
  { href: '/docs/passphrase', icon: KeyRound, label: 'Passphrase' },
  { href: '/docs/token', icon: Shield, label: 'Token' },
  { href: '/docs/eslint', icon: FileCode, label: 'ESLint' },
  { href: '/docs/typescript', icon: Braces, label: 'TypeScript' },
] as const;

const demoItems = [
  { href: '/env', icon: Settings, label: 'Env' },
  { href: '/password', icon: Lock, label: 'Password' },
  { href: '/passphrase', icon: KeyRound, label: 'Passphrase' },
  { href: '/token', icon: Shield, label: 'Token' },
] as const;

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
      {/* Icon section - visible only on sm (mobile drawer) */}
      <div className="lg:hidden flex gap-2 pb-4 mb-4 border-b border-slate-700/80">
        {iconShortcuts.map(({ href, icon: Icon, title }) => {
          const external = href.startsWith('http');
          const isActive =
            !external &&
            (pathname === href || pathname?.startsWith(href + '/'));
          const baseClass =
            'p-2.5 rounded-lg transition-colors ' +
            (isActive
              ? 'bg-cyan-500/10 text-cyan-400'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50');
          return external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={baseClass}
              title={title}
            >
              <Icon className="w-5 h-5" />
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className={baseClass}
              {...linkProps(href)}
              title={title}
            >
              <Icon className="w-5 h-5" />
            </Link>
          );
        })}
      </div>

      <div className="space-y-1 pb-4 border-b border-slate-700/80 mb-4">
        {mainNav.map(({ href, icon: Icon, label, exact }) => (
          <Link
            key={href}
            href={href}
            className={linkClass(href, exact)}
            {...linkProps(href)}
          >
            <Icon className="w-4 h-4 shrink-0 opacity-70" />
            {label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <CollapsibleSection title="Documentation" defaultOpen>
          <ul className="space-y-0.5 pt-1">
            {docItems.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={linkClass(href, true)}
                  {...linkProps(href)}
                >
                  <Icon className="w-4 h-4 shrink-0 opacity-70" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection title="Live Demos" defaultOpen>
          <ul className="space-y-0.5 pt-1">
            {demoItems.map(({ href, icon: Icon, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={linkClass(href, true)}
                  {...linkProps(href)}
                >
                  <Icon className="w-4 h-4 shrink-0 opacity-70" />
                  {label}
                </Link>
              </li>
            ))}
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
