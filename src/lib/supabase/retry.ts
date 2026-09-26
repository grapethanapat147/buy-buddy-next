/**
 * Supabase reads that ride out a brief upstream hiccup.
 *
 * postgrest-js already retries GETs on network failures and on 503/520 (1s → 2s → 4s),
 * so this only covers the gateway errors it gives up on straight away. It also turns
 * the plain `{ message, code }` object Supabase hands back into a real Error — throwing
 * that object as-is is what made Next log a bare "[object Object]" (digest …@E394).
 */

/** Gateway/origin errors that usually clear on a second try. 503 and 520 are left to postgrest-js. */
const TRANSIENT_STATUS = new Set([500, 502, 504, 521, 522, 523, 524]);
const DEFAULT_DELAYS_MS = [300, 900];

type SupabaseErrorLike = { message?: string; code?: string };
type ReadResult<T> = { data: T | null; error: SupabaseErrorLike | null; status: number };
/** A Supabase query builder: awaitable, and able to take an AbortSignal. */
type Query<T> = PromiseLike<ReadResult<T>> & {
  abortSignal?: (signal: AbortSignal) => PromiseLike<ReadResult<T>>;
};

export class SupabaseReadError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(label: string, status: number, error: SupabaseErrorLike) {
    const code = error.code ? `, ${error.code}` : "";
    super(`${label} read failed (status ${status}${code}): ${error.message ?? "unknown error"}`, {
      cause: error,
    });
    this.name = "SupabaseReadError";
    this.status = status;
    this.code = error.code ?? "";
  }
}

export function isTransientStatus(status: number): boolean {
  return TRANSIENT_STATUS.has(status);
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Run a Supabase query, retrying transient gateway errors, and return its data.
 * `run` must build a fresh query each call — a query builder fires on every await.
 *
 * Retries carry a fresh AbortSignal on purpose: Next memoizes identical GET fetches
 * for the whole render and only skips fetches that have a signal, so without one a
 * retry would just be handed the same cached 502 again.
 */
export async function readWithRetry<T>(
  label: string,
  run: () => Query<T>,
  { delaysMs = DEFAULT_DELAYS_MS, sleep = wait }: { delaysMs?: number[]; sleep?: (ms: number) => Promise<void> } = {},
): Promise<T | null> {
  for (let attempt = 0; ; attempt++) {
    const query = run();
    const { data, error, status } = await (attempt > 0 && query.abortSignal
      ? query.abortSignal(new AbortController().signal)
      : query);
    if (!error) {
      return data;
    }
    if (!isTransientStatus(status) || attempt >= delaysMs.length) {
      throw new SupabaseReadError(label, status, error);
    }
    console.warn(
      `[supabase] ${label} read got ${status}, retry ${attempt + 1}/${delaysMs.length}: ${error.message}`,
    );
    await sleep(delaysMs[attempt]);
  }
}
