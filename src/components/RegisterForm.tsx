"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthState } from "@/app/auth-actions";

const field =
  "mt-1 w-full rounded-xl border border-ink/10 bg-cream-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUp, null);

  return (
    <form action={formAction}>
      <h1 className="text-2xl font-semibold text-ink">สมัครเพื่อเซฟแผน</h1>
      <p className="mt-1 text-sm text-ink-soft">
        แผนที่จัดไว้จะถูกเก็บให้อัตโนมัติ ไม่หาย
      </p>
      {state?.error && <p className="mt-3 text-sm text-rose-600">{state.error}</p>}

      <label className="mt-4 block text-sm text-ink-soft">ชื่อ</label>
      <input name="name" className={field} />

      <label className="mt-3 block text-sm text-ink-soft">อีเมล</label>
      <input type="email" name="email" required className={field} />

      <label className="mt-3 block text-sm text-ink-soft">รหัสผ่าน</label>
      <input type="password" name="password" required className={field} />

      <label className="mt-3 block text-sm text-ink-soft">ยืนยันรหัสผ่าน</label>
      <input type="password" name="password_confirmation" required className={field} />

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-full bg-brand p-4 text-lg font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60"
      >
        สมัครและเซฟแผน
      </button>
      <Link
        href="/login"
        className="mt-3 block text-center text-sm text-ink-soft transition-colors hover:text-brand"
      >
        มีบัญชีแล้ว? เข้าสู่ระบบ
      </Link>
    </form>
  );
}
