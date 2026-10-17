'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { highlight } from '@/lib/highlight';

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  const el = node as React.ReactElement<{ children?: React.ReactNode }>;
  return el?.props?.children != null ? extractText(el.props.children) : '';
}

function detectLang(node: React.ReactNode): string {
  const el = node as React.ReactElement<{ className?: string }>;
  const cls = el?.props?.className ?? '';
  const m = /language-(\w+)/.exec(cls);
  return m ? m[1] : 'ts';
}

export function CodeBlock({ children, ...props }: React.ComponentProps<'pre'>) {
  const [copied, setCopied] = useState(false);

  const code = extractText(children);
  const lang = detectLang(children);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="group relative my-5">
      <span
        className="absolute top-3 left-4 font-mono text-[10px] uppercase tracking-[0.15em] select-none"
        style={{ color: 'var(--code-fg)', opacity: 0.45 }}
      >
        {lang}
      </span>
      <pre
        className="p-4 pt-9 pr-11 border overflow-x-auto text-[13px] leading-relaxed"
        style={{
          background: 'var(--code-bg)',
          borderColor: 'var(--code-border)',
          color: 'var(--code-fg)',
        }}
        {...props}
      >
        {typeof children === 'object' && children != null
          ? highlight(code, lang)
          : children}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 p-1.5 rounded-md transition-all hover:bg-white/10 opacity-0 group-hover:opacity-60 focus-visible:opacity-60"
        style={{ color: 'var(--code-fg)' }}
        title="Copy code"
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-400" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </button>
    </div>
  );
}
