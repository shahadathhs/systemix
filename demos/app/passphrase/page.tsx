'use client';

import { cn } from '@/lib/utils';
import {
  calculatePassphraseEntropy,
  generatePassphrase,
} from '@systemix/passphrase';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function PassphrasePage() {
  const [options, setOptions] = useState({
    wordCount: 4,
    separator: ' ',
    useTitleCase: true,
    useUpperCase: false,
    includeNumber: true,
    randomSeparator: false,
  });

  const [passphrase, setPassphrase] = useState('');
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);

  const handleGenerate = useCallback(() => {
    try {
      const pass = generatePassphrase(options);
      setPassphrase(pass);
      // Default wordlist is approximately 7,776 words (EFF large list)
      setEntropy(calculatePassphraseEntropy(options.wordCount, 7776));
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
    }
  }, [options]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(passphrase).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Passphrase Generator
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Memorable passphrases built from a 7,776-word list with crypto-grade
          randomness.
        </p>
      </div>

      {/* Output */}
      <div className="panel p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <code className="text-lg font-mono font-medium text-ink break-all selection:bg-[var(--bg-sunken)] min-w-0">
            {passphrase}
          </code>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGenerate}
              className="btn-icon"
              title="Regenerate"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              type="button"
              onClick={copyToClipboard}
              className="btn btn-primary"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
        <div className="mt-5 pt-4 border-t border-line flex items-center gap-2 text-sm text-muted">
          Estimated entropy:{' '}
          <span className="font-mono text-ink">{entropy.toFixed(1)}</span> bits
        </div>
      </div>

      {/* Word count */}
      <div className="panel p-6 mt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="label">Word count</span>
            <span className="text-sm font-mono text-ink">
              {options.wordCount}
            </span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            value={options.wordCount}
            onChange={(e) =>
              setOptions({
                ...options,
                wordCount: parseInt(e.target.value),
              })
            }
            className="w-full accent-ink cursor-pointer"
          />
        </div>
      </div>

      {/* Separator */}
      <div className="panel p-6 mt-4">
        <div className="label mb-3">Separator</div>
        <div className="flex gap-2">
          {[' ', '-', '_', '.'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() =>
                setOptions({
                  ...options,
                  separator: s,
                  randomSeparator: false,
                })
              }
              className={cn(
                'segment',
                options.separator === s && !options.randomSeparator
                  ? 'segment-active'
                  : '',
              )}
            >
              {s === ' ' ? 'Space' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Formatting */}
      <div className="panel p-6 mt-4">
        <h2 className="section-title mb-4">Formatting</h2>
        <div className="space-y-3">
          {(
            [
              ['useTitleCase', 'Title Case', 'Capitalizes each word.'],
              ['useUpperCase', 'UPPERCASE', 'Uppercases everything.'],
              [
                'includeNumber',
                'Include number',
                'Appends a random digit to each word.',
              ],
              [
                'randomSeparator',
                'Mixed separators',
                'Random separator between each word pair.',
              ],
            ] as const
          ).map(([key, label, description]) => (
            <label
              key={key}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(e) =>
                  setOptions({ ...options, [key]: e.target.checked })
                }
                className="mt-0.5 size-4 rounded border-line-strong accent-ink cursor-pointer"
              />
              <span>
                <span className="block text-sm text-ink group-hover:text-ink transition-colors">
                  {label}
                </span>
                <span className="block text-xs text-faint mt-0.5">
                  {description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
