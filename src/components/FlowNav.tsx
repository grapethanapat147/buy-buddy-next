import Link from "next/link";

/**
 * Back / next navigation row for the wizard → recommendations → plan flow.
 * Both sides are optional (e.g. the last step has no "next"). When only one is
 * present it stretches to full width.
 */
export default function FlowNav({
  backHref,
  backLabel = "ย้อนกลับ",
  nextHref,
  nextLabel = "ไปต่อ",
}: {
  backHref?: string;
  backLabel?: string;
  nextHref?: string;
  nextLabel?: string;
}) {
  return (
    <div className="mt-6 flex items-center gap-3">
      {backHref && (
        <Link
          href={backHref}
          className="flex-1 whitespace-nowrap rounded-full border border-ink/15 px-3 py-3.5 text-center text-sm font-semibold text-ink-soft transition hover:bg-cream-sunk active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          ← {backLabel}
        </Link>
      )}
      {nextHref && (
        <Link
          href={nextHref}
          className="flex-[2] rounded-full bg-brand p-3.5 text-center text-base font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          {nextLabel} →
        </Link>
      )}
    </div>
  );
}
