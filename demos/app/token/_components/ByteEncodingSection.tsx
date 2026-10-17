'use client';

import {
  bytesToAlphanumeric,
  bytesToBase64,
  bytesToBase64Url,
  bytesToHex,
} from '@systemix/token/token';
import { getRandomBytes } from '@systemix/token/common';
import { Info, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CopyButton } from './CopyButton';

export function ByteEncodingSection() {
  const [byteLength, setByteLength] = useState(16);
  const [bytes, setBytes] = useState<Uint8Array>(() => getRandomBytes(16));

  const regenerate = useCallback(() => {
    setBytes(getRandomBytes(byteLength));
  }, [byteLength]);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const encodings = {
    hex: bytesToHex(bytes),
    base64: bytesToBase64(bytes),
    base64url: bytesToBase64Url(bytes),
    alphanumeric: bytesToAlphanumeric(bytes),
  };

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-semibold text-zinc-950">
        <Info className="w-5 h-5 text-zinc-400" />
        Byte Encoding
      </h2>
      <div className="panel p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-600">
                Byte length
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={byteLength}
                  onChange={(e) => setByteLength(parseInt(e.target.value, 10))}
                  className="w-24 h-2 bg-zinc-200 rounded-lg accent-zinc-900"
                />
                <span className="text-sm font-mono text-zinc-400 w-8">
                  {byteLength}
                </span>
              </div>
            </div>
            <button
              onClick={regenerate}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
              title="Regenerate bytes"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {(['hex', 'base64', 'base64url', 'alphanumeric'] as const).map(
            (format) => (
              <div key={format} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
                    {format}
                  </span>
                  <CopyButton text={encodings[format]} />
                </div>
                <pre className="font-mono text-sm text-zinc-950 break-all bg-zinc-50 border border-zinc-200 rounded-md px-3 py-2">
                  {encodings[format]}
                </pre>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
