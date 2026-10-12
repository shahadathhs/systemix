/**
 * Tests for @systemix/rate-limit – fixed-window and sliding-window algorithms
 * (deterministic time control via the now parameter).
 */
import { createRunner } from '@systemix/runner';
import {
  InMemoryStore,
  hitFixedWindow,
  hitSlidingWindow,
} from '../dist/index.js';

export const { run, getCounts } = createRunner(({ assert }) => {
  // --- Fixed window ---
  let store = new InMemoryStore();
  let now = 1_000;

  let r = hitFixedWindow(store, 'ip:1', 3, 1_000, now);
  assert(r.success && r.remaining === 2, 'fixed-window allows first request');
  r = hitFixedWindow(store, 'ip:1', 3, 1_000, now + 1);
  r = hitFixedWindow(store, 'ip:1', 3, 1_000, now + 2);
  assert(r.success && r.remaining === 0, 'fixed-window allows up to limit');

  r = hitFixedWindow(store, 'ip:1', 3, 1_000, now + 3);
  assert(!r.success && r.retryAfter > 0, 'fixed-window blocks after limit');
  assert(r.remaining === 0, 'fixed-window reports no remaining');

  r = hitFixedWindow(store, 'ip:1', 3, 1_000, now + 1_000);
  assert(r.success && r.remaining === 2, 'fixed-window resets after window');

  r = hitFixedWindow(store, 'ip:2', 3, 1_000, now);
  assert(r.success && r.remaining === 2, 'fixed-window keys are independent');

  // --- Sliding window ---
  store = new InMemoryStore();
  now = 5_000;

  for (let i = 0; i < 3; i++) {
    hitSlidingWindow(store, 'ip:1', 3, 1_000, now + i);
  }
  r = hitSlidingWindow(store, 'ip:1', 3, 1_000, now + 3);
  assert(!r.success, 'sliding-window blocks when full');

  r = hitSlidingWindow(store, 'ip:1', 3, 1_000, now + 1_001);
  assert(r.success, 'sliding-window admits as old requests expire');
  assert(r.remaining === 1, 'sliding-window remaining is accurate');

  const partial = hitSlidingWindow(store, 'ip:1', 3, 1_000, now + 1_002);
  assert(
    partial.success && partial.remaining === 1,
    'sliding-window refills smoothly',
  );

  const full = hitSlidingWindow(store, 'ip:1', 3, 1_000, now + 1_003);
  assert(
    full.success && full.remaining === 0,
    'sliding-window fills up smoothly',
  );

  const blocked = hitSlidingWindow(store, 'ip:1', 3, 1_000, now + 1_004);
  assert(!blocked.success, 'sliding-window blocks once full');

  // Two expirations later only the newest request remains
  const later = hitSlidingWindow(store, 'ip:1', 3, 1_000, now + 2_003);
  assert(later.success, 'sliding-window recovers as window rolls');
});
