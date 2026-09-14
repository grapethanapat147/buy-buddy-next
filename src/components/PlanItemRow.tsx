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
  buyOn,
}: {
  productId: number;
  name: string;
  icon: string;
  imageUrl?: string | null;
  tier: ProductTier;
  lineTotal: number;
  suggested: boolean;
  note: string;
  /** When this item comes up in the restock calendar, e.g. "วันที่ 15 · อีก 3 วัน". */
  buyOn?: string;
}) {
  const [pending, startTransition] = useTransition();
  const x = useMotionValue(0);
  const hint = useTransform(x, [-THRESHOLD, -16], [1, 0]);

  const remove = () => startTransition(() => removeFromPlan(productId));

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <motion.div
        style={{ opacity: hint }}
        className="pointer-events-none absolute inset-0 flex items-center justify-end gap-1.5 rounded-2xl bg-rose-50 pr-5 text-sm font-semibold text-rose-600"
      >
        เอาออกจากกระเป๋า
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
        className={`relative z-10 touch-pan-y rounded-2xl border p-3 shadow-soft ${
          suggested ? "border-amber-200 bg-amber-50" : "border-ink/8 bg-cream-card"
        } ${pending ? "opacity-50" : ""}`}
      >
        <div className="flex items-center gap-3">
          <IconTile icon={icon} imageUrl={imageUrl} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-ink">{name}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-ink-muted">
              <span>{tierLabel[tier]}</span>
              {buyOn && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-brand-700">{buyOn}</span>
                </>
              )}
            </div>
          </div>
          <span className="shrink-0 text-base font-bold tabular-nums text-ink">
            ฿{lineTotal.toLocaleString()}
          </span>
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
