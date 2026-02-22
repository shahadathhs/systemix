import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Token Playground',
  description:
    'Cryptographically secure token generator and signed-token module for API keys, session tokens, and auth. Hex, base64, base64url, alphanumeric. HMAC and RSA signing.',
  openGraph: {
    title: 'Token Generator | Systemix Demos',
    description:
      'Token generator, byte encoding, and signed token encode/decode/verify playground.',
  },
  twitter: {
    title: 'Token Generator | Systemix Demos',
    description:
      'Token generator, byte encoding, and signed token encode/decode/verify playground.',
  },
};

export default function TokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
