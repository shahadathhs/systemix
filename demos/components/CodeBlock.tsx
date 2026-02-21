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
      setTimeout(() => setCopied(false), 2000);
    });
  }, [getCode]);

  return (
    <div className="group relative">
      <pre
        className="p-4 pr-12 rounded-xl bg-white/5 border border-white/10 overflow-x-auto mb-4 text-sm"
        {...props}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
        title="Copy code"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-400" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
