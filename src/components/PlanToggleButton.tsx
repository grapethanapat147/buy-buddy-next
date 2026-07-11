"use client";

import { useTransition } from "react";
import { addToPlan, removeFromPlan } from "@/app/actions";

export default function PlanToggleButton({
  productId,
  inPlan,
}: {
  productId: number;
  inPlan: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      if (inPlan) {
        await removeFromPlan(productId);
      } else {
        await addToPlan(productId);
      }
    });
  };

  if (inPlan) {
    return (
      <button
        onClick={toggle}
        disabled={pending}
        aria-label="เอาออกจากกระเป๋า"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition active:scale-90 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60"
      >
        <span className="animate-pop" aria-hidden="true">
          ✓
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label="เก็บลงกระเป๋า"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition hover:bg-cream-sunk active:scale-90 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60"
    >
      +
    </button>
  );
}
