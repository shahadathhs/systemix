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
      className="flex items-center gap-1.5 px-2 py-1 bg-raised border border-line hover:bg-sunken text-faint hover:text-ink text-xs transition-colors px-2 py-1 inline-flex items-center gap-1.5"
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
