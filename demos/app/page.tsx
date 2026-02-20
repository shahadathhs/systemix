'use client';

import {
  ArrowRight,
  Github,
  KeyRound,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Gradients */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Secure, Scalable, and Minimalist.
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Systemix is a collections of high-performance toolkit designed for
              building secure and scalable JavaScript and TypeScript systems.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 flex items-center justify-center gap-x-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              href="/docs"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:scale-105 active:scale-95"
            >
              Documentation
            </Link>
            <Link
              href="/password"
              className="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
            >
              Demos
            </Link>
            <Link
              href="https://github.com/shahadathhs/systemix"
              className="group flex items-center gap-2 text-sm font-semibold leading-6 text-white"
            >
              View GitHub{' '}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="mx-auto mt-24 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="flex flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-white/20 transition-all hover:bg-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon
                    className="h-5 w-5 flex-none text-blue-500"
                    aria-hidden="true"
                  />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Package Sections */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-2 gap-8">
          <PackageCard
            title="Password Generator"
            description="Cryptographically secure password generator with customizable complexity and entropy tools."
            icon={Lock}
            href="/password"
            tag="@systemix/password"
          />
          <PackageCard
            title="Passphrase Generator"
            description="Secure, memorable passphrase generator using high-entropy words and random injectors."
            icon={KeyRound}
            href="/passphrase"
            tag="@systemix/passphrase"
          />
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    name: 'Cryptographic Security',
    description:
      'All utilities utilize Node.js built-in crypto for bias-free, high-entropy randomization.',
    icon: ShieldCheck,
  },
  {
    name: 'Turbo Powered',
    description:
      'Optimized build and test pipelines ensures maximum developer productivity and performance.',
    icon: Zap,
  },
  {
    name: 'Zero Dependencies',
    description:
      'Lightweight core with zero external production dependencies to minimize supply chain risks.',
    icon: Github,
  },
];

function PackageCard({
  title,
  description,
  icon: Icon,
  href,
  tag,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href: string;
  tag: string;
}) {
  return (
    <Link
      href={href}
      className="group overflow-hidden relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-all hover:border-blue-500/50 hover:bg-white/10"
    >
      <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-blue-500/10 transition-colors">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <span className="text-xs font-mono text-blue-400">{tag}</span>
        <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-gray-400 line-clamp-2">{description}</p>
        <div className="mt-6 flex items-center text-blue-400 font-medium text-sm">
          Try Live Demo{' '}
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
