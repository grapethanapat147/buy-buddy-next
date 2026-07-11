"use client";

import { useTransition } from "react";
import { signOut } from "@/app/auth-actions";

export default function SignOutButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => signOut())}
      className="text-ink-soft transition-colors hover:text-ink disabled:opacity-60"
    >
      ออกจากระบบ
    </button>
  );
}
