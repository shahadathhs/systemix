'use client';

import { cn } from '@/lib/utils';
import { hashPassword, verifyPassword } from '@systemix/hash';
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Info,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { motion } from 'motion/react';
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
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Hash Playground
          </h1>
          <p className="text-muted-foreground">
            Hash and verify passwords with PBKDF2. The encoded hash embeds the
            algorithm, parameters, and salt — store it as a single string.
          </p>
        </div>

        {/* Encoded hash display */}
        <div className="glass rounded-2xl p-8 relative group">
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Encoded hash
            </span>
            {busy && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
          </div>
          <div className="text-sm font-mono text-cyan-300 break-all selection:bg-cyan-500/30 min-h-[3rem]">
            {encoded || '…'}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={copyToClipboard}
              disabled={!encoded}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-medium transition-all active:scale-95"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hash controls */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Hash</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 px-4 py-3 pr-12 font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Iterations
                </label>
                <span className="text-sm font-mono text-cyan-400">
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
                className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Digest
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIGESTS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDigest(d)}
                    className={cn(
                      'py-2 rounded-lg text-xs font-mono transition-colors',
                      digest === d
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50',
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
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-medium transition-all active:scale-95"
            >
              {busy ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              Hash
            </button>
          </div>

          {/* Verify controls */}
          <div className="glass rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Verify</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Password to check
              </label>
              <input
                type="password"
                value={verifyInput}
                onChange={(e) => {
                  setVerifyInput(e.target.value);
                  setVerifyState('idle');
                }}
                className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <button
              type="button"
              onClick={() => void handleVerify()}
              disabled={!encoded || !verifyInput || verifyState === 'busy'}
              className="w-full py-3 rounded-xl border border-slate-500/40 hover:bg-slate-800/50 disabled:opacity-40 text-white font-medium transition-all active:scale-95"
            >
              Verify against hash
            </button>

            {verifyState === 'match' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-medium">Password matches</span>
              </motion.div>
            )}
            {verifyState === 'mismatch' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
              >
                <ShieldX className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Password does not match
                </span>
              </motion.div>
            )}

            <div className="flex items-start gap-2 text-xs text-muted-foreground border-t border-slate-700/50 pt-4">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Verification compares derived hashes in constant time to prevent
                timing attacks. scrypt is supported in Node.js only — this
                browser demo uses PBKDF2.
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
