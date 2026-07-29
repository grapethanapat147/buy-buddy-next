"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import LineLoginButton from "@/components/LineLoginButton";
import PasswordField from "@/components/PasswordField";
import { signIn, type AuthState } from "@/app/auth-actions";

const lineError: Record<string, string> = {
  line_unconfigured: "ยังไม่ได้ตั้งค่า LINE Login — แจ้งแอดมินให้เพิ่ม LINE_CHANNEL_ID/SECRET",
};

const field =
  "mt-1 w-full rounded-xl border border-ink/10 bg-cream-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signIn, null);
  const errorParam = useSearchParams().get("error");
  const lineMsg = errorParam
    ? lineError[errorParam] ?? "เข้าสู่ระบบด้วย LINE ไม่สำเร็จ ลองใหม่อีกครั้ง"
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">เข้าสู่ระบบ</h1>
      <p className="mt-1 text-sm text-ink-soft">เข้าด้วย LINE ได้เลย เร็วกว่า</p>
      {lineMsg && <p className="mt-3 text-sm text-rose-600">{lineMsg}</p>}

      <div className="mt-4">
        <LineLoginButton />
      </div>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-ink/10" />
        หรือใช้อีเมล
        <span className="h-px flex-1 bg-ink/10" />
      </div>

    <form action={formAction}>
      {state?.error && <p className="mb-3 text-sm text-rose-600">{state.error}</p>}

      <label className="block text-sm text-ink-soft">อีเมล</label>
      <input type="email" name="email" required className={field} />

      <label className="mt-3 block text-sm text-ink-soft">รหัสผ่าน</label>
      <PasswordField name="password" autoComplete="current-password" />

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-full bg-brand p-4 text-lg font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60"
      >
        เข้าสู่ระบบ
      </button>
      <Link
        href="/register"
        className="mt-3 block text-center text-sm text-ink-soft transition-colors hover:text-brand"
      >
        ยังไม่มีบัญชี? สมัคร
      </Link>
    </form>
    </div>
  );
}
