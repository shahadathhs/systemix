import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Systemix Demos',
  description:
    'Zero-dependency security packages for Node.js: password hashing, encryption, signed tokens, IDs, env loading and rate limiting. Live demos and docs.',
  openGraph: {
    title: 'Systemix | Security packages for Node.js',
    description:
      'Zero-dependency security packages for Node.js: password hashing, encryption, signed tokens, IDs, env loading and rate limiting. Live demos and docs.',
  },
  twitter: {
    title: 'Systemix | Security packages for Node.js',
    description:
      'Zero-dependency security packages for Node.js: password hashing, encryption, signed tokens, IDs, env loading and rate limiting. Live demos and docs.',
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
