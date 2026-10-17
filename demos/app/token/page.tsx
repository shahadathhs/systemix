'use client';

import Link from 'next/link';
import {
  ByteEncodingSection,
  GenerateTokenSection,
  SignedTokenSection,
} from './_components';

export default function TokenPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Token Playground
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          Generate tokens, encode bytes, and create/verify signed tokens. See{' '}
          <Link
            href="/docs/token"
            className="text-zinc-950 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-950"
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
