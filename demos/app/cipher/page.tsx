'use client';

import { cn } from '@/lib/utils';
import {
  decryptString,
  encryptString,
  generateKeyBytes,
} from '@systemix/cipher';
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Lock,
  LockOpen,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { motion } from 'motion/react';
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
      setTimeout(() => setCopied(null), 2000);
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
            Cipher Demo
          </h1>
          <p className="text-muted-foreground">
            Authenticated AES-256-GCM encryption. The random IV is embedded in
            the payload, and any tampering is detected — not decrypted.
          </p>
        </div>

        {/* Key */}
        <div className="glass rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                AES-256 key
              </div>
              <div className="text-xs font-mono text-cyan-300 break-all selection:bg-cyan-500/30">
                {key ? toHex(key) : '…'}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => copy('key')}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-white transition-colors"
                title="Copy key"
              >
                {copied === 'key' ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={regenerateKey}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                New Key
              </button>
            </div>
          </div>
        </div>

        {/* Encrypt */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Encrypt</h3>
          <textarea
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-slate-800/50 border border-slate-600/50 px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-cyan-500/50"
          />
          <div className="flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleTamper}
              disabled={!payload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 disabled:opacity-40 text-sm font-medium transition-all"
              title="Flip a character in the payload to simulate tampering"
            >
              <ShieldAlert className="w-4 h-4" />
              Tamper
            </button>
            <button
              onClick={() => void handleEncrypt()}
              disabled={busy !== null || !plaintext || !key}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-medium transition-all active:scale-95"
            >
              {busy === 'encrypt' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
              Encrypt
            </button>
          </div>

          {payload && (
            <div className="space-y-2 border-t border-slate-700/50 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Payload [IV + ciphertext + tag]
                </span>
                <button
                  onClick={() => copy('payload')}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === 'payload' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="text-xs font-mono text-emerald-300 break-all selection:bg-cyan-500/30">
                {payload}
              </div>
            </div>
          )}
        </div>

        {/* Decrypt */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Decrypt</h3>
            <button
              onClick={() => void handleDecrypt()}
              disabled={busy !== null || !payload || !key}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-500/40 hover:bg-slate-800/50 disabled:opacity-40 text-white text-sm font-medium transition-all active:scale-95"
            >
              {busy === 'decrypt' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LockOpen className="w-4 h-4" />
              )}
              Decrypt
            </button>
          </div>

          {decrypted && (
            <motion.div
              key={decrypted}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30',
                'text-sm font-mono text-emerald-300 break-all',
              )}
            >
              {decrypted}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          {!decrypted && !error && (
            <p className="text-sm text-muted-foreground">
              {payload
                ? 'Run Decrypt to recover the plaintext. Try Tamper first to see authentication reject modified data.'
                : 'Encrypt something first.'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
