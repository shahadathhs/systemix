'use client';

import { CodeBlock } from '@/components/CodeBlock';
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
  { name: '@systemix/eslint', description: 'ESLint v10 flat configs', href: '/docs/eslint' },
  { name: '@systemix/typescript', description: 'Base tsconfig presets', href: '/docs/typescript' },
  { name: '@systemix/runner', description: 'Minimal test runner', href: '/docs/runner' },
];

export default function Home() {
  return (
    <div className="max-w-4xl">
      {/* Hero */}
      <section className="pt-10 pb-16">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter text-zinc-950">
          Systemix
        </h1>
        <p className="mt-5 text-xl text-zinc-600 leading-relaxed max-w-2xl">
          A modular toolkit for secure JavaScript and TypeScript systems.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Zero dependencies · Web Crypto under the hood · Tree-shakeable ESM
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link href="/docs" className="btn btn-primary h-11 px-5">
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
      </section>

      {/* Quick start */}
      <section className="pb-16">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
          Quick start
        </h2>
        <p className="mt-1.5 text-sm text-zinc-600">
          Install what you need — every package is independent.
        </p>
        <CodeBlock>
          <code>{'npm install @systemix/env @systemix/password @systemix/hash'}</code>
        </CodeBlock>
        <CodeBlock>
          <code>{`import { load } from '@systemix/env';
import { generatePassword } from '@systemix/password';
import { hashPassword, verifyPassword } from '@systemix/hash';

const env = load({ PORT: { type: 'number', default: 3000 } });

const password = generatePassword({ length: 16 });
const encoded = await hashPassword(password);
await verifyPassword(password, encoded); // true`}</code>
        </CodeBlock>
      </section>

      {/* Packages */}
      <section className="pb-16">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
          Packages
        </h2>
        <p className="mt-1.5 mb-5 text-sm text-zinc-600">
          Published to npm under the{' '}
          <code className="font-mono text-[0.8125rem] bg-zinc-100 border border-zinc-200 rounded px-1.5 py-0.5">
            @systemix
          </code>{' '}
          scope.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {packages.map((pkg) => (
            <Link
              key={pkg.name}
              href={pkg.href}
              className="panel p-5 group hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-medium text-zinc-950">
                  {pkg.name}
                </span>
                <ArrowRight className="size-3.5 text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {pkg.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tooling */}
      <section className="pb-20">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
          Tooling
        </h2>
        <p className="mt-1.5 mb-5 text-sm text-zinc-600">
          Shareable configs and the test runner the packages are built with.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {tooling.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className="panel p-5 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className="font-mono text-sm font-medium text-zinc-950">
                {tool.name}
              </div>
              <div className="text-xs text-zinc-500 mt-1.5">
                {tool.description}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
