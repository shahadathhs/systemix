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

export default function Home() {
  return (
    <div className="max-w-3xl">
      {/* Hero */}
      <section className="pt-6 pb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-zinc-950">
          Systemix
        </h1>
        <p className="mt-4 text-lg text-zinc-600 leading-relaxed max-w-xl">
          A modular toolkit for secure JavaScript and TypeScript systems. Zero
          dependencies, Web Crypto under the hood, tree-shakeable ESM.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Link href="/docs" className="btn btn-primary">
            Get started
          </Link>
          <a
            href="https://github.com/shahadathhs/systemix"
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </div>
      </section>

      {/* Quick start */}
      <section className="pb-12">
        <h2 className="section-title mb-1">Quick start</h2>
        <p className="text-sm text-zinc-600 mb-3">
          Install what you need. Every package is independent.
        </p>
        <CodeBlock>
          <code>{`npm install @systemix/env @systemix/password @systemix/hash`}</code>
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
      <section className="pb-12">
        <h2 className="section-title mb-1">Packages</h2>
        <p className="text-sm text-zinc-600 mb-4">
          Published to npm under the{' '}
          <code className="font-mono text-[0.8125rem] bg-zinc-100 border border-zinc-200 rounded px-1 py-0.5">
            @systemix
          </code>{' '}
          scope.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {packages.map((pkg) => (
            <Link
              key={pkg.name}
              href={pkg.href}
              className="panel p-4 group hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] font-medium text-zinc-950">
                  {pkg.name}
                </span>
                <ArrowRight className="size-3.5 text-zinc-300 group-hover:text-zinc-950 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
                {pkg.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Tooling */}
      <section className="pb-16">
        <h2 className="section-title mb-1">Tooling</h2>
        <p className="text-sm text-zinc-600 mb-4">
          Shareable configs and the test runner the packages are built with.
        </p>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { name: '@systemix/eslint', href: '/docs/eslint' },
            { name: '@systemix/typescript', href: '/docs/typescript' },
            { name: '@systemix/runner', href: '/docs/runner' },
          ].map(({ name, href }) => (
            <Link
              key={name}
              href={href}
              className="panel p-4 font-mono text-[13px] font-medium text-zinc-950 hover:border-zinc-300 transition-colors"
            >
              {name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
