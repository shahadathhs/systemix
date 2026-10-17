'use client';

import { CodeWindow } from '@/components/CodeWindow';
import { GithubIcon } from '@/components/brand-icons';
import Link from 'next/link';

const packages = [
  { name: '@systemix/env', description: 'Typed env loading and validation.' },
  {
    name: '@systemix/password',
    description: 'Crypto-secure password generator.',
  },
  {
    name: '@systemix/passphrase',
    description: 'Memorable passphrases, 7,776-word list.',
  },
  {
    name: '@systemix/token',
    description: 'Tokens and HMAC/RSA signed tokens.',
  },
  {
    name: '@systemix/hash',
    description: 'PBKDF2 and scrypt password hashing.',
  },
  {
    name: '@systemix/cipher',
    description: 'Authenticated AES-256-GCM encryption.',
  },
  { name: '@systemix/id', description: 'UUID v4, ULID, nanoid-style IDs.' },
  {
    name: '@systemix/rate-limit',
    description: 'Window and bucket rate limiting.',
  },
];

const tooling = [
  {
    name: '@systemix/eslint',
    description: 'ESLint v10 flat configs for JS, TS, Express and Next.js.',
  },
  {
    name: '@systemix/typescript',
    description: 'Base tsconfig presets — bundler and nodenext resolution.',
  },
  {
    name: '@systemix/runner',
    description: 'The zero-dep test runner every package ships with.',
  },
];

function SectionHeader({
  index,
  title,
  sub,
}: {
  index: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline gap-4 mb-6">
      <span className="hud-accent hud">{index}</span>
      <h2 className="font-display text-3xl text-ink">{title}</h2>
      {sub && <span className="hidden sm:block text-sm text-faint">{sub}</span>}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex-1">
      {/* Hero — centered statement, flat paper */}
      <section
        className="px-6 sm:px-10 pt-20 sm:pt-28 pb-16 text-center border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-2.5 px-3 py-1.5 border"
            style={{ borderColor: 'var(--line-strong)' }}
          >
            <span className="hud hud-accent">01</span>
            <span className="font-display text-sm text-ink">Systemix</span>
          </div>

          <h1 className="font-display mt-7 text-5xl sm:text-6xl leading-[1.02] text-ink">
            Security primitives,
            <br />
            <span style={{ color: 'var(--accent)' }}>engineered</span> for
            modern JS.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted max-w-xl mx-auto">
            Typed env loading, crypto-grade randomness, password hashing,
            authenticated encryption, IDs and rate limiting. Eleven packages,
            zero runtime dependencies.
          </p>

          <div className="mt-9 flex items-center justify-center gap-3">
            <Link href="/docs" className="btn btn-primary">
              Get started
            </Link>
            <a
              href="https://github.com/shahadathhs/systemix"
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost"
            >
              <GithubIcon className="size-3.5" />
              GitHub
            </a>
          </div>

          <div
            className="mt-5 font-mono text-[11px] tracking-[0.12em] uppercase"
            style={{ color: 'var(--faint)' }}
          >
            npm install @systemix/env — Node 18+ · Browsers · MIT
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
            <div className="flex justify-between mt-2 px-1">
              <span className="hud">quickstart.ts</span>
              <span className="hud">38 chars · 128 bits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Packages — hairline-ruled grid */}
      <section
        className="px-6 sm:px-10 py-16 border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            index="02"
            title="Packages"
            sub="npm install, one at a time."
          />
          <div className="ruled-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg, i) => (
              <Link
                key={pkg.name}
                href={`/docs/${pkg.name.replace('@systemix/', '')}`}
                className="ruled-cell block group"
              >
                <div className="flex items-baseline justify-between">
                  <span className="hud">{String(i + 1).padStart(2, '0')}</span>
                  <span className="hud hud-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    docs →
                  </span>
                </div>
                <div className="font-mono text-[13px] font-medium text-ink mt-3">
                  {pkg.name.replace('@systemix/', '')}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {pkg.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tooling */}
      <section
        className="px-6 sm:px-10 py-16 border-b"
        style={{ borderColor: 'var(--line)' }}
      >
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            index="03"
            title="Tooling"
            sub="The configs this repo runs on."
          />
          <div className="ruled-grid grid-cols-1 md:grid-cols-3">
            {tooling.map((tool, i) => (
              <Link
                key={tool.name}
                href={`/docs/${tool.name.replace('@systemix/', '')}`}
                className="ruled-cell block group"
              >
                <span className="hud">{String(i + 1).padStart(2, '0')}</span>
                <div className="font-mono text-[13px] font-medium text-ink mt-3">
                  {tool.name}
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Demos */}
      <section className="px-6 sm:px-10 py-16">
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            index="04"
            title="Live demos"
            sub="Run every API in your browser."
          />
          <div className="ruled-grid grid-cols-2 md:grid-cols-4">
            {[
              ['Env', '/env'],
              ['Password', '/password'],
              ['Passphrase', '/passphrase'],
              ['Token', '/token'],
              ['Hash', '/hash'],
              ['Cipher', '/cipher'],
              ['ID', '/id'],
              ['Rate Limit', '/rate-limit'],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="ruled-cell group flex items-center justify-between"
              >
                <span className="text-sm font-medium text-ink">{label}</span>
                <span className="hud hud-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
