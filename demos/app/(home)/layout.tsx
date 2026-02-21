import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Systemix Demos',
  description:
    'Live demos and documentation for Systemix packages. A modular, high-performance toolkit for building secure and scalable JavaScript and TypeScript systems.',
  openGraph: {
    title: 'Systemix Demos | Secure toolkit for modern JS',
    description:
      'Live demos and documentation for Systemix packages. A modular toolkit for secure and scalable JavaScript and TypeScript.',
  },
  twitter: {
    title: 'Systemix Demos | Secure toolkit for modern JS',
    description:
      'Live demos and documentation for Systemix packages. A modular toolkit for secure and scalable JavaScript and TypeScript.',
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
