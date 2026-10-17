import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { CodeBlock } from '@/components/CodeBlock';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('/')) {
        return (
          <Link
            href={href}
            className="text-zinc-950 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-950"
            {...props}
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          target={href?.startsWith('http') ? '_blank' : undefined}
          rel={href?.startsWith('http') ? 'noreferrer' : undefined}
          className="text-zinc-950 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-950"
          {...props}
        >
          {children}
        </a>
      );
    },
    h1: (props) => (
      <h1
        className="text-[1.75rem] font-semibold tracking-tight text-zinc-950 mb-4 scroll-mt-20"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="text-xl font-semibold tracking-tight text-zinc-950 mt-10 mb-3 scroll-mt-20 pb-2 border-b border-zinc-200"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="text-base font-semibold text-zinc-950 mt-8 mb-2 scroll-mt-20"
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
      <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/70 text-zinc-900 font-mono text-[0.8125rem]">
        {children}
      </code>
    ),
    pre: (props) => <CodeBlock {...props} />,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6 rounded-lg border border-zinc-200">
        <table className="min-w-full text-sm">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-zinc-50 border-b border-zinc-200">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="divide-y divide-zinc-100">{children}</tbody>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5 text-zinc-700 align-top">{children}</td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-zinc-300 pl-4 my-4 text-zinc-600">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-8 border-zinc-200" />,
    ...components,
  };
}
