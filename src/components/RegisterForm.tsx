"use client";

import { useActionState } from "react";
import Link from "next/link";
import LineLoginButton from "@/components/LineLoginButton";
import PasswordField from "@/components/PasswordField";
import { signUp, type AuthState } from "@/app/auth-actions";

const field =
  "mt-1 w-full rounded-xl border border-ink/10 bg-cream-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signUp, null);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">สมัครเพื่อเซฟแผน</h1>
      <p className="mt-1 text-sm text-ink-soft">
        สมัครด้วย LINE ครั้งเดียว แผนที่จัดไว้จะถูกเก็บให้อัตโนมัติ ไม่หาย
      </p>

      <div className="mt-4">
        <LineLoginButton label="สมัคร / เข้าสู่ระบบด้วย LINE" />
      </div>
      <p className="mt-2 text-center text-xs text-ink-muted">
        🔒 ใช้แค่เก็บแผนของคุณ — ไม่มีการเก็บเงินหรือส่งต่อข้อมูลให้ใคร
      </p>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
        <span className="h-px flex-1 bg-ink/10" />
        หรือใช้อีเมล
        <span className="h-px flex-1 bg-ink/10" />
      </div>

    <form action={formAction}>
      {state?.error && <p className="mb-3 text-sm text-rose-600">{state.error}</p>}

      <label className="block text-sm text-ink-soft">ชื่อ</label>
      <input name="name" className={field} />

      <label className="mt-3 block text-sm text-ink-soft">อีเมล</label>
      <input type="email" name="email" required className={field} />

      <label className="mt-3 block text-sm text-ink-soft">รหัสผ่าน</label>
      <PasswordField name="password" autoComplete="new-password" />

      <label className="mt-3 block text-sm text-ink-soft">ยืนยันรหัสผ่าน</label>
      <PasswordField name="password_confirmation" autoComplete="new-password" />

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
    </div>
  );
}
