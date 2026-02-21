import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://systemix.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Systemix Demos | Secure toolkit for modern JS',
    template: '%s | Systemix Demos',
  },
  description:
    'Live demos and documentation for Systemix packages. A modular, high-performance toolkit for building secure and scalable JavaScript and TypeScript systems.',
  keywords: [
    'systemix',
    'JavaScript',
    'TypeScript',
    'toolkit',
    'secure',
    'scalable',
    'demos',
    'documentation',
    'modular',
    'open source',
  ],
  authors: [
    {
      name: 'Shahadath Hossen Sajib',
      url: 'https://github.com/shahadathhs',
    },
  ],
  creator: 'Shahadath Hossen Sajib',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Systemix Demos',
    title: 'Systemix Demos | Secure toolkit for modern JS',
    description:
      'Live demos and documentation for Systemix packages. A modular toolkit for secure and scalable JavaScript and TypeScript.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Systemix Demos | Secure toolkit for modern JS',
    description:
      'Live demos and documentation for Systemix packages. A modular toolkit for secure and scalable JavaScript and TypeScript.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AppShell>{children}</AppShell>
        <footer className="border-t border-white/5 py-8 bg-background w-full">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Systemix Toolkit. Built by{' '}
              <a
                href="https://github.com/shahadathhs"
                className="hover:text-blue-400"
              >
                Shahadath Hossain
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
