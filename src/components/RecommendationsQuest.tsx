"use client";

import { useEffect, useRef, useState } from "react";
import FlowNav from "./FlowNav";
import FlowTopNav from "./FlowTopNav";
import { motion, AnimatePresence } from "motion/react";
import BudgetMeter from "./BudgetMeter";
import ReadinessMeter from "./ReadinessMeter";
import Mascot from "./Mascot";
import SwipeableItemRow from "./SwipeableItemRow";
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
  imageUrl: string | null;
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

export type OtherItem = {
  productId: number;
  name: string;
  slug: string;
  icon: string;
  imageUrl: string | null;
  price: number;
  inPlan: boolean;
};

export type OtherCategory = {
  name: string;
  items: OtherItem[];
};

export type OwnedItem = {
  productId: number;
  name: string;
  slug: string;
  icon: string;
};

function FilterChip({
  name,
  active,
  onClick,
  children,
}: {
  name: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      data-chip={name}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-sm transition ${
        active
          ? "bg-brand-50 font-semibold text-brand-700"
          : "border border-ink/10 text-ink-soft hover:bg-cream-sunk"
      }`}
    >
      {children}
    </button>
  );
}

export default function RecommendationsQuest({
  categories,
  otherCategories = [],
  ownedItems = [],
  budget,
  plannedTotal,
  readinessPercent,
}: {
  categories: QuestCategory[];
  otherCategories?: OtherCategory[];
  ownedItems?: OwnedItem[];
  budget: number;
  plannedTotal: number;
  readinessPercent: number;
}) {
  const [toast, setToast] = useState<string | null>(null);

  // Chips are category navigation, not a filter: tapping jumps to the section and
  // scrolling moves the highlight along with you, so the whole list stays in reach.
  const chipNames: string[] = [];
  for (const c of [...categories, ...otherCategories]) {
    if (!chipNames.includes(c.name)) {
      chipNames.push(c.name);
    }
  }
  const [activeCat, setActiveCat] = useState<string>(chipNames[0] ?? "");
  const railRef = useRef<HTMLDivElement>(null);
  /** Stable dep: the props are fresh arrays each render, which would thrash the observer. */
  const catKey = chipNames.join("|");

  const jumpTo = (name: string) => {
    setActiveCat(name);
    document
      .querySelector(`[data-cat="${CSS.escape(name)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /** Highlight the category whose section is nearest the top of the viewport. */
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-cat]")];
    if (sections.length === 0) {
      return;
    }
    // The observer only reports sections whose state CHANGED, so keep a running
    // map of everything and re-pick the topmost visible one on every callback.
    const visible = new Map<Element, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target, e.isIntersecting));
        const inView = sections.filter((s) => visible.get(s));
        if (inView.length === 0) {
          return;
        }
        // `inView` keeps document order; the LAST one is the section you have just
        // scrolled into — the one above it is only still showing its tail.
        const name = inView[inView.length - 1].getAttribute("data-cat");
        if (name) {
          setActiveCat(name);
        }
      },
      { rootMargin: "-72px 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [catKey]);

  /** Keep the highlighted chip inside the visible part of the rail. */
  useEffect(() => {
    railRef.current
      ?.querySelector<HTMLElement>(`[data-chip="${CSS.escape(activeCat)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeCat]);

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
      <FlowTopNav backHref="/wizard" nextHref="/plan" nextLabel="กระเป๋า" />
      <h1 className="text-2xl font-semibold text-ink">จัดห้องกันเลย</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {ownedItems.length > 0
          ? "ข้ามของที่คุณมีแล้ว — เน้นเติมเฉพาะของที่ยังขาด"
          : "เก็บของจำเป็นให้ครบ แล้วห้องก็พร้อมอยู่"}
      </p>

      <div className="mt-3 space-y-2">
        <ReadinessMeter percent={readinessPercent} />
        <div className="rounded-2xl bg-cream-card p-4 shadow-soft">
          <div className="mb-1.5 text-sm font-medium text-ink-soft">งบ</div>
          <BudgetMeter total={plannedTotal} budget={budget} />
        </div>
      </div>

      {ownedItems.length > 0 && (
        <div className="mt-3 rounded-2xl border border-ink/8 bg-cream-sunk/50 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink-soft">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            มีอยู่แล้วในห้อง · {ownedItems.length}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ownedItems.map((it) => (
              <span
                key={it.productId}
                className="rounded-full bg-cream-card px-2.5 py-1 text-xs text-ink-soft"
              >
                {it.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {chipNames.length > 1 && (
        <div className="sticky top-0 z-20 -mx-5 mt-4 border-b border-ink/5 bg-cream-card/95 py-2.5 backdrop-blur">
          <div ref={railRef} className="no-scrollbar flex gap-2 overflow-x-auto px-5">
            {chipNames.map((name) => (
              <FilterChip
                key={name}
                name={name}
                active={activeCat === name}
                onClick={() => jumpTo(name)}
              >
                {name}
              </FilterChip>
            ))}
          </div>
        </div>
      )}

      {/* Recommended for you — the curated quest, always shown first. */}
      {categories.length > 0 && (
        <div className="mt-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-brand-700">
            <span className="h-4 w-1 rounded-full bg-brand" aria-hidden="true" />
            ของแนะนำสำหรับคุณ
          </h2>
          <div className="mt-3 space-y-5">
            {categories.map((cat) => {
              const done = cat.collected === cat.total && cat.total > 0;
              return (
                <section key={cat.name} data-cat={cat.name} className="scroll-mt-24">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-ink">{cat.name}</h3>
                    {done ? (
                      <span className="animate-pop rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
                        ✓ ครบ!
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-ink-muted tabular-nums">
                        {cat.collected}/{cat.total}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {cat.items.map((it) => (
                      <SwipeableItemRow
                        key={it.productId}
                        productId={it.productId}
                        inPlan={it.inPlan}
                        icon={it.icon}
                        imageUrl={it.imageUrl}
                        title={it.name}
                        href={`/products/${it.slug}`}
                        price={it.lineTotal}
                        subtitle={
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] ${tierBadge[it.tier]}`}
                          >
                            {tierLabel[it.tier]}
                          </span>
                        }
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {categories.length === 0 && (
        <p className="mt-4 py-8 text-center text-sm text-ink-muted">
          ยังไม่มีของแนะนำ — ลองเลือกจากของทั้งหมดด้านล่างได้เลย
        </p>
      )}

      {/* Everything else — browse the full catalog without leaving the page. */}
      {otherCategories.length > 0 && (
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
            <span className="h-4 w-1 rounded-full bg-ink/25" aria-hidden="true" />
            ของอื่น ๆ ที่เพิ่มได้เอง
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">อยากได้อย่างอื่นเพิ่ม เลือกได้เลย</p>
          <div className="mt-3 space-y-5">
            {otherCategories.map((cat) => (
              <section key={cat.name} data-cat={cat.name} className="scroll-mt-24">
                <h3 className="mb-2 text-base font-semibold text-ink">{cat.name}</h3>
                <div className="space-y-2">
                  {cat.items.map((it) => (
                    <SwipeableItemRow
                      key={it.productId}
                      productId={it.productId}
                      inPlan={it.inPlan}
                      icon={it.icon}
                      imageUrl={it.imageUrl}
                      title={it.name}
                      href={`/products/${it.slug}`}
                      price={it.price}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <FlowNav backHref="/wizard" backLabel="แก้คำตอบ" nextHref="/plan" nextLabel="ไปกระเป๋า" />

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
              <Mascot mood="celebrate" size={28} />
              <span>{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
