'use client';

import { cn } from '@/lib/utils';
import { Loader2, Shield } from 'lucide-react';
import { useState } from 'react';
import {
  decodeAction,
  encodeAction,
  generateKeyAction,
  verifyAction,
} from '../actions';
import { DEMO_ALGORITHMS, type DemoAlgorithm } from '../limits';
import { CopyButton } from './CopyButton';

type SignedTab = 'encode' | 'decode' | 'verify';

const INPUT =
  'w-full px-4 py-2 bg-raised border border-line-strong text-ink placeholder:text-faint focus:outline-none focus:border-[var(--ink)] focus:ring-2 focus:ring-[var(--accent)]/20';
const MONO = `${INPUT} font-mono text-sm`;
const PRE =
  'font-mono text-sm text-ink bg-sunken border border-line px-3 py-2 overflow-x-auto';

const HINTS: Record<DemoAlgorithm, string> = {
  HS256: 'Shared secret (32+ bytes).',
  ES256: 'ECDSA P-256. Small, fast signatures.',
  EdDSA: 'Ed25519. Fast, no parameter choices.',
  PS256: 'RSA-PSS. Preferred over RS256 for RSA.',
  RS256: 'RSA PKCS#1 v1.5. Widely supported.',
};

/** Reads `alg` from the (unverified) header, only to preselect a choice. */
function peekAlg(token: string): DemoAlgorithm | null {
  try {
    const part = token.trim().split('.')[0];
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const alg = (JSON.parse(json) as { alg?: string }).alg;
    return DEMO_ALGORITHMS.find((a) => a === alg) ?? null;
  } catch {
    return null;
  }
}

const isSymmetric = (alg: DemoAlgorithm) => alg === 'HS256';

const tabButton = (active: boolean) =>
  cn(
    'px-4 py-2 text-sm font-medium transition-all',
    active
      ? 'bg-ink text-ink'
      : 'bg-raised border border-line-strong text-faint hover:bg-sunken',
  );

function AlgPicker({
  value,
  onChange,
}: {
  value: DemoAlgorithm;
  onChange: (a: DemoAlgorithm) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted">Algorithm</label>
      <div className="flex flex-wrap gap-2">
        {DEMO_ALGORITHMS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => onChange(a)}
            className={cn('px-4 h-9 text-sm font-mono', tabButton(value === a))}
          >
            {a}
          </button>
        ))}
      </div>
      <p className="text-xs text-faint">{HINTS[value]}</p>
    </div>
  );
}

export function SignedTokenSection() {
  const [tab, setTab] = useState<SignedTab>('encode');
  const [alg, setAlg] = useState<DemoAlgorithm>('HS256');
  const [signKey, setSignKey] = useState('');
  const [verifyKey, setVerifyKey] = useState('');
  const [kid, setKid] = useState('');
  const [payloadJson, setPayloadJson] = useState(
    '{"userId": "123", "role": "admin"}',
  );
  const [expiresIn, setExpiresIn] = useState(3600);
  const [encodedToken, setEncodedToken] = useState('');
  const [encodeError, setEncodeError] = useState('');
  const [decodeToken, setDecodeToken] = useState('');
  const [decodeResult, setDecodeResult] = useState<
    { header: unknown; payload: unknown } | { error: string } | null
  >(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyAlg, setVerifyAlg] = useState<DemoAlgorithm>('HS256');
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    payload?: unknown;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateKey = async () => {
    setLoading(true);
    setEncodeError('');
    const r = await generateKeyAction(alg);
    if (r.ok) {
      setSignKey(r.signKey);
      setVerifyKey(r.verifyKey);
    } else {
      setEncodeError(r.error);
    }
    setLoading(false);
  };

  const handleEncode = async () => {
    setLoading(true);
    setEncodeError('');
    setEncodedToken('');
    const r = await encodeAction(payloadJson, alg, signKey, expiresIn, kid);
    if (r.ok) setEncodedToken(r.token);
    else setEncodeError(r.error);
    setLoading(false);
  };

  const handleDecode = async () => {
    if (!decodeToken.trim()) return;
    setLoading(true);
    setDecodeResult(null);
    const r = await decodeAction(decodeToken);
    setDecodeResult(
      r.ok ? { header: r.header, payload: r.payload } : { error: r.error },
    );
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyToken.trim() || !verifyKey.trim()) return;
    setLoading(true);
    setVerifyResult(null);
    const r = await verifyAction(verifyToken, verifyKey, verifyAlg);
    setVerifyResult(
      r.ok ? { valid: true, payload: r.payload } : { valid: false, error: r.error },
    );
    setLoading(false);
  };

  const onVerifyTokenChange = (value: string) => {
    setVerifyToken(value);
    const detected = peekAlg(value);
    if (detected) setVerifyAlg(detected);
  };

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-ink">
        <Shield className="w-5 h-5 text-faint" />
        Signed Tokens
      </h2>
      <div className="panel p-6 space-y-6">
        <p className="text-xs text-faint leading-relaxed">
          Signing runs on the server (it needs <code>node:crypto</code>). Keys
          are throwaway demo keys — never paste a real secret. Verify only
          accepts the algorithm you pick, never the token&apos;s own{' '}
          <code>alg</code> header.
        </p>

        <div className="flex gap-2">
          {(['encode', 'decode', 'verify'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(tabButton(tab === t), 'capitalize')}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'encode' && (
          <div className="space-y-4">
            <AlgPicker
              value={alg}
              onChange={(a) => {
                setAlg(a);
                setSignKey('');
                setVerifyKey('');
                setEncodedToken('');
                setEncodeError('');
              }}
            />

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-muted">
                  {isSymmetric(alg) ? 'Secret' : 'Private key (PEM)'}
                </label>
                <button
                  type="button"
                  onClick={() => void handleGenerateKey()}
                  disabled={loading}
                  className="text-xs text-ink hover:underline disabled:opacity-50"
                >
                  Generate {isSymmetric(alg) ? 'secret' : 'key pair'}
                </button>
              </div>
              {isSymmetric(alg) ? (
                <input
                  type="text"
                  value={signKey}
                  onChange={(e) => setSignKey(e.target.value)}
                  placeholder="At least 32 bytes — or press Generate"
                  className={INPUT}
                />
              ) : (
                <textarea
                  value={signKey}
                  onChange={(e) => setSignKey(e.target.value)}
                  rows={5}
                  placeholder="-----BEGIN PRIVATE KEY----- — or press Generate"
                  className={MONO}
                />
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">
                Key id (<code>kid</code>, optional)
              </label>
              <input
                type="text"
                value={kid}
                onChange={(e) => setKid(e.target.value)}
                placeholder="2026-10"
                className={cn(INPUT, 'w-48')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">
                Payload (JSON)
              </label>
              <textarea
                value={payloadJson}
                onChange={(e) => setPayloadJson(e.target.value)}
                rows={4}
                className={MONO}
                placeholder='{"userId": "123"}'
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">
                Expires in (seconds, 0 = none)
              </label>
              <input
                type="number"
                min="0"
                value={expiresIn}
                onChange={(e) =>
                  setExpiresIn(parseInt(e.target.value, 10) || 0)
                }
                className={cn(INPUT, 'w-32')}
              />
            </div>
            <button
              onClick={() => void handleEncode()}
              disabled={loading || !signKey.trim()}
              className="px-6 py-2 bg-ink hover:bg-zinc-700 text-ink font-medium disabled:opacity-50 h-10 px-4 text-sm"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                'Encode'
              )}
            </button>
            {encodeError && (
              <p className="text-sm text-red-600">{encodeError}</p>
            )}
            {encodedToken && (
              <div className="space-y-2 pt-4 border-t border-line">
                <label className="text-sm font-medium text-muted">Token</label>
                <div className="flex gap-2">
                  <pre className={cn(PRE, 'flex-1 break-all')}>
                    {encodedToken}
                  </pre>
                  <CopyButton text={encodedToken} />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDecodeToken(encodedToken);
                      setTab('decode');
                    }}
                    className="text-xs text-ink hover:underline"
                  >
                    Try in Decode →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyToken(encodedToken);
                      setVerifyAlg(alg);
                      setTab('verify');
                    }}
                    className="text-xs text-ink hover:underline"
                  >
                    Try in Verify →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'decode' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Token</label>
              <textarea
                value={decodeToken}
                onChange={(e) => setDecodeToken(e.target.value)}
                rows={3}
                placeholder="Paste signed token (header.payload.signature)"
                className={MONO}
              />
              <p className="text-xs text-faint">
                Decoding does not verify anything — never trust a decoded
                payload.
              </p>
            </div>
            <button
              onClick={() => void handleDecode()}
              disabled={loading}
              className="px-6 py-2 bg-ink hover:bg-zinc-700 text-ink font-medium disabled:opacity-50 h-10 px-4 text-sm"
            >
              {loading ? 'Decoding…' : 'Decode'}
            </button>
            {decodeResult && (
              <div className="space-y-4 pt-4 border-t border-line">
                {'error' in decodeResult ? (
                  <p className="text-sm text-red-600">{decodeResult.error}</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted">
                        Header
                      </label>
                      <pre className={PRE}>
                        {JSON.stringify(decodeResult.header, null, 2)}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted">
                        Payload
                      </label>
                      <pre className={PRE}>
                        {JSON.stringify(decodeResult.payload, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === 'verify' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">Token</label>
              <textarea
                value={verifyToken}
                onChange={(e) => onVerifyTokenChange(e.target.value)}
                rows={3}
                placeholder="Paste a signed token"
                className={MONO}
              />
            </div>
            <AlgPicker value={verifyAlg} onChange={setVerifyAlg} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted">
                {isSymmetric(verifyAlg) ? 'Secret' : 'Public key (PEM)'}
              </label>
              {isSymmetric(verifyAlg) ? (
                <input
                  type="text"
                  value={verifyKey}
                  onChange={(e) => setVerifyKey(e.target.value)}
                  placeholder="Same secret used to encode"
                  className={INPUT}
                />
              ) : (
                <textarea
                  value={verifyKey}
                  onChange={(e) => setVerifyKey(e.target.value)}
                  rows={5}
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  className={MONO}
                />
              )}
            </div>
            <p className="text-xs text-faint">
              Try picking a different algorithm than the token&apos;s — it is
              rejected, not auto-detected.
            </p>
            <button
              onClick={() => void handleVerify()}
              disabled={loading || !verifyToken.trim() || !verifyKey.trim()}
              className="px-6 py-2 bg-ink hover:bg-zinc-700 text-ink font-medium disabled:opacity-50 h-10 px-4 text-sm"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            {verifyResult && (
              <div className="pt-4 border-t border-line space-y-2">
                {verifyResult.valid ? (
                  <>
                    <p className="text-sm font-medium text-emerald-600">
                      ✓ Valid signature
                    </p>
                    <pre className={PRE}>
                      {JSON.stringify(verifyResult.payload, null, 2)}
                    </pre>
                  </>
                ) : (
                  <p className="text-sm text-red-600">{verifyResult.error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
