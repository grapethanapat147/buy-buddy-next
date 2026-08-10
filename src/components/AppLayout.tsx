import Link from "next/link";
import { isAdminEmail } from "@/lib/admin";
import { getPlanIds } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import Mascot from "./Mascot";
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
            <Mascot mood="happy" size={26} />
            <span className="font-display tracking-tight">BuyBuddy</span>
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
          <Mascot mood="happy" size={26} />
          <span className="font-display tracking-tight">BuyBuddy</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-cream-sunk hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            ดูของ
          </Link>
          <Link
            href="/plan"
            aria-label="กระเป๋า"
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-ink-soft transition-colors hover:bg-cream-sunk hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
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
              aria-label="Admin"
              className="flex items-center justify-center rounded-full p-1.5 text-ink-soft transition-colors hover:bg-cream-sunk hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
              </svg>
            </Link>
          )}
          {user && <SignOutButton />}
        </nav>
      </header>
      <main className="rounded-2xl bg-cream-card p-5 shadow-soft">{children}</main>
    </div>
  );
}
