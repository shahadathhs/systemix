'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

export function CodeBlock({ children, ...props }: React.ComponentProps<'pre'>) {
  const [copied, setCopied] = useState(false);

  const getCode = useCallback((): string => {
    const extract = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (Array.isArray(node)) return node.map(extract).join('');
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      const c = el?.props?.children;
      return c != null ? extract(c) : '';
    };
    return extract(children);
  }, [children]);

  const copy = useCallback(() => {
    const text = getCode();
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [getCode]);

  return (
    <div className="group relative my-4">
      <pre
        className="p-4 pr-11 rounded-lg border border-zinc-200 bg-zinc-50 overflow-x-auto text-[13px] leading-relaxed text-zinc-800"
        {...props}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
        title="Copy code"
      >
        {copied ? (
          <Check className="size-3.5 text-zinc-900" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
}
