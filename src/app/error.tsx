"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import Mascot from "@/components/Mascot";

/**
 * Fallback for a page that failed to render — in practice a Supabase read that
 * was still failing after readWithRetry gave up. The bag lives in a cookie, so
 * nothing the user picked is lost; say so, and offer a one-tap retry.
 */
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [retrying, startRetry] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 pb-10 pt-16 sm:px-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-cream-card px-6 py-10 text-center shadow-soft">
        <Mascot mood="thinking" size={72} />
        <div>
          <h1 className="text-xl font-semibold text-ink">โหลดหน้านี้ไม่สำเร็จ</h1>
          <p className="mt-1.5 whitespace-pre-line text-sm text-ink-soft">
            {"ระบบสะดุดชั่วคราว ลองใหม่อีกครั้งได้เลย\nของในกระเป๋ายังอยู่ครบ"}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={retrying}
            onClick={() => startRetry(() => unstable_retry())}
            className="rounded-full bg-brand-grad px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-105 active:scale-95 disabled:opacity-60"
          >
            {retrying ? "กำลังลองใหม่…" : "ลองใหม่"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm text-ink-soft transition hover:bg-cream-sunk active:scale-95"
          >
            กลับหน้าแรก
          </Link>
        </div>
        {error.digest && <p className="text-[11px] text-ink-muted">รหัสอ้างอิง {error.digest}</p>}
      </div>
    </div>
  );
}
