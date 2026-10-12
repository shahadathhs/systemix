import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rate Limiter',
  description:
    'Try fixed-window, sliding-window, and token-bucket rate limiting in your browser. Watch requests get blocked and recover as windows reset.',
  openGraph: {
    title: 'Rate Limiter | Systemix Demos',
    description:
      'Fixed-window, sliding-window, and token-bucket rate limiting with Express middleware.',
  },
  twitter: {
    title: 'Rate Limiter | Systemix Demos',
    description:
      'Fixed-window, sliding-window, and token-bucket rate limiting with Express middleware.',
  },
};

export default function RateLimitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
