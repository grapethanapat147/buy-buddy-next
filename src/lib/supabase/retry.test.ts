import { describe, expect, it, vi } from "vitest";
import { readWithRetry, SupabaseReadError } from "./retry";

type Result = { data: number[] | null; error: { message: string; code?: string } | null; status: number };

const ok = (data: number[]): Result => ({ data, error: null, status: 200 });
const fail = (status: number, message = "boom", code?: string): Result => ({
  data: null,
  error: { message, code },
  status,
});

/**
 * A query-builder stub that answers with each result in turn. `signals` records the
 * AbortSignal each run was awaited with (undefined = plain await, memoizable by Next).
 */
function queryReturning(...results: Result[]) {
  const signals: Array<AbortSignal | undefined> = [];
  const run = vi.fn(() => {
    const result = results[Math.min(signals.length, results.length - 1)];
    let signal: AbortSignal | undefined;
    const query = {
      abortSignal(s: AbortSignal) {
        signal = s;
        return query;
      },
      then<A = Result, B = never>(
        onFulfilled?: ((r: Result) => A | PromiseLike<A>) | null,
        onRejected?: ((e: unknown) => B | PromiseLike<B>) | null,
      ): PromiseLike<A | B> {
        signals.push(signal);
        return Promise.resolve(result).then(onFulfilled, onRejected);
      },
    };
    return query;
  });
  return Object.assign(run, { signals });
}

const noWait = { delaysMs: [0, 0], sleep: async () => {} };

describe("readWithRetry", () => {
  it("returns the data straight away when the first try works", async () => {
    const run = queryReturning(ok([1, 2]));
    await expect(readWithRetry("products", run, noWait)).resolves.toEqual([1, 2]);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("retries a gateway error and returns the data once it clears", async () => {
    const run = queryReturning(fail(502), fail(504), ok([7]));
    await expect(readWithRetry("products", run, noWait)).resolves.toEqual([7]);
    expect(run).toHaveBeenCalledTimes(3);
  });

  it("gives up after the last delay and throws a real Error, not the plain Supabase object", async () => {
    const run = queryReturning(fail(500, "upstream down"));
    const err = await readWithRetry("products", run, noWait).catch((e) => e);

    expect(run).toHaveBeenCalledTimes(3);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(SupabaseReadError);
    expect(err.message).toBe("products read failed (status 500): upstream down");
    expect(err.status).toBe(500);
  });

  it("does not retry errors that will not fix themselves (permissions, bad query)", async () => {
    const run = queryReturning(fail(401, "permission denied for table products", "42501"));
    const err = await readWithRetry("products", run, noWait).catch((e) => e);

    expect(run).toHaveBeenCalledTimes(1);
    expect(err.message).toBe("products read failed (status 401, 42501): permission denied for table products");
    expect(err.code).toBe("42501");
  });

  it("leaves network failures (status 0) to postgrest-js, which already retried them", async () => {
    const run = queryReturning(fail(0, "TypeError: fetch failed"));
    await expect(readWithRetry("products", run, noWait)).rejects.toThrow("status 0");
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("sends every retry with its own AbortSignal so Next's fetch memo cannot replay the failure", async () => {
    const run = queryReturning(fail(502), fail(502), ok([1]));
    await readWithRetry("products", run, noWait);

    const [first, second, third] = run.signals;
    expect(first).toBeUndefined();
    expect(second).toBeInstanceOf(AbortSignal);
    expect(third).toBeInstanceOf(AbortSignal);
    expect(second).not.toBe(third);
  });

  it("waits the configured delay between tries", async () => {
    const sleep = vi.fn(async () => {});
    const run = queryReturning(fail(522), fail(522), ok([1]));
    await readWithRetry("products", run, { delaysMs: [300, 900], sleep });
    expect(sleep.mock.calls).toEqual([[300], [900]]);
  });

  it("passes a not-found null through untouched", async () => {
    const run = vi.fn(async () => ({ data: null, error: null, status: 200 }));
    await expect(readWithRetry("product", run, noWait)).resolves.toBeNull();
  });
});
