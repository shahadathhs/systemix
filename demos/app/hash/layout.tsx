import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hash Playground',
  description:
    'Hash and verify passwords with PBKDF2 using Web Crypto. Try the Systemix hash demo with custom digests and iteration counts.',
  openGraph: {
    title: 'Hash Playground | Systemix Demos',
    description:
      'Password hashing and verification with PBKDF2 and scrypt, built on Web Crypto and Node built-ins.',
  },
  twitter: {
    title: 'Hash Playground | Systemix Demos',
    description:
      'Password hashing and verification with PBKDF2 and scrypt, built on Web Crypto and Node built-ins.',
  },
};

export default function HashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
