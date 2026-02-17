import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Password Generator',
  description:
    'Cryptographically secure password generator with customizable length, character sets, and minimum guarantees. See entropy and try the Systemix password demo.',
  openGraph: {
    title: 'Password Generator | Systemix Demos',
    description:
      'Cryptographically secure password generator with customizable complexity and entropy tools.',
  },
  twitter: {
    title: 'Password Generator | Systemix Demos',
    description:
      'Cryptographically secure password generator with customizable complexity and entropy tools.',
  },
};

export default function PasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
