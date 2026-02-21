import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Token Generator',
  description:
    'Cryptographically secure token generator for API keys, session tokens, and more. Hex, base64, base64url, alphanumeric charsets. See the Systemix token demo.',
  openGraph: {
    title: 'Token Generator | Systemix Demos',
    description:
      'Secure token generator with multiple charsets and encoding utilities.',
  },
  twitter: {
    title: 'Token Generator | Systemix Demos',
    description:
      'Secure token generator with multiple charsets and encoding utilities.',
  },
};

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
