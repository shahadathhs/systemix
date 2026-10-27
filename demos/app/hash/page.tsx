'use client';

import { cn } from '@/lib/utils';
import { Check, Copy, Loader2, RefreshCw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { hashAction, verifyAction, type HashParams } from './actions';
import { DEMO_LIMITS } from './limits';

type Algorithm = HashParams['algorithm'];

const ALGORITHMS: { id: Algorithm; label: string; hint: string }[] = [
  {
    id: 'argon2id',
    label: 'Argon2id',
    hint: 'OWASP first choice. Memory-hard.',
  },
  { id: 'scrypt', label: 'scrypt', hint: 'Memory-hard fallback.' },
  { id: 'pbkdf2', label: 'PBKDF2', hint: 'FIPS-140 environments.' },
];

type VerifyResult =
  | { state: 'idle' }
  | { state: 'busy' }
  | {
      state: 'done';
      match: boolean;
      ms: number;
      rehash: boolean;
      legacy: boolean;
    }
  | { state: 'error'; error: string };

function Slider({
  label,
  value,
  min,
  max,
  step,
  format = (v: number) => v.toLocaleString(),
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="label">{label}</span>
        <span className="text-sm font-mono text-ink">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-ink cursor-pointer"
      />
    </div>
  );
}

export default function HashPage() {
  const [password, setPassword] = useState('hunter2');
  const [algorithm, setAlgorithm] = useState<Algorithm>('argon2id');
  const [memoryCost, setMemoryCost] = useState(19_456);
  const [timeCost, setTimeCost] = useState(2);
  const [parallelism, setParallelism] = useState(1);
  const [costFactor, setCostFactor] = useState(2 ** 15);
  const [iterations, setIterations] = useState(600_000);

  const [encoded, setEncoded] = useState('');
  const [hashMs, setHashMs] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [verifyInput, setVerifyInput] = useState('hunter2');
  const [verify, setVerify] = useState<VerifyResult>({ state: 'idle' });

  const handleHash = useCallback(async () => {
    if (!password) return;
    setBusy(true);
    setError('');
    setVerify({ state: 'idle' });
    const result = await hashAction(password, {
      algorithm,
      memoryCost,
      timeCost,
      parallelism,
      costFactor,
      iterations,
    });
    if (result.ok) {
      setEncoded(result.encoded);
      setHashMs(result.ms);
    } else {
      setError(result.error);
    }
    setBusy(false);
  }, [
    password,
    algorithm,
    memoryCost,
    timeCost,
    parallelism,
    costFactor,
    iterations,
  ]);

  // Hash once on load; after that, hash on demand (Argon2id runs server-side).
  useEffect(() => {
    void handleHash();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    if (!encoded || !verifyInput) return;
    setVerify({ state: 'busy' });
    const r = await verifyAction(verifyInput, encoded);
    setVerify(
      r.ok
        ? {
            state: 'done',
            match: r.match,
            ms: r.ms,
            rehash: r.rehash,
            legacy: r.legacy,
          }
        : { state: 'error', error: r.error },
    );
  };

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(encoded).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const { argon2, scrypt, pbkdf2 } = DEMO_LIMITS;

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Hash Playground
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Hash and verify passwords with Argon2id, scrypt or PBKDF2. The output
          is a standard PHC string that embeds the algorithm, parameters, and
          salt — store it as a single column. Hashing runs on the server
          (Argon2id needs <code className="font-mono">node:crypto</code>), so
          the demo caps parameters and rate-limits requests.
        </p>
      </div>

      {/* Encoded hash */}
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="label">Encoded hash (PHC)</span>
          <div className="flex items-center gap-3">
            {hashMs !== null && !busy && (
              <span className="text-xs font-mono text-faint">{hashMs} ms</span>
            )}
            {busy && <Loader2 className="size-4 text-faint animate-spin" />}
          </div>
        </div>
        <code className="block text-[13px] font-mono text-ink break-all min-h-[2.5rem]">
          {encoded || '…'}
        </code>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-sm status-err border px-3 py-2.5">
            <X className="size-4" />
            {error}
          </div>
        )}
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
                maxLength={DEMO_LIMITS.passwordLength}
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
            <span className="label">Algorithm</span>
            <div className="flex gap-2">
              {ALGORITHMS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAlgorithm(a.id)}
                  className={cn(
                    'segment font-mono text-xs',
                    algorithm === a.id ? 'segment-active' : '',
                  )}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-faint">
              {ALGORITHMS.find((a) => a.id === algorithm)?.hint}
            </p>
          </div>

          {algorithm === 'argon2id' && (
            <>
              <Slider
                label="Memory"
                value={memoryCost}
                min={8_192}
                max={argon2.memoryCost}
                step={1_024}
                format={(v) => `${(v / 1024).toFixed(0)} MiB`}
                onChange={setMemoryCost}
              />
              <Slider
                label="Passes"
                value={timeCost}
                min={1}
                max={argon2.timeCost}
                step={1}
                onChange={setTimeCost}
              />
              <Slider
                label="Parallelism"
                value={parallelism}
                min={1}
                max={argon2.parallelism}
                step={1}
                onChange={setParallelism}
              />
            </>
          )}
          {algorithm === 'scrypt' && (
            <Slider
              label="Cost N"
              value={costFactor}
              min={2 ** 10}
              max={scrypt.costFactor}
              step={1}
              format={(v) => `2^${Math.round(Math.log2(v))}`}
              onChange={(v) => setCostFactor(2 ** Math.round(Math.log2(v)))}
            />
          )}
          {algorithm === 'pbkdf2' && (
            <Slider
              label="Iterations"
              value={iterations}
              min={100_000}
              max={pbkdf2.iterations}
              step={50_000}
              onChange={setIterations}
            />
          )}

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
                setVerify({ state: 'idle' });
              }}
              className="field font-mono"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleVerify()}
            disabled={!encoded || !verifyInput || verify.state === 'busy'}
            className="btn btn-ghost w-full"
          >
            Verify against hash
          </button>

          {verify.state === 'done' && verify.match && (
            <div className="flex items-center gap-2 text-sm status-ok border px-3 py-2.5">
              <Check className="size-4" />
              Password matches
              <span className="ml-auto font-mono text-xs">{verify.ms} ms</span>
            </div>
          )}
          {verify.state === 'done' && !verify.match && (
            <div className="flex items-center gap-2 text-sm status-err border px-3 py-2.5">
              <X className="size-4" />
              Password does not match
              <span className="ml-auto font-mono text-xs">{verify.ms} ms</span>
            </div>
          )}
          {verify.state === 'error' && (
            <div className="flex items-center gap-2 text-sm status-err border px-3 py-2.5">
              <X className="size-4" />
              {verify.error}
            </div>
          )}

          {verify.state === 'done' && (
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-mono text-ink">needsRehash</span>:{' '}
              <span className="font-mono text-ink">
                {String(verify.rehash)}
              </span>
              {verify.rehash
                ? verify.legacy
                  ? ' — legacy 0.1.x format.'
                  : ' — weaker than the current Argon2id defaults (19 MiB, 2 passes, 1 lane). Re-hash on next login.'
                : ' — matches the current defaults.'}
            </p>
          )}

          <p className="text-xs text-faint leading-relaxed pt-1">
            Hash with a lower cost or another algorithm, then verify: the
            <code> needsRehash</code> result compares the stored hash to the
            current Argon2id defaults.
          </p>
        </div>
      </div>
    </div>
  );
}
