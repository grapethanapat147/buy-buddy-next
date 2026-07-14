"use client";

import { useTransition } from "react";
import { addToPlan, removeFromPlan } from "@/app/actions";

export function AddToPlanButton({
  productId,
  inPlan,
}: {
  productId: number;
  inPlan: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      if (inPlan) {
        await removeFromPlan(productId);
      } else {
        await addToPlan(productId);
      }
    });

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`mt-4 w-full rounded-full p-4 text-lg font-semibold shadow-soft transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60 ${
        inPlan
          ? "bg-emerald-50 text-emerald-700"
          : "bg-brand text-white hover:bg-brand-500"
      }`}
    >
      {inPlan ? "✓ อยู่ในแผนแล้ว — เอาออก" : "+ ใส่ลงแผน"}
    </button>
  );
}

export function AddBundleItemButton({
  productId,
  inPlan,
}: {
  productId: number;
  inPlan: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      if (inPlan) {
        await removeFromPlan(productId);
      } else {
        await addToPlan(productId);
      }
    });

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold transition active:scale-90 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60 ${
        inPlan
          ? "bg-emerald-100 text-emerald-700"
          : "bg-brand-50 text-brand-700 hover:bg-brand-100"
      }`}
    >
      <span className="animate-pop" key={String(inPlan)}>
        {inPlan ? "✓ เพิ่มแล้ว" : "+ เพิ่ม"}
      </span>
    </button>
  );
}

export function AddBundleButton({ ids }: { ids: number[] }) {
  const [pending, startTransition] = useTransition();

  const addAll = () =>
    startTransition(async () => {
      for (const id of ids) {
        await addToPlan(id);
      }
    });

  return (
    <button
      onClick={addAll}
      disabled={pending}
      className="rounded-full border border-ink/15 px-3 py-1.5 text-sm text-ink transition hover:bg-cream-card active:scale-95 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none disabled:opacity-60"
    >
      ใส่ทั้งชุด
    </button>
  );
}
