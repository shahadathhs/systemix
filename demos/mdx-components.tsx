import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      const cls =
        'text-zinc-950 underline underline-offset-2 hover:no-underline';
      if (href?.startsWith('/')) {
        return (
          <Link href={href} className={cls} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noreferrer' : undefined}
          className={cls}
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: (props) => (
      <h1
        className="font-display text-4xl text-zinc-950 mb-5 scroll-mt-20"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="font-display text-2xl text-zinc-950 mt-12 mb-4 scroll-mt-20 pt-6 border-t"
        style={{ borderColor: 'var(--line)' }}
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="font-display text-lg text-zinc-950 mt-8 mb-2 scroll-mt-20"
        {...props}
      />
    ),
    p: ({ children }) => (
      <p className="text-zinc-600 leading-7 mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 text-zinc-600 space-y-1.5 mb-4 leading-7">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 text-zinc-600 space-y-1.5 mb-4 leading-7">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-1">{children}</li>,
    code: ({ children }) => (
      <code
        className="px-1.5 py-0.5 border font-mono text-[0.8125rem] text-zinc-900"
        style={{ borderColor: 'var(--line)', background: 'var(--bg-sunken)' }}
      >
        {children}
      </code>
    ),
    pre: (props) => <CodeBlock {...props} />,
    table: ({ children }) => (
      <div
        className="overflow-x-auto mb-6 border"
        style={{ borderColor: 'var(--line)' }}
      >
        <table className="min-w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead
        className="border-b bg-white/60"
        style={{ borderColor: 'var(--line)' }}
      >
        {children}
      </thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y" style={{ borderColor: 'var(--line)' }}>
        {children}
      </tbody>
    ),
    tr: ({ children }) => <tr>{children}</tr>,
    th: ({ children }) => (
      <th className="hud px-4 py-2.5 text-left normal-case">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5 text-zinc-700 align-top">{children}</td>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-2 pl-4 my-5 text-zinc-600"
        style={{ borderColor: 'var(--accent)' }}
      >
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="my-8 border-t" style={{ borderColor: 'var(--line)' }} />
    ),
    ...components,
  };
}
