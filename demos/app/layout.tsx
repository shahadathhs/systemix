import { ExternalLink, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
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
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Shield className="w-8 h-8 text-blue-500" />
              <span className="font-bold text-xl tracking-tight">Systemix</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/password"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Password
              </Link>
              <Link
                href="/passphrase"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Passphrase
              </Link>
              <Link
                href="/docs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <a
                href="https://github.com/shahadathhs/systemix"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                GitHub <ExternalLink className="w-3 h-3" />
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                v0.1.0
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-white/5 py-8 bg-background">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
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
