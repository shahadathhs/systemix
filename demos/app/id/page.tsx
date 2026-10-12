'use client';

import { cn } from '@/lib/utils';
import { generateId, generateUlid, generateUuid, isUuid } from '@systemix/id';
import { Check, Copy, Fingerprint, RefreshCw, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useCallback, useState } from 'react';

type IdKind = 'nanoid' | 'ulid' | 'uuid';

const KINDS: { id: IdKind; label: string; description: string }[] = [
  { id: 'nanoid', label: 'nanoid', description: 'URL-safe random ID' },
  { id: 'ulid', label: 'ULID', description: 'Sortable, timestamped' },
  { id: 'uuid', label: 'UUID v4', description: 'RFC 9562 random UUID' },
];

interface GeneratedId {
  id: string;
  kind: IdKind;
  valid: string | false;
}

export default function IdPage() {
  const [kind, setKind] = useState<IdKind>('nanoid');
  const [size, setSize] = useState(21);
  const [ids, setIds] = useState<GeneratedId[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateBatch = useCallback(() => {
    const batch = Array.from({ length: 5 }, () => {
      let value: string;
      if (kind === 'nanoid') value = generateId({ size });
      else if (kind === 'ulid') value = generateUlid();
      else value = generateUuid();
      return { id: value, kind, valid: isUuid(value) };
    });
    setIds((prev) => [...batch, ...prev].slice(0, 30));
  }, [kind, size]);

  const copyAt = (index: number) => {
    void navigator.clipboard.writeText(ids[index].id).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
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
            ID Generator
          </h1>
          <p className="text-muted-foreground">
            Unique, non-secret identifiers with bias-free, crypto-grade
            randomness. ULIDs sort chronologically; UUIDs follow RFC 9562.
          </p>
        </div>

        {/* Controls */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={cn(
                  'p-4 rounded-xl text-left transition-colors border',
                  kind === k.id
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-slate-800/50 border-transparent hover:bg-slate-700/50',
                )}
              >
                <div
                  className={cn(
                    'font-mono text-sm font-medium',
                    kind === k.id ? 'text-cyan-400' : 'text-white',
                  )}
                >
                  {k.label}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {k.description}
                </div>
              </button>
            ))}
          </div>

          {kind === 'nanoid' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-300">
                  Size
                </label>
                <span className="text-sm font-mono text-cyan-400">{size}</span>
              </div>
              <input
                type="range"
                min="6"
                max="64"
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={generateBatch}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium transition-all active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              Generate 5 IDs
            </button>
            {ids.length > 0 && (
              <button
                onClick={() => setIds([])}
                className="px-4 rounded-xl border border-slate-500/40 hover:bg-slate-800/50 text-slate-300 transition-all active:scale-95"
                title="Clear list"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {ids.length > 0 && (
          <div className="glass rounded-2xl p-6 space-y-2">
            {ids.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index < 5 ? index * 0.05 : 0 }}
                className="group flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Fingerprint className="w-4 h-4 text-cyan-400 shrink-0" />
                  <code className="text-sm font-mono text-white truncate selection:bg-cyan-500/30">
                    {item.id}
                  </code>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.kind === 'uuid' && (
                    <span
                      className={cn(
                        'text-[10px] font-mono px-2 py-0.5 rounded-full',
                        item.valid
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400',
                      )}
                    >
                      {item.valid ? 'valid v4' : 'invalid'}
                    </span>
                  )}
                  {item.kind === 'ulid' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                      {new Date(
                        parseInt(item.id.slice(0, 10), 32),
                      ).toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => copyAt(index)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
