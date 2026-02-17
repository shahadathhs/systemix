import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Passphrase Generator',
  description:
    'Secure, memorable passphrase generator using high-entropy word lists and optional formatting: title case, numbers, random separators. Try the Systemix passphrase demo.',
  openGraph: {
    title: 'Passphrase Generator | Systemix Demos',
    description:
      'Secure, memorable passphrase generator using high-entropy words and random injectors.',
  },
  twitter: {
    title: 'Passphrase Generator | Systemix Demos',
    description:
      'Secure, memorable passphrase generator using high-entropy words and random injectors.',
  },
};

export default function PassphraseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
