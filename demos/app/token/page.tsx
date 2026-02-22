'use client';

import { motion } from 'motion/react';
import Link from 'next/link';
import {
  ByteEncodingSection,
  GenerateTokenSection,
  SignedTokenSection,
} from './_components';

export default function TokenPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Token Playground
          </h1>
          <p className="text-muted-foreground">
            Generate tokens, encode bytes, and create/verify signed tokens. See{' '}
            <Link href="/docs/token" className="text-blue-400 hover:underline">
              full documentation
            </Link>
            .
          </p>
        </div>

        <GenerateTokenSection />
        <ByteEncodingSection />
        <SignedTokenSection />
      </motion.div>
    </div>
  );
}
