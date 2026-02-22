import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About Shahadath Hossen Sajib — Backend Developer specializing in Node.js and NestJS, creator of Systemix.',
  openGraph: {
    title: 'About | Systemix Demos',
    description:
      'About the creator of Systemix, a toolkit for secure and scalable JavaScript and TypeScript.',
  },
  twitter: {
    title: 'About | Systemix Demos',
    description:
      'About the creator of Systemix, a toolkit for secure and scalable JavaScript and TypeScript.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
