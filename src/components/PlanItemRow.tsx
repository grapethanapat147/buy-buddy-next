"use client";

import { useTransition } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import IconTile from "./IconTile";
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
  imageUrl = null,
  tier,
  lineTotal,
  suggested,
  note,
}: {
  productId: number;
  name: string;
  icon: string;
  imageUrl?: string | null;
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
          <IconTile icon={icon} imageUrl={imageUrl} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-ink">{name}</div>
            <div className="mt-0.5 text-xs text-ink-muted">
              <span className="tabular-nums">฿{lineTotal.toLocaleString()}</span> · {tierLabel[tier]}
            </div>
          </div>
          <button
            onClick={remove}
            disabled={pending}
            aria-label="เอาออกจากกระเป๋า"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink-soft transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 active:scale-90 disabled:opacity-60"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <NoteEditor productId={productId} note={note} />
      </motion.div>
    </div>
  );
}
