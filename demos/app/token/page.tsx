'use client';

import Link from 'next/link';
import {
  ByteEncodingSection,
  GenerateTokenSection,
  SignedTokenSection,
} from './_components';

export default function TokenPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Token Playground
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Generate tokens, encode bytes, and create/verify signed tokens. See{' '}
          <Link
            href="/docs/token"
            className="text-ink underline underline-offset-2 decoration-line-strong hover:decoration-ink"
          >
            full documentation
          </Link>
          .
        </p>
      </div>

      <div className="space-y-4">
        <GenerateTokenSection />
        <ByteEncodingSection />
        <SignedTokenSection />
      </div>
    </div>
  );
}
