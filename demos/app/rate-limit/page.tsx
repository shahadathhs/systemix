'use client';

import { cn } from '@/lib/utils';
import {
  createRateLimiter,
  type RateLimitAlgorithm,
  type RateLimitResult,
} from '@systemix/rate-limit';
import { Ban, CheckCircle2, Gauge, Send, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';

const ALGORITHMS: { id: RateLimitAlgorithm; label: string; hint: string }[] = [
  {
    id: 'fixed-window',
    label: 'Fixed Window',
    hint: 'Counter resets every window — bursts possible at boundaries',
  },
  {
    id: 'sliding-window',
    label: 'Sliding Window',
    hint: 'Rolling log of timestamps — smooth boundaries',
  },
  {
    id: 'token-bucket',
    label: 'Token Bucket',
    hint: 'Continuous refill — allows short bursts, then smooths',
  },
];

const WINDOWS = [
  { ms: 5_000, label: '5s' },
  { ms: 10_000, label: '10s' },
  { ms: 30_000, label: '30s' },
];

const KEY = 'demo-user';

export default function RateLimitPage() {
  const [algorithm, setAlgorithm] =
    useState<RateLimitAlgorithm>('fixed-window');
  const [limit, setLimit] = useState(5);
  const [windowMs, setWindowMs] = useState(10_000);
  const [result, setResult] = useState<RateLimitResult | null>(null);
  const [history, setHistory] = useState<{ allowed: boolean; at: number }[]>(
    [],
  );
  const [, setTick] = useState(0);

  const limiter = useMemo(
    () => createRateLimiter({ limit, windowMs, algorithm }),
    [limit, windowMs, algorithm],
  );

  // Re-render every 250ms so countdowns and the window progress animate
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(timer);
  }, []);

  const sendRequest = () => {
    const r = limiter.limit(KEY);
    setResult(r);
    setHistory((prev) =>
      [{ allowed: r.success, at: Date.now() }, ...prev].slice(0, 20),
    );
  };

  const reset = () => {
    limiter.resetKey(KEY);
    setResult(null);
    setHistory([]);
  };

  const peek = limiter.peek(KEY);
  const used = limit - peek.remaining;
  const usedPct = Math.min(100, (used / limit) * 100);
  const windowRemaining = Math.max(0, peek.reset - Date.now());

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Rate Limiter
          </h1>
          <p className="text-muted-foreground">
            Send requests as fast as you can until the limiter blocks you — then
            watch it recover. This is exactly what your API middleware does.
          </p>
        </div>

        {/* Configuration */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">
              Algorithm
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ALGORITHMS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAlgorithm(a.id)}
                  className={cn(
                    'p-3 rounded-xl text-left border transition-colors',
                    algorithm === a.id
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : 'bg-slate-800/50 border-transparent hover:bg-slate-700/50',
                  )}
                >
                  <div
                    className={cn(
                      'text-sm font-medium',
                      algorithm === a.id ? 'text-cyan-400' : 'text-white',
                    )}
                  >
                    {a.label}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-snug">
                    {a.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Limit
                </label>
                <span className="text-sm font-mono text-cyan-400">{limit}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Window
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WINDOWS.map((w) => (
                  <button
                    key={w.ms}
                    type="button"
                    onClick={() => setWindowMs(w.ms)}
                    className={cn(
                      'py-2 rounded-lg text-sm font-mono transition-colors',
                      windowMs === w.ms
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50',
                    )}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live state */}
        <div className="glass rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-700/50">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{ width: `${usedPct}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                <Gauge className="w-3.5 h-3.5" />
                key: {KEY}
              </div>
              <div className="text-3xl font-mono text-white">
                {Math.max(0, peek.remaining)}
                <span className="text-slate-500 text-lg"> / {limit} left</span>
              </div>
              {peek.success ? (
                <div className="text-sm text-slate-400">
                  window resets in{' '}
                  <span className="font-mono text-white">
                    {(windowRemaining / 1000).toFixed(1)}s
                  </span>
                </div>
              ) : (
                <div className="text-sm text-red-400">
                  blocked — retry in{' '}
                  <span className="font-mono">
                    {(peek.retryAfter / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={reset}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-white transition-colors"
                title="Reset limiter"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={sendRequest}
                className={cn(
                  'flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all active:scale-95',
                  peek.success
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                    : 'bg-red-500 hover:bg-red-400 text-white',
                )}
              >
                <Send className="w-5 h-5" />
                Send Request
              </button>
            </div>
          </div>
        </div>

        {/* Last result */}
        {result && (
          <motion.div
            key={`${result.success}-${history[0]?.at ?? 0}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'flex items-center gap-4 p-5 rounded-2xl border',
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30',
            )}
          >
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <Ban className="w-6 h-6 text-red-400 shrink-0" />
            )}
            <code className="text-xs sm:text-sm font-mono text-white">
              {JSON.stringify(result)}
            </code>
          </motion.div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">
              Request log
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span
                  key={`${h.at}-${i}`}
                  title={new Date(h.at).toLocaleTimeString()}
                  className={cn(
                    'w-3 h-3 rounded-sm',
                    h.allowed ? 'bg-emerald-400' : 'bg-red-400',
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Newest first — green allowed, red blocked.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
