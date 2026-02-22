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
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Shield className="w-5 h-5 text-cyan-400" />
        Generate Token
      </h2>
      <div className="glass rounded-2xl p-8 relative group overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 items-start justify-between relative z-10">
          <div className="font-mono text-lg sm:text-xl text-white break-all tracking-wider min-w-0 flex-1 selection:bg-cyan-500/30">
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
              className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-white transition-colors"
              title="Regenerate"
              aria-label="Regenerate token"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium transition-all active:scale-95"
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

        <div className="mt-8 flex flex-wrap gap-6 items-center border-t border-slate-700/50 pt-6">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-muted-foreground">
              <span className="text-white font-mono">{tokenLength}</span> chars
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-muted-foreground">
              <span className="text-white font-mono">{entropyBits}</span> bits
              entropy
            </span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Byte Length
                </label>
                <span className="text-sm font-mono text-cyan-400">
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
                className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Charset
              </label>
              <div className="flex flex-wrap gap-2">
                {CHARSETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setOptions({ ...options, charset: c })}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      options.charset === c
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Count
              </label>
              <div className="flex gap-2">
                {[1, 3, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setOptions({ ...options, count: n })}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      options.count === n
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p>
                <strong className="text-white">hex</strong> — 2 chars/byte (API
                keys)
              </p>
              <p>
                <strong className="text-white">base64url</strong> — URL-safe
                (sessions, cookies)
              </p>
              <p>
                <strong className="text-white">alphanumeric</strong> — A–Z, a–z,
                0–9 only
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
