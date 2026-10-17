'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

/**
 * Terminal-window code block: sharp dark body with HUD chrome.
 * The visual anchor for the hero and all code on the site.
 */
export function CodeWindow({
  code,
  filename,
  className = '',
}: {
  code: string;
  filename?: string;
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
      className={`border border-zinc-800 bg-zinc-950 overflow-hidden ${className}`}
    >
      <div className="flex items-center gap-2 px-4 h-9 border-b border-zinc-800/80 bg-zinc-900/60">
        <span className="size-2 bg-zinc-700" />
        <span className="size-2 bg-zinc-700" />
        <span className="size-2 bg-zinc-700" />
        {filename && (
          <span className="ml-2 font-mono text-[11px] text-zinc-500">
            {filename}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          className="ml-auto p-1.5 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check className="size-3.5 text-emerald-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>

      <pre className="p-5 overflow-x-auto text-[13px] leading-relaxed text-zinc-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}
