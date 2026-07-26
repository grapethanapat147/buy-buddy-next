"use client";

import { useTransition } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import NoteEditor from "./NoteEditor";
import { removeFromPlan } from "@/app/actions";
import { tierLabel, type ProductTier } from "@/lib/recommendation/types";

const THRESHOLD = 72;

/**
 * One row in the My Plan list. Swipe left (or tap "เลื่อนออก") to remove the item
 * from the bag; a red "เอาออก" hint reveals as the card slides.
 */
export default function PlanItemRow({
  productId,
  name,
  icon,
  tier,
  lineTotal,
  suggested,
  note,
}: {
  productId: number;
  name: string;
  icon: string;
  tier: ProductTier;
  lineTotal: number;
  suggested: boolean;
  note: string;
}) {
  const [pending, startTransition] = useTransition();
  const x = useMotionValue(0);
  const hint = useTransform(x, [-THRESHOLD, -16], [1, 0]);

  const remove = () => startTransition(() => removeFromPlan(productId));

  return (
    <div className="relative overflow-hidden rounded-xl">
      <motion.div
        style={{ opacity: hint }}
        className="pointer-events-none absolute inset-0 flex items-center justify-end gap-1.5 rounded-xl bg-rose-50 pr-5 text-sm font-semibold text-rose-600"
      >
        <span aria-hidden="true">🗑️</span> เอาออกจากกระเป๋า
      </motion.div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0.05 }}
        dragDirectionLock
        onDragEnd={(_, info) => {
          if (info.offset.x < -THRESHOLD) {
            remove();
          }
        }}
        className={`relative z-10 touch-pan-y rounded-xl border p-3 shadow-soft ${
          suggested ? "border-amber-200 bg-amber-50" : "border-ink/8 bg-cream-card"
        } ${pending ? "opacity-50" : ""}`}
      >
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-lg" aria-hidden="true">
            {icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-ink">{name}</div>
            <div className="text-xs text-ink-muted">{tierLabel[tier]}</div>
          </div>
          <span className="text-sm text-ink-soft tabular-nums">
            ฿{lineTotal.toLocaleString()}
          </span>
          <button
            onClick={remove}
            disabled={pending}
            className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink-soft transition hover:bg-cream-sunk active:scale-95 disabled:opacity-60"
          >
            เลื่อนออก
          </button>
        </div>
        <NoteEditor productId={productId} note={note} />
      </motion.div>
    </div>
  );
}
