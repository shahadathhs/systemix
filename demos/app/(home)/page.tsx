'use client';

import {
  ArrowRight,
  Github,
  KeyRound,
  Lock,
  Shield,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background - cyan/teal gradient blob */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-cyan-500 to-teal-600 opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100/90 to-slate-400">
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
              className="rounded-lg bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 transition-all hover:scale-105 active:scale-95"
            >
              Documentation
            </Link>
            <Link
              href="/password"
              className="rounded-lg border border-slate-500/40 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all"
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
          <div className="grid grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                className="card flex flex-col rounded-xl p-8 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.3 }}
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <feature.icon
                    className="h-5 w-5 flex-none text-cyan-400"
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
        <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
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
            <PackageCard
              title="Token Generator"
              description="Secure token generator with hex, base64, base64url, alphanumeric charsets and encoding utilities."
              icon={Shield}
              href="/token"
              tag="@systemix/token"
            />
          </div>
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
      className="card group overflow-hidden relative rounded-xl p-8 transition-all"
    >
      <div className="absolute -right-4 -top-4 text-slate-700 group-hover:text-cyan-500/20 transition-colors">
        <Icon size={120} />
      </div>
      <div className="relative z-10">
        <span className="text-xs font-mono text-cyan-400">{tag}</span>
        <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
        <p className="mt-2 text-slate-400 line-clamp-2">{description}</p>
        <div className="mt-6 flex items-center text-cyan-400 font-medium text-sm">
          Try Live Demo{' '}
          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
