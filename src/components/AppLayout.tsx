import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";
import { getPlanIds } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

export default async function AppLayout({
  children,
  minimal = false,
}: {
  children: React.ReactNode;
  /** Auth pages: hide the browse/bag nav, show a back arrow instead. */
  minimal?: boolean;
}) {
  const ids = await getPlanIds();
  const count = ids.length;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAdmin = isAdminEmail(user?.email, process.env.ADMIN_EMAILS);

  if (minimal) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-10 pt-5">
        <header className="mb-4 flex items-center gap-3">
          <Link
            href="/"
            aria-label="ย้อนกลับ"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition hover:bg-cream-sunk active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-xl font-bold text-brand">
            <span aria-hidden="true">🛍️</span> BuyBuddy
          </Link>
        </header>
        <main className="rounded-2xl bg-cream-card p-5 shadow-soft">{children}</main>
      </div>
    );
  }

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
          {isAdmin && (
            <Link
              href="/admin"
              className="text-ink-soft transition-colors hover:text-ink"
              title="Admin"
            >
              ⚙️
            </Link>
          )}
          {user && <SignOutButton />}
        </nav>
      </header>
      <main className="rounded-2xl bg-cream-card p-5 shadow-soft">{children}</main>
    </div>
  );
}
