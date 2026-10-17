'use client';

import { cn } from '@/lib/utils';
import { CHARSETS, generateToken, type Charset } from '@systemix/token/token';
import { Check, Copy, Info, RefreshCw, Shield } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function GenerateTokenSection() {
  const [options, setOptions] = useState({
    byteLength: 32,
    charset: 'hex' as Charset,
    count: 1,
  });

  const [token, setToken] = useState<string | string[]>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    try {
      setToken(generateToken(options));
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
    }
  }, [options]);

  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const displayToken = typeof token === 'string' ? token : token.join('\n');
  const tokenLength =
    typeof token === 'string' ? token.length : token.join('').length;
  const entropyBits = options.byteLength * 8;

  const copyToClipboard = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(displayToken)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        /* clipboard unavailable or denied */
      });
  };

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-950">
        <Shield className="w-5 h-5 text-zinc-400" />
        Generate Token
      </h2>
      <div className="panel relative p-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-between relative z-10">
          <div className="font-mono text-lg sm:text-xl text-zinc-950 break-all tracking-wider min-w-0 flex-1 selection:bg-zinc-200">
            {typeof token === 'string' ? (
              token
            ) : (
              <div className="space-y-1">
                {token.map((t, i) => (
                  <div key={i}>{t}</div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center justify-center w-10 h-10 border border-zinc-300 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              title="Regenerate"
              aria-label="Regenerate token"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-zinc-900 hover:bg-zinc-700 text-zinc-950 text-sm font-medium transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-6 items-center border-t border-zinc-100 pt-6">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-600">
              <span className="text-zinc-950 font-mono">{tokenLength}</span>{' '}
              chars
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-zinc-600">
              <span className="text-zinc-950 font-mono">{entropyBits}</span>{' '}
              bits entropy
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-zinc-600">
                  Byte Length
                </label>
                <span className="text-sm font-mono text-zinc-400">
                  {options.byteLength}
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="128"
                value={options.byteLength}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    byteLength: parseInt(e.target.value),
                  })
                }
                className="w-full h-2 accent-zinc-900 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600">
                Charset
              </label>
              <div className="flex flex-wrap gap-2">
                {CHARSETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setOptions({ ...options, charset: c })}
                    className={cn(
                      'px-4 h-9 text-sm font-medium transition-colors',
                      options.charset === c
                        ? 'bg-zinc-900 text-zinc-950'
                        : 'bg-white border border-zinc-300 text-zinc-500 hover:bg-zinc-50',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600">Count</label>
              <div className="flex gap-2">
                {[1, 3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setOptions({ ...options, count: n })}
                    className={cn(
                      'px-4 h-9 text-sm font-medium transition-colors',
                      options.count === n
                        ? 'bg-zinc-900 text-zinc-950'
                        : 'bg-white border border-zinc-300 text-zinc-500 hover:bg-zinc-50',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="flex flex-col gap-1.5 text-sm text-zinc-600">
              <p>
                <strong className="text-zinc-950">hex</strong> — 2 chars/byte
                (API keys)
              </p>
              <p>
                <strong className="text-zinc-950">base64url</strong> — URL-safe
                (sessions, cookies)
              </p>
              <p>
                <strong className="text-zinc-950">alphanumeric</strong> — A–Z,
                a–z, 0–9 only
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
