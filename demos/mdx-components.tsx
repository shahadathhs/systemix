import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      const linkClass =
        'text-cyan-400 hover:text-cyan-300 underline underline-offset-2 decoration-cyan-400/60 hover:decoration-cyan-300';
      if (href?.startsWith('/')) {
        return (
          <Link href={href} className={linkClass} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noreferrer' : undefined}
          className={linkClass}
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: (props) => (
      <h1
        className="text-3xl font-bold tracking-tight text-white mt-8 mb-4 scroll-mt-20"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="text-2xl font-semibold text-white mt-10 mb-3 scroll-mt-20 border-b border-slate-700/80 pb-2"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="text-xl font-semibold text-white mt-8 mb-2 scroll-mt-20"
        {...props}
      />
    ),
    p: ({ children }) => (
      <p className="text-gray-400 leading-7 mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4 pl-4">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-400 space-y-2 mb-4 pl-4">
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-7">{children}</li>,
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-slate-800/60 text-cyan-300 font-mono text-sm">
        {children}
      </code>
    ),
    pre: (props) => <CodeBlock {...props} />,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6 rounded-xl border border-slate-700/80">
        <table className="min-w-full divide-y divide-slate-700/80">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-slate-800/50">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-slate-700/50">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-slate-800/50 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-3 text-left text-sm font-semibold text-white">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-3 text-sm text-gray-400">{children}</td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-cyan-500 pl-4 py-2 my-4 text-slate-400 italic">
        {children}
      </blockquote>
    ),
    ...components,
  };
}
