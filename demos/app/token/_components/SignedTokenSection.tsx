'use client';

import { cn } from '@/lib/utils';
import {
  decodeSigned,
  encodeSigned,
  verifySigned,
  type SignedAlgorithm as TokenSignedAlgorithm,
} from '@systemix/token/signed';
import { Shield } from 'lucide-react';
import { useState } from 'react';
import { CopyButton } from './CopyButton';
import { SAMPLE_RSA_PRIVATE_KEY, SAMPLE_RSA_PUBLIC_KEY } from './constants';

type SignedTab = 'encode' | 'decode' | 'verify';

export function SignedTokenSection() {
  const [tab, setTab] = useState<SignedTab>('encode');
  const [encodeAlg, setEncodeAlg] = useState<TokenSignedAlgorithm>('HS256');
  const [secret, setSecret] = useState('my-secret-key');
  const [privateKey, setPrivateKey] = useState('');
  const [payloadJson, setPayloadJson] = useState(
    '{"userId": "123", "role": "admin"}',
  );
  const [expiresIn, setExpiresIn] = useState(3600);
  const [encodedToken, setEncodedToken] = useState('');
  const [decodeToken, setDecodeToken] = useState('');
  const [decodeResult, setDecodeResult] = useState<
    { header: unknown; payload: unknown } | { error: string } | null
  >(null);
  const [verifyToken, setVerifyToken] = useState('');
  const [verifyAlg, setVerifyAlg] = useState<TokenSignedAlgorithm | null>(null);
  const [verifySecret, setVerifySecret] = useState('');
  const [verifyPublicKey, setVerifyPublicKey] = useState('');
  const [verifyResult, setVerifyResult] = useState<{
    valid: boolean;
    payload?: unknown;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerifyTokenChange = (value: string) => {
    setVerifyToken(value);
    if (!value.trim()) {
      setVerifyAlg(null);
      return;
    }
    try {
      const decoded = decodeSigned(value.trim());
      setVerifyAlg(decoded.header.alg === 'RS256' ? 'RS256' : 'HS256');
    } catch {
      setVerifyAlg(null);
    }
  };

  const handleEncode = async () => {
    setLoading(true);
    try {
      let payload: Record<string, unknown>;
      try {
        payload = JSON.parse(payloadJson) as Record<string, unknown>;
      } catch {
        setEncodedToken('');
        return;
      }
      const key = encodeAlg === 'HS256' ? secret : privateKey;
      if (!key.trim()) {
        setEncodedToken(
          encodeAlg === 'HS256'
            ? 'Enter a secret'
            : 'Enter or load private key',
        );
        return;
      }
      const token = await encodeSigned(payload, key, {
        algorithm: encodeAlg,
        expiresIn: expiresIn > 0 ? expiresIn : undefined,
      });
      setEncodedToken(token);
    } catch (e) {
      setEncodedToken(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = () => {
    if (!decodeToken.trim()) return;
    setLoading(true);
    setDecodeResult(null);
    try {
      const decoded = decodeSigned(decodeToken.trim());
      setDecodeResult({ header: decoded.header, payload: decoded.payload });
    } catch (e) {
      setDecodeResult({
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyToken.trim()) return;
    const key = verifyAlg === 'RS256' ? verifyPublicKey : verifySecret;
    if (!key.trim()) return;
    setLoading(true);
    setVerifyResult(null);
    try {
      const algorithms: TokenSignedAlgorithm[] =
        verifyAlg === 'RS256' ? ['RS256'] : ['HS256'];
      const payload = await verifySigned(verifyToken.trim(), key.trim(), {
        algorithms,
      });
      setVerifyResult({ valid: true, payload });
    } catch (e) {
      setVerifyResult({
        valid: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-950">
        <Shield className="w-5 h-5 text-zinc-400" />
        Signed Tokens
      </h2>
      <div className="panel p-6 space-y-6">
        <div className="flex gap-2">
          {(['encode', 'decode', 'verify'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                tab === t
                  ? 'bg-zinc-900 text-zinc-950'
                  : 'bg-white border border-zinc-300 text-zinc-500 hover:bg-zinc-50',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'encode' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600">
                Algorithm
              </label>
              <div className="flex gap-2">
                {(['HS256', 'RS256'] as const).map((alg) => (
                  <button
                    key={alg}
                    onClick={() => setEncodeAlg(alg)}
                    className={cn(
                      'px-4 h-9 rounded-md text-sm font-medium transition-colors',
                      encodeAlg === alg
                        ? 'bg-zinc-900 text-zinc-950'
                        : 'bg-white border border-zinc-300 text-zinc-500 hover:bg-zinc-50',
                    )}
                  >
                    {alg}
                  </button>
                ))}
              </div>
            </div>
            {encodeAlg === 'HS256' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">
                  Secret
                </label>
                <input
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="my-secret-key"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-600">
                    Private key (PEM)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPrivateKey(SAMPLE_RSA_PRIVATE_KEY)}
                    className="text-xs text-zinc-950 hover:underline"
                  >
                    Use sample keys
                  </button>
                </div>
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  rows={6}
                  placeholder="-----BEGIN PRIVATE KEY-----"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600">
                Payload (JSON)
              </label>
              <textarea
                value={payloadJson}
                onChange={(e) => setPayloadJson(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
                placeholder='{"userId": "123"}'
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600">
                Expires in (seconds, 0 = none)
              </label>
              <input
                type="number"
                min="0"
                value={expiresIn}
                onChange={(e) =>
                  setExpiresIn(parseInt(e.target.value, 10) || 0)
                }
                className="w-32 px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
            <button
              onClick={handleEncode}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-950 font-medium disabled:opacity-50 rounded-md h-10 px-4 text-sm"
            >
              {loading ? 'Encoding…' : 'Encode'}
            </button>
            {encodedToken && !encodedToken.startsWith('Error') && (
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <label className="text-sm font-medium text-zinc-600">
                  Token
                </label>
                <div className="flex gap-2">
                  <pre className="flex-1 font-mono text-sm text-zinc-950 break-all bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 overflow-x-auto">
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
                    className="text-xs text-zinc-950 hover:underline"
                  >
                    Try in Decode →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyToken(encodedToken);
                      handleVerifyTokenChange(encodedToken);
                      if (encodeAlg === 'HS256') {
                        setVerifySecret(secret);
                      } else {
                        setVerifyPublicKey(SAMPLE_RSA_PUBLIC_KEY);
                      }
                      setTab('verify');
                    }}
                    className="text-xs text-zinc-950 hover:underline"
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
              <label className="text-sm font-medium text-zinc-600">Token</label>
              <textarea
                value={decodeToken}
                onChange={(e) => setDecodeToken(e.target.value)}
                rows={3}
                placeholder="Paste signed token (header.payload.signature)"
                className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
            <button
              onClick={handleDecode}
              disabled={loading}
              className="px-6 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-950 font-medium disabled:opacity-50 rounded-md h-10 px-4 text-sm"
            >
              {loading ? 'Decoding…' : 'Decode'}
            </button>
            {decodeResult && (
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                {'error' in decodeResult ? (
                  <p className="text-sm text-red-600">{decodeResult.error}</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-600">
                        Header
                      </label>
                      <pre className="font-mono text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 overflow-x-auto">
                        {JSON.stringify(decodeResult.header, null, 2)}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-600">
                        Payload
                      </label>
                      <pre className="font-mono text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 overflow-x-auto">
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
              <label className="text-sm font-medium text-zinc-600">Token</label>
              <textarea
                value={verifyToken}
                onChange={(e) => handleVerifyTokenChange(e.target.value)}
                rows={3}
                placeholder="Paste signed token (HMAC or RSA)"
                className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>
            {verifyAlg === 'RS256' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-600">
                    Public key (PEM)
                  </label>
                  <button
                    type="button"
                    onClick={() => setVerifyPublicKey(SAMPLE_RSA_PUBLIC_KEY)}
                    className="text-xs text-zinc-950 hover:underline"
                  >
                    Use sample keys
                  </button>
                </div>
                <textarea
                  value={verifyPublicKey}
                  onChange={(e) => setVerifyPublicKey(e.target.value)}
                  rows={6}
                  placeholder="-----BEGIN PUBLIC KEY-----"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 font-mono text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-600">
                  Secret
                </label>
                <input
                  type="text"
                  value={verifySecret}
                  onChange={(e) => setVerifySecret(e.target.value)}
                  placeholder="Same secret used to encode"
                  className="w-full px-4 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            )}
            <button
              onClick={handleVerify}
              disabled={
                loading ||
                !verifyToken.trim() ||
                !verifyAlg ||
                (verifyAlg === 'RS256'
                  ? !verifyPublicKey.trim()
                  : !verifySecret.trim())
              }
              className="px-6 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-700 text-zinc-950 font-medium disabled:opacity-50 rounded-md h-10 px-4 text-sm"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            {verifyResult && (
              <div className="pt-4 border-t border-zinc-100 space-y-2">
                {verifyResult.valid ? (
                  <>
                    <p className="text-sm font-medium text-emerald-600">
                      ✓ Valid signature
                    </p>
                    <pre className="font-mono text-sm text-zinc-950 bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2 overflow-x-auto">
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
