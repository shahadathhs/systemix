import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Env Loader',
  description:
    'Typed environment variable loading and validation. See schema, parsing, and toSafeLog in action.',
  openGraph: {
    title: 'Env Loader | Systemix Demos',
    description:
      'Typed environment variable loading and validation with .env file support.',
  },
  twitter: {
    title: 'Env Loader | Systemix Demos',
    description:
      'Typed environment variable loading and validation with .env file support.',
  },
};

export default function EnvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
