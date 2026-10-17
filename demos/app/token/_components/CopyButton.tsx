'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard unavailable or denied */
      });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-2 py-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-950 text-xs transition-colors px-2 py-1 inline-flex items-center gap-1.5"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
      {copied ? 'Copied' : label}
    </button>
  );
}
