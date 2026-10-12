/**
 * Tests for @systemix/rate-limit – token-bucket algorithm.
 */
import { createRunner } from '@systemix/runner';
import { InMemoryStore, hitTokenBucket } from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  const store = new InMemoryStore();
  const now = 1_000;

  // Bucket starts full: burst up to limit succeeds instantly
  let r;
  for (let i = 0; i < 5; i++) {
    r = hitTokenBucket(store, 'ip:1', 5, 1_000, now);
  }
  assert(r.success, 'token-bucket starts full and allows burst');
  assert(r.remaining === 0, 'bucket drains to zero after burst');

  r = hitTokenBucket(store, 'ip:1', 5, 1_000, now);
  assert(!r.success, 'token-bucket blocks when empty');

  // 1 token per 200ms: after 300ms at least one token is available
  r = hitTokenBucket(store, 'ip:1', 5, 1_000, now + 300);
  assert(r.success, 'token-bucket refills over time');
  assert(r.retryAfter === 0, 'allowed requests have zero retryAfter');

  // Wait for a full refill, then drain again
  const t2 = now + 1_500;
  let drained;
  for (let i = 0; i < 5; i++) {
    drained = hitTokenBucket(store, 'ip:1', 5, 1_000, t2);
  }
  const blocked2 = hitTokenBucket(store, 'ip:1', 5, 1_000, t2);
  assert(drained.success && !blocked2.success, 'bucket can be drained again');

  // Long wait refills the whole bucket
  const full = hitTokenBucket(store, 'ip:1', 5, 1_000, now + 10_000);
  assert(
    full.success && full.remaining === 4,
    'bucket caps refill at capacity',
  );

  // Different key starts full
  const other = hitTokenBucket(store, 'ip:2', 5, 1_000, now);
  assert(other.success && other.remaining === 4, 'buckets are independent');
});
