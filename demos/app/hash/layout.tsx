import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hash Playground',
  description:
    'Hash and verify passwords with Argon2id, scrypt or PBKDF2. Try the Systemix hash demo with PHC strings and needsRehash.',
  openGraph: {
    title: 'Hash Playground | Systemix Demos',
    description:
      'Argon2id password hashing in PHC format, with scrypt and PBKDF2 support, built on Node built-ins.',
  },
  twitter: {
    title: 'Hash Playground | Systemix Demos',
    description:
      'Argon2id password hashing in PHC format, with scrypt and PBKDF2 support, built on Node built-ins.',
  },
};

export default function HashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
