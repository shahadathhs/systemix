import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cipher Demo',
  description:
    'Encrypt and decrypt text with authenticated AES-256-GCM using Web Crypto. Try the Systemix cipher demo with tamper detection.',
  openGraph: {
    title: 'Cipher Demo | Systemix Demos',
    description:
      'Authenticated AES-256-GCM encryption and decryption for sensitive data at rest.',
  },
  twitter: {
    title: 'Cipher Demo | Systemix Demos',
    description:
      'Authenticated AES-256-GCM encryption and decryption for sensitive data at rest.',
  },
};

export default function CipherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
