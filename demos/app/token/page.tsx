'use client';

import { cn } from '@/lib/utils';
import {
  bytesToAlphanumeric,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
  generateToken,
} from '@systemix/token/token';
import {
  Binary,
  Check,
  Code2,
  Copy,
  Info,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';

type Charset = 'hex' | 'base64' | 'base64url' | 'alphanumeric';

export default function TokenPage() {
  const [options, setOptions] = useState({
    byteLength: 32,
    charset: 'hex' as Charset,
    count: 1,
  });

  const [token, setToken] = useState<string | string[]>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    try {
      const result = generateToken(options);
      setToken(result);
    } catch (e: unknown) {
      console.error(e instanceof Error ? e.message : e);
    }
  }, [options]);

  useEffect(() => {
    void handleGenerate();
  }, [handleGenerate]);

  const displayToken = typeof token === 'string' ? token : token.join('\n');
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
    <div className="max-w-5xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Token Generator
          </h1>
          <p className="text-muted-foreground">
            Cryptographically secure tokens for API keys, session tokens, and
            more. Multiple charsets and encoding utilities.
          </p>
        </div>

        {/* Section 1: Token Generator */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Generate Token
          </h2>
          <div className="glass rounded-2xl p-8 border border-white/10 relative group overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-4 items-start justify-between relative z-10">
              <div className="font-mono text-sm sm:text-base text-white break-all tracking-wider selection:bg-blue-500/30 min-w-0 flex-1">
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
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                  title="Regenerate"
                  aria-label="Regenerate token"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all active:scale-95"
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

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Byte Length
                    </label>
                    <span className="text-sm font-mono text-blue-400">
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
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Charset
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(
                      ['hex', 'base64', 'base64url', 'alphanumeric'] as const
                    ).map((c) => (
                      <button
                        key={c}
                        onClick={() => setOptions({ ...options, charset: c })}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                          options.charset === c
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10',
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
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
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10',
                        )}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong className="text-white">hex</strong> — 2 chars per
                    byte (e.g. API keys)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong className="text-white">base64url</strong> —
                    URL-safe, no padding (e.g. session tokens)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong className="text-white">alphanumeric</strong> — A–Z,
                    a–z, 0–9 only
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Encoding Utilities */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Binary className="w-5 h-5 text-blue-400" />
            Encoding Utilities
          </h2>
          <EncodingDemo />
        </section>

        {/* Section 3: Subpath Imports */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            Subpath Imports
          </h2>
          <div className="glass rounded-2xl p-6 border border-white/10 space-y-4">
            <p className="text-sm text-gray-400">
              Import only what you need for smaller bundles:
            </p>
            <div className="space-y-3 font-mono text-sm">
              <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-500">
                  // Token generation + encoding
                </span>
                <br />
                <span className="text-blue-400">import</span>{' '}
                <span className="text-emerald-400">
                  {'{ generateToken, bytesToHex }'}
                </span>{' '}
                <span className="text-blue-400">from</span>{' '}
                <span className="text-amber-400">
                  &apos;@systemix/token/token&apos;
                </span>
              </div>
              <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-500">
                  // Shared crypto (getRandomBytes)
                </span>
                <br />
                <span className="text-blue-400">import</span>{' '}
                <span className="text-emerald-400">{'{ getRandomBytes }'}</span>{' '}
                <span className="text-blue-400">from</span>{' '}
                <span className="text-amber-400">
                  &apos;@systemix/token/shared&apos;
                </span>
              </div>
              <div className="p-4 rounded-lg bg-black/30 border border-white/5">
                <span className="text-gray-500">
                  // Signed tokens (encode/decode/verify — coming soon)
                </span>
                <br />
                <span className="text-blue-400">import</span>{' '}
                <span className="text-emerald-400">
                  {'{ encodeSigned, verifySigned }'}
                </span>{' '}
                <span className="text-blue-400">from</span>{' '}
                <span className="text-amber-400">
                  &apos;@systemix/token/signed&apos;
                </span>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}

function EncodingDemo() {
  const [input, setInput] = useState('Hello');
  const [bytes, setBytes] = useState<Uint8Array>(new Uint8Array([]));

  useEffect(() => {
    const encoder = new TextEncoder();
    setBytes(encoder.encode(input));
  }, [input]);

  const hex = bytes.length > 0 ? bytesToHex(bytes) : '';
  const base64 = bytes.length > 0 ? bytesToBase64(bytes) : '';
  const base64url = bytes.length > 0 ? bytesToBase64Url(bytes) : '';
  const alphanumeric = bytes.length > 0 ? bytesToAlphanumeric(bytes) : '';

  return (
    <div className="glass rounded-2xl p-6 border border-white/10 space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">
          Input (text to encode)
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Enter text..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <EncodingOutput label="bytesToHex" value={hex} />
        <EncodingOutput label="bytesToBase64" value={base64} />
        <EncodingOutput label="bytesToBase64Url" value={base64url} />
        <EncodingOutput label="bytesToAlphanumeric" value={alphanumeric} />
      </div>
    </div>
  );
}

function EncodingOutput({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* clipboard unavailable or denied */
      });
  };

  return (
    <div className="p-4 rounded-xl bg-black/30 border border-white/5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-blue-400">{label}</span>
        <button
          onClick={copy}
          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          title="Copy"
          aria-label={`Copy ${label} output`}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div className="font-mono text-xs text-gray-300 break-all">
        {value || '—'}
      </div>
    </div>
  );
}
