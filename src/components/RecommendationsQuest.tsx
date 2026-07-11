"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import BudgetMeter from "./BudgetMeter";
import ReadinessMeter from "./ReadinessMeter";
import IconTile from "./IconTile";
import Mascot from "./Mascot";
import PlanToggleButton from "./PlanToggleButton";
import { celebrate } from "@/lib/celebrate";
import { tierLabel, type ProductTier } from "@/lib/recommendation/types";

const tierBadge: Record<ProductTier, string> = {
  must: "bg-rose-50 text-rose-700",
  recommended: "bg-amber-50 text-amber-700",
  optional: "bg-ink/5 text-ink-soft",
};

export type QuestItem = {
  productId: number;
  name: string;
  slug: string;
  icon: string;
  tier: ProductTier;
  lineTotal: number;
  inPlan: boolean;
};

export type QuestCategory = {
  name: string;
  collected: number;
  total: number;
  items: QuestItem[];
};

export default function RecommendationsQuest({
  categories,
  budget,
  plannedTotal,
  readinessPercent,
}: {
  categories: QuestCategory[];
  budget: number;
  plannedTotal: number;
  readinessPercent: number;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const prev = useRef<{ done: Record<string, boolean>; percent: number } | null>(null);

  useEffect(() => {
    const doneNow: Record<string, boolean> = {};
    categories.forEach((c) => {
      doneNow[c.name] = c.total > 0 && c.collected === c.total;
    });

    if (prev.current) {
      const justReady = readinessPercent >= 100 && prev.current.percent < 100;
      const newlyDone = categories.find(
        (c) => doneNow[c.name] && !prev.current!.done[c.name],
      );

      if (justReady) {
        celebrate();
        setToast("ห้องพร้อมอยู่แล้ว! เยี่ยมไปเลย 🎉");
      } else if (newlyDone) {
        celebrate();
        setToast(`${newlyDone.name}ครบแล้ว! 🎉`);
      }
    }

    prev.current = { done: doneNow, percent: readinessPercent };
  }, [categories, readinessPercent]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">จัดห้องกันเลย</h1>
      <p className="mt-1 text-sm text-ink-soft">เก็บของจำเป็นให้ครบ แล้วห้องก็พร้อมอยู่</p>

      <div className="mt-3 space-y-2">
        <ReadinessMeter percent={readinessPercent} />
        <div className="rounded-2xl bg-cream-card p-4 shadow-soft">
          <div className="mb-1.5 text-sm font-medium text-ink-soft">💰 งบ</div>
          <BudgetMeter total={plannedTotal} budget={budget} />
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {categories.map((cat) => {
          const done = cat.collected === cat.total && cat.total > 0;
          return (
            <section key={cat.name}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink">{cat.name}</h2>
                {done ? (
                  <span className="animate-pop rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                    ✓ ครบ!
                  </span>
                ) : (
                  <span className="rounded-full bg-cream-sunk px-2.5 py-0.5 text-xs font-semibold text-ink-soft tabular-nums">
                    {cat.collected}/{cat.total}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {cat.items.map((it) => (
                  <div
                    key={it.productId}
                    className="flex items-center gap-3 rounded-xl border border-ink/8 bg-cream-card p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
                  >
                    <IconTile icon={it.icon} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${it.slug}`}
                        className="text-sm font-semibold text-ink transition-colors hover:text-brand"
                      >
                        {it.name}
                      </Link>
                      <div className="mt-1 text-xs text-ink-soft tabular-nums">
                        ฿{it.lineTotal.toLocaleString()}
                      </div>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${tierBadge[it.tier]}`}
                      >
                        {tierLabel[it.tier]}
                      </span>
                    </div>
                    <PlanToggleButton productId={it.productId} inPlan={it.inPlan} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
        {categories.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-muted">
            ยังไม่มีของ เริ่มเก็บกันเลย!
          </p>
        )}
      </div>

      <Link
        href="/plan"
        className="mt-6 block rounded-full bg-brand p-4 text-center text-lg font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98]"
      >
        ดูแผนของฉัน
      </Link>

      <AnimatePresence>
        {toast && (
          <motion.div
            key="celebrate-toast"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
          >
            <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream shadow-lift">
              <Mascot mood="celebrate" className="text-lg" />
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
