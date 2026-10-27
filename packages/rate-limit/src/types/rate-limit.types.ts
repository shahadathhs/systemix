/**
 * Rate limiting algorithms.
 */
export type RateLimitAlgorithm =
  'fixed-window' | 'sliding-window' | 'token-bucket';

export type MaybePromise<T> = T | Promise<T>;

/**
 * Mutable state stored per key. Different algorithms use different fields.
 */
export interface RateLimitEntry {
  /** Fixed window: requests recorded in the current window. */
  count: number;
  /** Fixed window / sliding window: epoch ms when the window resets. */
  resetAt: number;
  /** Sliding window: request timestamps inside the current window. */
  timestamps: number[];
  /** Token bucket: tokens currently available. */
  tokens: number;
  /** Token bucket: epoch ms of the last refill. */
  lastRefill: number;
  /**
   * Epoch ms after which this entry is equivalent to no entry at all (window
   * over, no requests left in the log, or bucket refilled to capacity). Stores
   * use it to drop idle keys.
   */
  expiresAt: number;
}

/** Minimal read/write access to entries, used by the algorithms. */
export interface EntryStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): unknown;
}

/** What a store needs to apply a hit. */
export interface RateLimitPolicy {
  limit: number;
  windowMs: number;
  algorithm: RateLimitAlgorithm;
}

/**
 * Storage contract. A store owns the algorithm step, so a distributed store
 * can run it atomically where the data lives (e.g. one Redis Lua script per
 * hit) instead of a racy read-modify-write over the network.
 *
 * Requirements for implementers:
 * - `hit` must be atomic per key: concurrent hits may never both read the
 *   same state and both be allowed past the limit.
 * - `peek` must not change state.
 * - Idle keys should expire (see `RateLimitEntry.expiresAt`) so memory is
 *   bounded by active keys.
 */
export interface RateLimitStore {
  /** Atomically records a hit and returns the verdict. */
  hit(
    key: string,
    policy: RateLimitPolicy,
    now: number,
  ): MaybePromise<RateLimitResult>;
  /** Reads the current verdict without recording a hit. */
  peek(
    key: string,
    policy: RateLimitPolicy,
    now: number,
  ): MaybePromise<RateLimitResult>;
  delete(key: string): MaybePromise<void>;
  clear(): MaybePromise<void>;
  /** Optional: drops entries that are idle at `now`. */
  sweep?(now: number): MaybePromise<void>;
}

export interface RateLimitOptions {
  /**
   * Maximum requests per window (or bucket capacity for token-bucket).
   */
  limit: number;

  /**
   * Window size in milliseconds.
   */
  windowMs: number;

  /**
   * Rate limiting algorithm.
   * @default 'fixed-window'
   */
  algorithm?: RateLimitAlgorithm;

  /**
   * Custom storage. @default a bounded, self-sweeping in-memory store
   */
  store?: RateLimitStore;

  /**
   * Time source in epoch ms. Override in tests.
   * @default Date.now
   */
  clock?: () => number;
}

export interface RateLimitResult {
  /** Whether the request is allowed. */
  success: boolean;
  /** Configured limit. */
  limit: number;
  /** Requests remaining in the current window (0 when exhausted). */
  remaining: number;
  /** Epoch ms when the window resets / bucket refills fully. */
  reset: number;
  /** Milliseconds to wait before a request can succeed (0 when allowed). */
  retryAfter: number;
}

export interface RateLimiter {
  /** Records a hit for the key and returns the verdict. */
  limit(key: string): Promise<RateLimitResult>;
  /** Reads the current state without recording a hit. */
  peek(key: string): Promise<RateLimitResult>;
  /** Clears the state for one key. */
  resetKey(key: string): Promise<void>;
  /** Clears all state. */
  resetAll(): Promise<void>;
  /** Drops idle entries (the default store also does this on its own). */
  sweep(): Promise<void>;
  /** The resolved configuration. */
  readonly options: Required<RateLimitOptions>;
}

export interface ExpressRateLimitOptions extends RateLimitOptions {
  /**
   * Extracts the rate limit key from the request.
   * @default the request's IP address (IPv6 grouped by /64), or 'unknown'.
   * `X-Forwarded-For` is never read by default because clients can forge it:
   * behind a proxy, configure the proxy trust in your framework so `req.ip`
   * is right, or supply your own keyGenerator.
   */
  keyGenerator?: (request: ExpressLikeRequest) => string;

  /**
   * Response body sent when the limit is exceeded.
   * @default { message: 'Too many requests, please try again later.' }
   */
  message?: unknown;

  /**
   * HTTP status code for blocked requests.
   * @default 429
   */
  statusCode?: number;

  /**
   * Response headers to emit:
   * - 'legacy': `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
   *   (seconds until reset) and, when blocked, `Retry-After`.
   * - 'draft': `RateLimit` and `RateLimit-Policy` from
   *   draft-ietf-httpapi-ratelimit-headers (still an Internet-Draft).
   * - 'both', or `false` for none.
   * @default 'legacy'
   */
  headers?: RateLimitHeadersFormat | false;

  /**
   * If the store throws (e.g. Redis is down), let the request through
   * instead of passing the error to `next`.
   * @default false
   */
  failOpen?: boolean;
}

export type RateLimitHeadersFormat = 'legacy' | 'draft' | 'both';

/**
 * Structural subset of an Express request — keeps the package
 * dependency-free while staying type-compatible with Express.
 */
export interface ExpressLikeRequest {
  headers: Record<string, string | string[] | undefined>;
  ip?: string;
  socket?: { remoteAddress?: string | null };
}

/**
 * Structural subset of an Express response.
 */
export interface ExpressLikeResponse {
  status(code: number): ExpressLikeResponse;
  setHeader(name: string, value: string): unknown;
  json(body: unknown): unknown;
}
