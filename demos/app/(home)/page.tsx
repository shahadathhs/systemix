'use client';

import { CodeWindow } from '@/components/CodeWindow';
import { GithubIcon } from '@/components/brand-icons';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const packages = [
  {
    name: '@systemix/env',
    description: 'Typed environment variable loading and validation.',
    href: '/docs/env',
  },
  {
    name: '@systemix/password',
    description: 'Cryptographically secure password generator.',
    href: '/docs/password',
  },
  {
    name: '@systemix/passphrase',
    description: 'Memorable passphrases with crypto-grade randomness.',
    href: '/docs/passphrase',
  },
  {
    name: '@systemix/token',
    description: 'Token generation and HMAC/RSA signed tokens.',
    href: '/docs/token',
  },
  {
    name: '@systemix/hash',
    description: 'Password hashing and verification with PBKDF2 and scrypt.',
    href: '/docs/hash',
  },
  {
    name: '@systemix/cipher',
    description: 'Authenticated AES-256-GCM encryption for data at rest.',
    href: '/docs/cipher',
  },
  {
    name: '@systemix/id',
    description: 'UUID v4, ULID, and nanoid-style identifiers.',
    href: '/docs/id',
  },
  {
    name: '@systemix/rate-limit',
    description: 'Rate limiting with pluggable stores and middleware.',
    href: '/docs/rate-limit',
  },
];

const tooling = [
  {
    name: '@systemix/eslint',
    description: 'ESLint v10 flat configs',
    href: '/docs/eslint',
  },
  {
    name: '@systemix/typescript',
    description: 'Base tsconfig presets',
    href: '/docs/typescript',
  },
  {
    name: '@systemix/runner',
    description: 'Minimal test runner',
    href: '/docs/runner',
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      {/* Hero — centered statement with terminal anchor */}
      <section className="px-6 sm:px-10 pt-16 sm:pt-24 pb-16 text-center border-b border-zinc-200">
        <div className="max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-mono text-zinc-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            TypeScript 7 · zero dependencies
          </span>

          <h1 className="mt-6 text-5xl sm:text-6xl font-bold tracking-tighter text-zinc-950">
            The security toolkit
            <br />
            for modern JS.
          </h1>

          <p className="mt-5 text-lg text-zinc-600 leading-relaxed max-w-xl mx-auto">
            Typed env loading, crypto-grade passwords, hashing, encryption, IDs
            and rate limiting — eleven packages, zero runtime dependencies.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/docs" className="btn btn-primary h-11 px-6">
              Get started
            </Link>
            <a
              href="https://github.com/shahadathhs/systemix"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost h-11 px-5"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
          </div>

          <div className="mt-12 text-left">
            <CodeWindow
              filename="quickstart.ts"
              code={`import { load } from '@systemix/env';
import { generatePassword } from '@systemix/password';
import { hashPassword, verifyPassword } from '@systemix/hash';

const env = load({ PORT: { type: 'number', default: 3000 } });

const password = generatePassword({ length: 16 });
const encoded = await hashPassword(password);

await verifyPassword(password, encoded); // true`}
            />
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 sm:px-10 py-16 border-b border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                Packages
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Published to npm under the{' '}
                <code className="font-mono text-[0.8125rem] bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5">
                  @systemix
                </code>{' '}
                scope.
              </p>
            </div>
            <Link
              href="/docs"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              Browse docs
              <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {packages.map((pkg) => (
              <Link
                key={pkg.name}
                href={pkg.href}
                className="panel p-4 group hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[13px] font-medium text-zinc-950">
                    {pkg.name.replace('@systemix/', '')}
                  </span>
                  <ArrowRight className="size-3 text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="mt-1.5 text-[13px] text-zinc-600 leading-relaxed">
                  {pkg.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tooling */}
      <section className="px-6 sm:px-10 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
            Tooling
          </h2>
          <p className="mt-1 text-sm text-zinc-600 mb-6">
            Shareable configs and the test runner the packages are built with.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {tooling.map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="panel p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
              >
                <div className="font-mono text-[13px] font-medium text-zinc-950">
                  {tool.name}
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  {tool.description}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
