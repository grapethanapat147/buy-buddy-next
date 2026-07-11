import Link from "next/link";
import { getPlanIds } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ids = await getPlanIds();
  const count = ids.length;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-xl px-4 pb-10 pt-5">
      <header className="mb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1.5 text-xl font-bold text-brand">
          <span aria-hidden="true">🛍️</span> BuyBuddy
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/explore"
            className="text-ink-soft transition-colors hover:text-ink"
          >
            เลือกดูของ
          </Link>
          <Link
            href="/plan"
            className="flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink"
          >
            กระเป๋า
            <span
              key={count}
              className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-50 px-1.5 text-xs font-semibold text-brand-700 animate-pop"
            >
              {count}
            </span>
          </Link>
          {user && <SignOutButton />}
        </nav>
      </header>
      <main className="rounded-2xl bg-cream-card p-5 shadow-soft">{children}</main>
    </div>
  );
}
