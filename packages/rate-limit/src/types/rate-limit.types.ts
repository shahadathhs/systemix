/**
 * Rate limiting algorithms.
 */
export type RateLimitAlgorithm =
  'fixed-window' | 'sliding-window' | 'token-bucket';

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
}

/**
 * Pluggable storage contract. Implement it to back the limiter with
 * Redis, a database, or any other store.
 */
export interface RateLimitStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
  /** Iterates over all [key, entry] pairs — used by sweeps and resetAll. */
  entries(): IterableIterator<[string, RateLimitEntry]>;
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
   * Custom storage. @default in-memory Map
   */
  store?: RateLimitStore;
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
  limit(key: string): RateLimitResult;
  /** Reads the current state without recording a hit. */
  peek(key: string): RateLimitResult;
  /** Clears the state for one key. */
  resetKey(key: string): void;
  /** Clears all state. */
  resetAll(): void;
  /** Removes expired entries from the store. */
  sweep(): void;
  /** The resolved configuration. */
  readonly options: Required<RateLimitOptions>;
}

export interface ExpressRateLimitOptions extends RateLimitOptions {
  /**
   * Extracts the rate limit key from the request.
   * @default request IP
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
   * Emits standard RateLimit-* response headers.
   * @default true
   */
  standardHeaders?: boolean;
}

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
