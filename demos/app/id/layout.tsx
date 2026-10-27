import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ID Generator',
  description:
    'Generate UUIDv7, UUID v4, ULID, and nanoid-style identifiers with crypto-grade randomness. Try the Systemix ID demo.',
  openGraph: {
    title: 'ID Generator | Systemix Demos',
    description:
      'UUIDv7, UUID v4, ULID, and nanoid-style ID generation with crypto-grade randomness.',
  },
  twitter: {
    title: 'ID Generator | Systemix Demos',
    description:
      'UUIDv7, UUID v4, ULID, and nanoid-style ID generation with crypto-grade randomness.',
  },
};

export default function IdLayout({ children }: { children: React.ReactNode }) {
  return children;
}
