'use client';

import { cn } from '@/lib/utils';
import { calculatePasswordEntropy, generatePassword } from '@systemix/password';
import { Check, Copy, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export default function PasswordPage() {
  const [options, setOptions] = useState({
    length: 16,
    useNumbers: true,
    useUppercase: true,
    useLowercase: true,
    useSymbols: true,
    minNumbers: 2,
    minUppercase: 2,
    minLowercase: 2,
    minSymbols: 2,
    excludeSimilarCharacters: false,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [entropy, setEntropy] = useState(0);

  const getCharsetSize = useCallback(() => {
    let size = 0;
    if (options.useLowercase) size += 26;
    if (options.useUppercase) size += 26;
    if (options.useNumbers) size += 10;
    if (options.useSymbols) size += 32;
    return size;
  }, [options]);

  const handleGenerate = useCallback(() => {
    try {
      const pass = generatePassword(options) as string;
      setPassword(pass);
      setEntropy(calculatePasswordEntropy(options.length, getCharsetSize()));
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
    }
  }, [options, getCharsetSize]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Password Generator
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Cryptographically secure passwords with per-class guarantees.
        </p>
      </div>

      {/* Output */}
      <div className="panel p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <code className="text-lg font-mono font-medium text-ink break-all tracking-wide selection:bg-[var(--bg-sunken)] min-w-0">
            {password}
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
          Entropy:{' '}
          <span className="font-mono text-ink">{entropy.toFixed(1)}</span> bits
        </div>
      </div>

      {/* Length */}
      <div className="panel p-6 mt-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="label">Length</span>
            <span className="text-sm font-mono text-ink">{options.length}</span>
          </div>
          <input
            type="range"
            min="4"
            max="100"
            value={options.length}
            onChange={(e) =>
              setOptions({ ...options, length: parseInt(e.target.value) })
            }
            className="w-full accent-ink cursor-pointer"
          />
        </div>
      </div>

      {/* Character classes */}
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <div className="panel p-6">
          <h2 className="section-title mb-4">Character classes</h2>
          <div className="space-y-3">
            {(
              [
                ['useNumbers', 'Numbers (0-9)'],
                ['useUppercase', 'Uppercase (A-Z)'],
                ['useLowercase', 'Lowercase (a-z)'],
                ['useSymbols', 'Symbols (@#$!)'],
                ['excludeSimilarCharacters', 'Exclude similar (1lI0O)'],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={(e) =>
                    setOptions({ ...options, [key]: e.target.checked })
                  }
                  className="size-4 rounded border-line-strong text-ink accent-ink cursor-pointer"
                />
                <span className="text-sm text-muted group-hover:text-ink transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="section-title mb-4">Minimum guarantees</h2>
          <div className="space-y-4">
            {(
              [
                ['minNumbers', 'Min numbers', options.useNumbers],
                ['minUppercase', 'Min uppercase', options.useUppercase],
                ['minLowercase', 'Min lowercase', options.useLowercase],
                ['minSymbols', 'Min symbols', options.useSymbols],
              ] as const
            ).map(([key, label, enabled]) => (
              <div
                key={key}
                className={cn(
                  'flex items-center justify-between',
                  !enabled && 'opacity-40 pointer-events-none',
                )}
              >
                <span className="text-sm text-muted">{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOptions({
                        ...options,
                        [key]: Math.max(0, options[key] - 1),
                      })
                    }
                    className="btn-icon w-8 h-8"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-mono text-ink">
                    {options[key]}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setOptions({ ...options, [key]: options[key] + 1 })
                    }
                    className="btn-icon w-8 h-8"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
