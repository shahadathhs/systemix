'use client';

import { cn } from '@/lib/utils';
import {
  createRateLimiter,
  type RateLimitAlgorithm,
  type RateLimitResult,
} from '@systemix/rate-limit';
import { Send, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const ALGORITHMS = [
  {
    id: 'fixed-window',
    label: 'Fixed Window',
    hint: 'Counter resets every window',
  },
  {
    id: 'sliding-window',
    label: 'Sliding Window',
    hint: 'Rolling timestamps — smooth boundaries',
  },
  {
    id: 'token-bucket',
    label: 'Token Bucket',
    hint: 'Continuous refill — allows bursts',
  },
] as const;

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
  const [log, setLog] = useState<{ allowed: boolean; at: number }[]>([]);
  const [, setTick] = useState(0);

  const limiter = useMemo(
    () => createRateLimiter({ limit, windowMs, algorithm }),
    [limit, windowMs, algorithm],
  );

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(timer);
  }, []);

  const sendRequest = () => {
    const r = limiter.limit(KEY);
    setResult(r);
    setLog((prev) =>
      [{ allowed: r.success, at: Date.now() }, ...prev].slice(0, 20),
    );
  };

  const reset = () => {
    limiter.resetKey(KEY);
    setResult(null);
    setLog([]);
  };

  const state = limiter.peek(KEY);
  const used = limit - state.remaining;
  const usedPct = Math.min(100, (used / limit) * 100);
  const resetIn = Math.max(0, state.reset - Date.now());

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Rate Limiter
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          Send requests until the limiter blocks you, then watch it recover.
          This is exactly what the middleware does to API traffic.
        </p>
      </div>

      {/* Configuration */}
      <div className="panel p-6 space-y-6">
        <div>
          <div className="label mb-2">Algorithm</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ALGORITHMS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAlgorithm(a.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-colors cursor-pointer',
                  algorithm === a.id
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-200 hover:bg-zinc-50',
                )}
              >
                <div
                  className={cn(
                    'text-sm font-medium',
                    algorithm === a.id ? 'text-zinc-950' : 'text-zinc-700',
                  )}
                >
                  {a.label}
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 leading-snug">
                  {a.hint}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="label">Limit</span>
              <span className="text-sm font-mono text-zinc-950">{limit}</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full accent-zinc-900 cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <span className="label">Window</span>
            <div className="flex gap-2">
              {WINDOWS.map((w) => (
                <button
                  key={w.ms}
                  type="button"
                  onClick={() => setWindowMs(w.ms)}
                  className={cn(
                    'segment font-mono text-xs',
                    windowMs === w.ms ? 'segment-active' : '',
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
      <div className="panel p-6 mt-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
          <div className="space-y-1">
            <div className="label">
              key: <span className="font-mono normal-case">{KEY}</span>
            </div>
            <div className="text-3xl font-semibold tracking-tight text-zinc-950">
              {Math.max(0, state.remaining)}
              <span className="text-base font-normal text-zinc-500">
                {' '}
                / {limit} left
              </span>
            </div>
            <div
              className={cn(
                'text-sm',
                state.success ? 'text-zinc-600' : 'text-red-700',
              )}
            >
              {state.success ? (
                <>
                  resets in{' '}
                  <span className="font-mono text-zinc-950">
                    {(resetIn / 1000).toFixed(1)}s
                  </span>
                </>
              ) : (
                <>
                  blocked — retry in{' '}
                  <span className="font-mono">
                    {(state.retryAfter / 1000).toFixed(1)}s
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="btn-icon"
              title="Reset limiter"
            >
              <Trash2 className="size-4" />
            </button>
            <button
              type="button"
              onClick={sendRequest}
              className={cn(
                'btn',
                state.success
                  ? 'btn-primary'
                  : 'bg-red-600 text-white hover:bg-red-500',
              )}
            >
              <Send className="size-4" />
              Send Request
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-100">
          <div
            className="h-full bg-zinc-900 transition-all duration-300"
            style={{ width: `${usedPct}%` }}
          />
        </div>
      </div>

      {/* Last result */}
      {result && (
        <div
          className={cn(
            'panel p-5 mt-4 text-[13px] font-mono break-all',
            result.success
              ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
              : 'border-red-200 bg-red-50/50 text-red-900',
          )}
        >
          {JSON.stringify(result)}
        </div>
      )}

      {/* Request log */}
      {log.length > 0 && (
        <div className="panel p-6 mt-4">
          <div className="section-title mb-3">Request log</div>
          <div className="flex flex-wrap gap-1.5">
            {log.map((entry, i) => (
              <span
                key={`${entry.at}-${i}`}
                title={new Date(entry.at).toLocaleTimeString()}
                className={cn(
                  'size-3 rounded-sm',
                  entry.allowed ? 'bg-emerald-500' : 'bg-red-500',
                )}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Newest first — green allowed, red blocked.
          </p>
        </div>
      )}
    </div>
  );
}
