'use client';

import { cn } from '@/lib/utils';
import {
  createMonotonicUlid,
  createMonotonicUuidV7,
  generateId,
  generateUuid,
  isUuid,
  ulidTimestamp,
  uuidV7Timestamp,
} from '@systemix/id';
import { Check, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useCallback, useState } from 'react';

type IdKind = 'nanoid' | 'ulid' | 'uuid' | 'uuidv7';

// Monotonic: IDs from the same millisecond still sort in creation order.
const nextUlid = createMonotonicUlid();
const nextUuidV7 = createMonotonicUuidV7();

const KINDS = [
  { id: 'nanoid', label: 'nanoid', description: 'URL-safe random ID' },
  { id: 'ulid', label: 'ULID', description: 'Sortable, timestamped' },
  { id: 'uuid', label: 'UUID v4', description: 'RFC 9562 random UUID' },
  {
    id: 'uuidv7',
    label: 'UUID v7',
    description: 'Time-ordered, DB-friendly',
  },
] as const;

interface GeneratedId {
  id: string;
  kind: IdKind;
  valid: string | false;
  /** Creation time decoded from the ID itself (ULID, UUID v7). */
  timestamp?: number;
}

export default function IdPage() {
  const [kind, setKind] = useState<IdKind>('nanoid');
  const [size, setSize] = useState(21);
  const [ids, setIds] = useState<GeneratedId[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateBatch = useCallback(() => {
    const batch = Array.from({ length: 5 }, () => {
      if (kind === 'nanoid') {
        return { id: generateId({ size }), kind, valid: false as const };
      }
      if (kind === 'ulid') {
        const id = nextUlid();
        return {
          id,
          kind,
          valid: false as const,
          timestamp: ulidTimestamp(id),
        };
      }
      if (kind === 'uuidv7') {
        const id = nextUuidV7();
        return {
          id,
          kind,
          valid: isUuid(id, 7),
          timestamp: uuidV7Timestamp(id),
        };
      }
      const id = generateUuid();
      return { id, kind, valid: isUuid(id, 4) };
    });
    setIds((prev) => [...batch, ...prev].slice(0, 30));
  }, [kind, size]);

  const copyAt = (index: number) => {
    void navigator.clipboard.writeText(ids[index].id).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          ID Generator
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Unique, non-secret identifiers with bias-free crypto-grade randomness.
          ULIDs and UUID v7 sort by creation time and expose it — decoded below;
          UUID v4 is fully random. All follow their specs (RFC 9562 for UUIDs).
        </p>
      </div>

      {/* Controls */}
      <div className="panel p-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {KINDS.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => setKind(k.id)}
              className={cn(
                'p-3 border text-left transition-colors cursor-pointer',
                kind === k.id
                  ? 'border-accent bg-sunken'
                  : 'border-line hover:bg-sunken',
              )}
            >
              <div
                className={cn(
                  'font-mono text-sm font-medium',
                  kind === k.id ? 'text-ink' : 'text-muted',
                )}
              >
                {k.label}
              </div>
              <div className="text-xs text-faint mt-0.5">{k.description}</div>
            </button>
          ))}
        </div>

        {kind === 'nanoid' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="label">Size</span>
              <span className="text-sm font-mono text-ink">{size}</span>
            </div>
            <input
              type="range"
              min="6"
              max="64"
              value={size}
              onChange={(e) => setSize(parseInt(e.target.value))}
              className="w-full accent-ink cursor-pointer"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={generateBatch}
            className="btn btn-primary flex-1"
          >
            <RefreshCw className="size-4" />
            Generate 5 IDs
          </button>
          {ids.length > 0 && (
            <button
              type="button"
              onClick={() => setIds([])}
              className="btn-icon"
              title="Clear list"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {ids.length > 0 && (
        <div className="panel mt-4 divide-y divide-line">
          {ids.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="group flex items-center justify-between gap-4 px-4 py-3 hover:bg-sunken transition-colors"
            >
              <code className="text-[13px] font-mono text-ink truncate">
                {item.id}
              </code>
              <div className="flex items-center gap-2 shrink-0">
                {item.timestamp !== undefined && (
                  <span className="text-[10px] font-mono text-faint">
                    {new Date(item.timestamp).toISOString().slice(11, 23)}
                  </span>
                )}
                {(item.kind === 'uuid' || item.kind === 'uuidv7') && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.5 rounded border',
                      item.valid ? 'chip-ok' : 'chip-err',
                    )}
                  >
                    {item.valid
                      ? `valid v${item.kind === 'uuidv7' ? 7 : 4}`
                      : 'invalid'}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => copyAt(index)}
                  className="text-faint hover:text-ink transition-colors"
                >
                  {copiedIndex === index ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
