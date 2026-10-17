'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';
import { highlight } from '@/lib/highlight';

/**
 * Terminal-window code block — HUD chrome, theme-aware surfaces,
 * syntax highlighting, hover-reveal copy.
 */
export function CodeWindow({
  code,
  filename,
  lang = 'ts',
  className = '',
}: {
  code: string;
  filename?: string;
  lang?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div
      className={`group border overflow-hidden ${className}`}
      style={{
        background: 'var(--code-bg)',
        borderColor: 'var(--code-border)',
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-2 px-4 h-9 border-b"
        style={{
          background: 'var(--code-chrome)',
          borderColor: 'var(--code-border)',
        }}
      >
        <span className="size-2 rounded-full bg-zinc-500" />
        <span className="size-2 rounded-full bg-zinc-500" />
        <span className="size-2 rounded-full bg-zinc-500" />
        {filename && (
          <span
            className="ml-2 font-mono text-[11px]"
            style={{ color: 'var(--code-fg)', opacity: 0.65 }}
          >
            {filename}
          </span>
        )}
        <span
          className="ml-auto font-mono text-[10px] uppercase tracking-[0.15em] select-none"
          style={{ color: 'var(--code-fg)', opacity: 0.45 }}
        >
          {lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="p-1.5 transition-opacity hover:bg-white/10 opacity-0 group-hover:opacity-60 focus-visible:opacity-60"
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

      {/* Body */}
      <pre
        className="p-5 overflow-x-auto text-[13px] leading-relaxed"
        style={{ color: 'var(--code-fg)' }}
      >
        <code>{highlight(code, lang)}</code>
      </pre>
    </div>
  );
}
