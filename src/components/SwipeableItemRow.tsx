"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import IconTile from "./IconTile";
import { addToPlan, removeFromPlan } from "@/app/actions";

const THRESHOLD = 64;

/**
 * A product row that can be toggled into/out of the plan by tapping the button
 * OR swiping: swipe right → add, swipe left → remove. State flips optimistically
 * so it never waits on the server round-trip.
 */
export default function SwipeableItemRow({
  productId,
  inPlan,
  icon,
  title,
  href,
  subtitle,
}: {
  productId: number;
  inPlan: boolean;
  icon: string;
  title: string;
  href: string;
  subtitle: React.ReactNode;
}) {
  const [optimisticInPlan, setOptimisticInPlan] = useOptimistic(inPlan);
  const [, startTransition] = useTransition();

  const x = useMotionValue(0);
  const addHint = useTransform(x, [0, THRESHOLD], [0, 1]);
  const removeHint = useTransform(x, [-THRESHOLD, 0], [1, 0]);

  const apply = (next: boolean) => {
    if (next === optimisticInPlan) {
      return;
    }
    startTransition(async () => {
      setOptimisticInPlan(next);
      if (next) {
        await addToPlan(productId);
      } else {
        await removeFromPlan(productId);
      }
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between rounded-xl bg-cream-sunk px-4">
        <motion.span
          style={{ opacity: addHint }}
          className="flex items-center gap-1 text-sm font-semibold text-brand-700"
        >
          ＋ เพิ่มลงกระเป๋า
        </motion.span>
        <motion.span
          style={{ opacity: removeHint }}
          className="ml-auto flex items-center gap-1 text-sm font-semibold text-rose-500"
        >
          เอาออก －
        </motion.span>
      </div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragDirectionLock
        whileTap={{ cursor: "grabbing" }}
        onDragEnd={(_, info) => {
          if (info.offset.x > THRESHOLD) {
            apply(true);
          } else if (info.offset.x < -THRESHOLD) {
            apply(false);
          }
        }}
        className={`relative z-10 flex touch-pan-y items-center gap-3 rounded-xl border p-3 shadow-soft transition-colors ${
          optimisticInPlan
            ? "border-brand/40 bg-brand-50"
            : "border-ink/8 bg-cream-card"
        }`}
      >
        <IconTile icon={icon} />
        <div className="min-w-0 flex-1">
          <Link
            href={href}
            draggable={false}
            className="text-sm font-semibold text-ink transition-colors hover:text-brand"
          >
            {title}
          </Link>
          <div className="mt-0.5 text-xs text-ink-soft">{subtitle}</div>
        </div>
        <button
          onClick={() => apply(!optimisticInPlan)}
          aria-label={optimisticInPlan ? "เอาออกจากกระเป๋า" : "เก็บลงกระเป๋า"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition active:scale-90 focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none ${
            optimisticInPlan
              ? "bg-brand text-white"
              : "border border-ink/15 text-ink-soft hover:bg-cream-sunk"
          }`}
        >
          <span className="animate-pop" key={String(optimisticInPlan)} aria-hidden="true">
            {optimisticInPlan ? "✓" : "+"}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
