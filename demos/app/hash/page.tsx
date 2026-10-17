'use client';

import { cn } from '@/lib/utils';
import { hashPassword, verifyPassword } from '@systemix/hash';
import { Check, Copy, Loader2, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const DIGESTS = ['SHA-256', 'SHA-384', 'SHA-512'] as const;
type Digest = (typeof DIGESTS)[number];

export default function HashPage() {
  const [password, setPassword] = useState('hunter2');
  const [digest, setDigest] = useState<Digest>('SHA-256');
  const [iterations, setIterations] = useState(210_000);
  const [encoded, setEncoded] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [verifyInput, setVerifyInput] = useState('hunter2');
  const [verifyState, setVerifyState] = useState<
    'idle' | 'busy' | 'match' | 'mismatch'
  >('idle');

  const handleHash = useCallback(async () => {
    if (!password) return;
    setBusy(true);
    setVerifyState('idle');
    try {
      const result = await hashPassword(password, { digest, iterations });
      setEncoded(result);
    } catch (e) {
      console.error(e instanceof Error ? e.message : e);
    } finally {
      setBusy(false);
    }
  }, [password, digest, iterations]);

  useEffect(() => {
    void handleHash();
  }, [handleHash]);

  const handleVerify = async () => {
    if (!encoded || !verifyInput) return;
    setVerifyState('busy');
    const ok = await verifyPassword(verifyInput, encoded);
    setVerifyState(ok ? 'match' : 'mismatch');
  };

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(encoded).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Hash Playground
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Hash and verify passwords with PBKDF2. The encoded hash embeds the
          algorithm, parameters, and salt — store it as a single string.
          Verification compares in constant time.
        </p>
      </div>

      {/* Encoded hash */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="label">Encoded hash</span>
          {busy && <Loader2 className="size-4 text-faint animate-spin" />}
        </div>
        <code className="block text-[13px] font-mono text-ink break-all min-h-[2.5rem]">
          {encoded || '…'}
        </code>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!encoded}
            className="btn btn-ghost"
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

      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {/* Hash */}
        <div className="panel p-6 space-y-5">
          <h2 className="section-title">Hash</h2>

          <div className="space-y-2">
            <label className="label" htmlFor="hash-password">
              Password
            </label>
            <div className="relative">
              <input
                id="hash-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pr-16 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-faint hover:text-ink px-2 py-1"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="label">Iterations</span>
              <span className="text-sm font-mono text-ink">
                {iterations.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="600000"
              step="10000"
              value={iterations}
              onChange={(e) => setIterations(parseInt(e.target.value))}
              className="w-full accent-ink cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <span className="label">Digest</span>
            <div className="flex gap-2">
              {DIGESTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDigest(d)}
                  className={cn(
                    'segment font-mono text-xs',
                    digest === d ? 'segment-active' : '',
                  )}
                >
                  {d.replace('SHA-', '')}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleHash()}
            disabled={busy || !password}
            className="btn btn-primary w-full"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Hash
          </button>
        </div>

        {/* Verify */}
        <div className="panel p-6 space-y-5">
          <h2 className="section-title">Verify</h2>

          <div className="space-y-2">
            <label className="label" htmlFor="verify-password">
              Password to check
            </label>
            <input
              id="verify-password"
              type="password"
              value={verifyInput}
              onChange={(e) => {
                setVerifyInput(e.target.value);
                setVerifyState('idle');
              }}
              className="field font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleVerify()}
            disabled={!encoded || !verifyInput || verifyState === 'busy'}
            className="btn btn-ghost w-full"
          >
            Verify against hash
          </button>

          {verifyState === 'match' && (
            <div className="flex items-center gap-2 text-sm status-ok border px-3 py-2.5">
              <Check className="size-4" />
              Password matches
            </div>
          )}
          {verifyState === 'mismatch' && (
            <div className="flex items-center gap-2 text-sm status-err border px-3 py-2.5">
              <X className="size-4" />
              Password does not match
            </div>
          )}

          <p className="text-xs text-faint leading-relaxed pt-1">
            scrypt is supported in Node.js only — this browser demo uses PBKDF2.
          </p>
        </div>
      </div>
    </div>
  );
}
