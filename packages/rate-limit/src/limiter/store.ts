import { RateLimitEntry, RateLimitStore } from '../types/rate-limit.types';

/**
 * In-memory store backed by a Map. Suitable for single-process servers
 * and development. Implement RateLimitStore for distributed backends.
 */
export class InMemoryStore implements RateLimitStore {
  private readonly map = new Map<string, RateLimitEntry>();

  get(key: string): RateLimitEntry | undefined {
    return this.map.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.map.set(key, entry);
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  entries(): IterableIterator<[string, RateLimitEntry]> {
    return this.map.entries();
  }

  get size(): number {
    return this.map.size;
  }
}

/**
 * Creates a fresh entry pre-filled with zero values. Algorithms mutate
 * only the fields they use.
 */
export function createEntry(now: number): RateLimitEntry {
  return {
    count: 0,
    resetAt: now,
    timestamps: [],
    tokens: 0,
    lastRefill: now,
  };
}
