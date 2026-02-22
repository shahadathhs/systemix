'use client';

import {
  ArrowLeft,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  FileText,
  PenLine,
  Shield,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i + 0.2, duration: 0.4 },
  }),
};

export default function AboutPage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Background gradient - matches home page */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#6366f1] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-16 sm:pt-32">
        <div className="mx-auto max-w-3xl">
          {/* Hero */}
          <motion.div
            className="text-center space-y-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="flex justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white/10 shadow-xl">
                  <User className="w-14 h-14 text-white/90" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-0"
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
              Shahadath Hossen Sajib
            </h1>
            <p className="text-muted-foreground text-lg">
              Backend Developer · Creator of Systemix
            </p>
          </motion.div>

          {/* Cards with staggered animation */}
          <div className="space-y-6">
            <motion.div
              className="flex flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-white/20 transition-all hover:bg-white/10"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-500" />
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                I&apos;m a backend developer who enjoys building things that
                work well and scale. I spend most of my time with Node.js,
                NestJS, and Express, designing APIs and systems that are secure
                and maintainable.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Systemix is a side project — a small toolkit for
                cryptographically secure utilities like password generation,
                passphrases, and token signing. The goal is to provide minimal,
                well-tested primitives you can drop into any project without
                pulling in unnecessary dependencies.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-white/20 transition-all hover:bg-white/10"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <PenLine className="w-5 h-5 text-blue-500" />
                Writing
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                I write about backend engineering, system design, DevOps, and
                real-world project learnings.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://medium.com/@shahadathhs"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5 hover:border-white/10"
                >
                  Medium
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <a
                  href="https://substack.com/@shahadathhs"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5 hover:border-white/10"
                >
                  Substack
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-white/20 transition-all hover:bg-white/10"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Connect</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    href: 'https://shahadathhs.vercel.app',
                    label: 'Portfolio',
                    icon: ExternalLink,
                  },
                  {
                    href: 'https://github.com/shahadathhs',
                    label: 'GitHub',
                    icon: Github,
                  },
                  {
                    href: 'https://linkedin.com/in/shahadathhs',
                    label: 'LinkedIn',
                    icon: Linkedin,
                  },
                  {
                    href: 'https://leetcode.com/u/shahadathhs/',
                    label: 'LeetCode',
                    icon: ExternalLink,
                  },
                ].map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5 hover:border-white/10 hover:scale-[1.02]"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 hover:ring-white/20 transition-all hover:bg-white/10"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <h2 className="text-lg font-semibold text-white mb-4">Contact</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:shahadathhossensajib732@gmail.com"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5 hover:border-white/10 hover:scale-[1.02]"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
                <a
                  href="https://drive.google.com/file/d/1E8-4vCZD0VW1QflvoRHTAJBedZRtUJ3f/view"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5 hover:border-white/10 hover:scale-[1.02]"
                >
                  <FileText className="w-4 h-4" />
                  Resume
                  <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </motion.div>

            <motion.blockquote
              className="text-center text-muted-foreground italic py-8 px-6 rounded-2xl border border-white/10 bg-white/5"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              &ldquo;Clean architecture, clear intent, and systems that scale.
              &rdquo;
            </motion.blockquote>
          </div>

          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
