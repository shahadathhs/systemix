'use client';

import {
  decryptString,
  encryptString,
  generateKeyBytes,
} from '@systemix/cipher';
import { Check, Copy, KeyRound, Loader2, Lock, LockOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function CipherPage() {
  const [key, setKey] = useState<Uint8Array | null>(null);
  const [plaintext, setPlaintext] = useState('Meet me at dawn. Bring coffee.');
  const [payload, setPayload] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [busy, setBusy] = useState<'encrypt' | 'decrypt' | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'key' | 'payload' | null>(null);

  const regenerateKey = useCallback(() => {
    setKey(generateKeyBytes());
    setDecrypted('');
    setError('');
  }, []);

  useEffect(() => {
    regenerateKey();
  }, [regenerateKey]);

  const handleEncrypt = async () => {
    if (!key || !plaintext) return;
    setBusy('encrypt');
    setError('');
    try {
      const result = await encryptString(plaintext, key);
      setPayload(result);
      setDecrypted('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleDecrypt = async () => {
    if (!key || !payload) return;
    setBusy('decrypt');
    setError('');
    try {
      const result = await decryptString(payload, key);
      setDecrypted(result);
    } catch {
      setError(
        'Decryption failed — wrong key, tampered ciphertext, or malformed payload.',
      );
    } finally {
      setBusy(null);
    }
  };

  const handleTamper = () => {
    if (payload.length < 10) return;
    const index = Math.floor(payload.length / 2);
    const flipped = payload[index] === 'A' ? 'B' : 'A';
    setPayload(payload.slice(0, index) + flipped + payload.slice(index + 1));
    setDecrypted('');
  };

  const copy = (what: 'key' | 'payload') => {
    const value = what === 'key' ? (key ? toHex(key) : '') : payload;
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(what);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Cipher
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          Authenticated AES-256-GCM. The random IV is embedded in the payload,
          and any tampering is detected — not decrypted.
        </p>
      </div>

      {/* Key */}
      <div className="panel p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="label mb-2 flex items-center gap-1.5">
              <KeyRound className="size-3.5" />
              AES-256 key
            </div>
            <code className="block text-xs font-mono text-zinc-800 break-all">
              {key ? toHex(key) : '…'}
            </code>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => copy('key')}
              className="btn-icon"
              title="Copy key"
            >
              {copied === 'key' ? (
                <Check className="size-4 text-emerald-600" />
              ) : (
                <Copy className="size-4" />
              )}
            </button>
            <button
              type="button"
              onClick={regenerateKey}
              className="btn btn-primary"
            >
              New key
            </button>
          </div>
        </div>
      </div>

      {/* Encrypt */}
      <div className="panel p-6 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Encrypt</h2>
          <button
            type="button"
            onClick={handleTamper}
            disabled={!payload}
            className="text-xs text-zinc-500 hover:text-zinc-950 disabled:opacity-40 underline underline-offset-2 decoration-zinc-300 hover:decoration-zinc-950"
            title="Flip a character in the payload to simulate tampering"
          >
            Tamper with payload
          </button>
        </div>
        <textarea
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          rows={2}
          className="field resize-none"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleEncrypt()}
            disabled={busy !== null || !plaintext || !key}
            className="btn btn-primary"
          >
            {busy === 'encrypt' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Lock className="size-4" />
            )}
            Encrypt
          </button>
        </div>

        {payload && (
          <div className="space-y-2 border-t border-zinc-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="label">Payload — IV + ciphertext + tag</span>
              <button
                type="button"
                onClick={() => copy('payload')}
                className="text-zinc-500 hover:text-zinc-950"
              >
                {copied === 'payload' ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
            <div className="mono-box text-emerald-800 bg-emerald-50/50 border-emerald-100">
              {payload}
            </div>
          </div>
        )}
      </div>

      {/* Decrypt */}
      <div className="panel p-6 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Decrypt</h2>
          <button
            type="button"
            onClick={() => void handleDecrypt()}
            disabled={busy !== null || !payload || !key}
            className="btn btn-ghost"
          >
            {busy === 'decrypt' ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <LockOpen className="size-4" />
            )}
            Decrypt
          </button>
        </div>

        {decrypted && (
          <div className="border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-mono text-emerald-900 break-all">
            {decrypted}
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {error}
          </div>
        )}

        {!decrypted && !error && (
          <p className="text-sm text-zinc-500">
            {payload
              ? 'Decrypt to recover the plaintext. Try “Tamper with payload” first to see authentication reject modified data.'
              : 'Encrypt something first.'}
          </p>
        )}
      </div>
    </div>
  );
}
