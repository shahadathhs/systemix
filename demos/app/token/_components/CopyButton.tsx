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
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-xs transition-colors"
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
