import { AppShell } from '@/components/AppShell';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

/*
 * Self-hosted fonts (demos/fonts/) — always load, dev + prod, no network.
 * Schibsted Grotesk is a variable font (400–900); Fragment Mono is 400.
 */
const sans = localFont({
  src: '../fonts/schibsted-grotesk-var.woff2',
  variable: '--font-schibsted',
  weight: '400 900',
  display: 'swap',
});

const mono = localFont({
  src: '../fonts/fragment-mono-400.woff2',
  variable: '--font-fragment',
  weight: '400',
  display: 'swap',
});

const siteUrl = 'https://systemix.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Systemix — Security primitives, engineered for modern JS',
    template: '%s | Systemix',
  },
  description:
    'Live demos and documentation for Systemix packages. A modular, high-performance toolkit for building secure and scalable JavaScript and TypeScript systems.',
  applicationName: 'Systemix',
  category: 'developer tools',
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
    'password hashing',
    'encryption',
    'rate limiting',
    'uuid',
    'ulid',
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
    siteName: 'Systemix',
    title: 'Systemix — Security primitives, engineered for modern JS',
    description:
      'Eleven packages, zero runtime dependencies: typed env loading, crypto-grade randomness, password hashing, authenticated encryption, IDs and rate limiting.',
    images: [
      { url: '/opengraph-image', width: 1200, height: 630, alt: 'Systemix' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Systemix — Security primitives, engineered for modern JS',
    description:
      'Eleven packages, zero runtime dependencies: typed env loading, crypto-grade randomness, password hashing, authenticated encryption, IDs and rate limiting.',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Set theme before paint — no flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark'}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${sans.variable} ${mono.variable} min-h-screen flex flex-col antialiased`}
      >
        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Systemix',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Node.js, Web',
              description:
                'Modular toolkit of secure, zero-dependency JavaScript and TypeScript packages: env loading, passwords, hashing, encryption, IDs, rate limiting.',
              url: siteUrl,
              author: {
                '@type': 'Person',
                name: 'Shahadath Hossen Sajib',
                url: 'https://github.com/shahadathhs',
              },
              license: 'https://opensource.org/licenses/MIT',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            }),
          }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
