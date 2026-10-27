'use client';

import {
  base64UrlToBytes,
  createKeyring,
  generateKeyBytes,
  parseEnvelope,
} from '@systemix/cipher';
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export default function CipherPage() {
  const [keys, setKeys] = useState<Record<string, Uint8Array>>({});
  const [currentId, setCurrentId] = useState('k1');
  const key: Uint8Array | null = keys[currentId] ?? null;
  const ring = useMemo(
    () =>
      Object.keys(keys).length > 0
        ? createKeyring({ keys, current: currentId })
        : null,
    [keys, currentId],
  );
  const [plaintext, setPlaintext] = useState('Meet me at dawn. Bring coffee.');
  const [payload, setPayload] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [busy, setBusy] = useState<'encrypt' | 'decrypt' | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'key' | 'payload' | null>(null);

  const regenerateKey = useCallback(() => {
    setKeys({ k1: generateKeyBytes() });
    setCurrentId('k1');
    setPayload('');
    setDecrypted('');
    setError('');
  }, []);

  // New key becomes current; old keys stay so existing payloads still decrypt.
  const rotateKey = () => {
    const next = `k${Object.keys(keys).length + 1}`;
    setKeys({ ...keys, [next]: generateKeyBytes() });
    setCurrentId(next);
    setDecrypted('');
    setError('');
  };

  useEffect(() => {
    regenerateKey();
  }, [regenerateKey]);

  const handleEncrypt = async () => {
    if (!ring || !plaintext) return;
    setBusy('encrypt');
    setError('');
    try {
      const result = await ring.encryptString(plaintext);
      setPayload(result);
      setDecrypted('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const handleDecrypt = async () => {
    if (!ring || !payload) return;
    setBusy('decrypt');
    setError('');
    try {
      const result = await ring.decryptString(payload);
      setDecrypted(result);
    } catch {
      setError(
        'Decryption failed — wrong key, tampered ciphertext, or malformed payload.',
      );
    } finally {
      setBusy(null);
    }
  };

  const handleReencrypt = async () => {
    if (!ring || !payload) return;
    setBusy('encrypt');
    try {
      const text = await ring.decryptString(payload);
      setPayload(await ring.encryptString(text));
      setDecrypted('');
      setError('');
    } catch {
      setError('Could not re-encrypt — payload no longer decrypts.');
    } finally {
      setBusy(null);
    }
  };

  const envelope = useMemo(() => {
    if (!payload) return null;
    try {
      return parseEnvelope(base64UrlToBytes(payload));
    } catch {
      return null;
    }
  }, [payload]);

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
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Cipher
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Authenticated AES-256-GCM in a versioned envelope: header, key id,
          random IV, ciphertext and tag in one value. Tampering — including
          with the header — is detected, not decrypted. Rotate the key and old
          payloads still decrypt.
        </p>
      </div>

      {/* Key */}
      <div className="panel p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="label mb-2 flex items-center gap-1.5">
              <KeyRound className="size-3.5" />
              AES-256 key
              <span className="ml-1 font-mono text-ink normal-case">
                · id {currentId}
              </span>
            </div>
            <code className="block text-xs font-mono text-ink break-all">
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
              className="btn btn-ghost"
              title="Start over with a single fresh key"
            >
              New key
            </button>
            <button
              type="button"
              onClick={rotateKey}
              disabled={!key}
              className="btn btn-primary"
              title="Add a new current key; keep old keys for decrypting"
            >
              <RefreshCw className="size-4" />
              Rotate
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
            className="text-xs text-faint hover:text-ink disabled:opacity-40 underline underline-offset-2 decoration-line-strong hover:decoration-ink"
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
          <div className="space-y-2 border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className="label">Payload — envelope (base64url)</span>
              <button
                type="button"
                onClick={() => copy('payload')}
                className="text-faint hover:text-ink"
              >
                {copied === 'payload' ? (
                  <Check className="size-3.5 text-emerald-600" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
            <div className="mono-box status-ok">{payload}</div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line border border-line text-xs">
              {envelope ? (
                <>
                  <div className="bg-surface p-2.5">
                    <div className="label mb-1">Header</div>
                    <span className="font-mono text-ink">
                      SX v{envelope.version}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5">
                    <div className="label mb-1">Key id</div>
                    <span className="font-mono text-ink">
                      {envelope.keyId || '(none)'}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5 min-w-0">
                    <div className="label mb-1">IV (12 B)</div>
                    <span className="font-mono text-ink break-all">
                      {toHex(envelope.iv)}
                    </span>
                  </div>
                  <div className="bg-surface p-2.5">
                    <div className="label mb-1">Ciphertext + tag</div>
                    <span className="font-mono text-ink">
                      {envelope.ciphertext.length} B
                    </span>
                  </div>
                </>
              ) : (
                <div className="bg-surface p-2.5 col-span-full text-faint">
                  Not a valid envelope (tampered or malformed).
                </div>
              )}
            </div>

            {ring && envelope && ring.needsRotation(payload) && (
              <div className="flex items-center justify-between gap-3 border px-3 py-2.5 text-sm status-err">
                <span>
                  <span className="font-mono">needsRotation</span>: encrypted
                  with <span className="font-mono">{envelope.keyId}</span>, the
                  current key is{' '}
                  <span className="font-mono">{currentId}</span>.
                </span>
                <button
                  type="button"
                  onClick={() => void handleReencrypt()}
                  disabled={busy !== null}
                  className="btn btn-ghost shrink-0"
                >
                  Re-encrypt
                </button>
              </div>
            )}
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
          <div className="border px-3 py-2.5 text-sm font-mono status-ok break-all">
            {decrypted}
          </div>
        )}

        {error && (
          <div className="border px-3 py-2.5 text-sm status-err">{error}</div>
        )}

        {!decrypted && !error && (
          <p className="text-sm text-faint">
            {payload
              ? 'Decrypt to recover the plaintext. Try “Tamper with payload” first to see authentication reject modified data.'
              : 'Encrypt something first.'}
          </p>
        )}
      </div>
    </div>
  );
}
