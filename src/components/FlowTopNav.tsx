import Link from "next/link";

export const arrowBtnClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition hover:bg-cream-sunk hover:text-ink active:scale-90 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-40";

export function ArrowLeft() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/**
 * Top-corner navigation for the flow: a back arrow on the left, and on the right
 * a labelled pill — a bare arrow left people guessing where it went.
 */
export default function FlowTopNav({
  backHref,
  nextHref,
  nextLabel,
}: {
  backHref?: string;
  nextHref?: string;
  /** Names the destination; without it the forward pill is not rendered. */
  nextLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      {backHref ? (
        <Link href={backHref} aria-label="ย้อนกลับ" className={arrowBtnClass}>
          <ArrowLeft />
        </Link>
      ) : (
        <span className="h-9 w-9" />
      )}
      {nextHref && nextLabel ? (
        <Link
          href={nextHref}
          className="flex h-9 items-center gap-1.5 rounded-full border border-ink/15 pl-3.5 pr-3 text-sm font-medium text-ink-soft transition hover:bg-cream-sunk hover:text-ink active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          {nextLabel}
          <ArrowRight />
        </Link>
      ) : (
        <span className="h-9 w-9" />
      )}
    </div>
  );
}
