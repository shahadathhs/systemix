import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('/')) {
        return (
          <Link href={href} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noreferrer' : undefined}
          className="text-blue-400 hover:text-blue-300 underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold tracking-tight text-white mt-8 mb-4 scroll-mt-20">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold text-white mt-10 mb-3 scroll-mt-20 border-b border-white/10 pb-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-white mt-8 mb-2 scroll-mt-20">
        {children}
      </h3>
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
      <code className="px-1.5 py-0.5 rounded bg-white/10 text-blue-300 font-mono text-sm">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="p-4 rounded-xl bg-white/5 border border-white/10 overflow-x-auto mb-4 text-sm">
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6 rounded-xl border border-white/10">
        <table className="min-w-full divide-y divide-white/10">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
    tbody: ({ children }) => (
      <tbody className="divide-y divide-white/5">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="hover:bg-white/5 transition-colors">{children}</tr>
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
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 text-gray-400 italic">
        {children}
      </blockquote>
    ),
    ...components,
  };
}
