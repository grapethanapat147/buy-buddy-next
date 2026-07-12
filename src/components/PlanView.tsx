"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import BudgetMeter from "./BudgetMeter";
import { celebrate } from "@/lib/celebrate";
import { removeFromPlan, savePlanToAccount } from "@/app/actions";
import { tierLabel, type ProductTier } from "@/lib/recommendation/types";

const EASE = [0.22, 1, 0.36, 1] as const;
const cadenceLabel: Record<string, string> = {
  weekly: "รายสัปดาห์",
  monthly: "รายเดือน",
};

export type PlanLine = {
  productId: number;
  name: string;
  icon: string;
  tier: ProductTier;
  category: string;
  lineTotal: number;
  suggested: boolean;
};

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-sm transition ${
        active
          ? "bg-brand-50 font-semibold text-brand-700"
          : "border border-ink/10 text-ink-soft hover:bg-cream-sunk"
      }`}
    >
      {children}
    </button>
  );
}

export type RestockGroup = {
  cadence: string;
  items: Array<{ id: number; icon: string; name: string; price: number }>;
};

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px pb-2 text-sm transition-colors ${
        active ? "border-b-2 border-brand font-semibold text-ink" : "text-ink-soft hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function RemoveButton({ productId }: { productId: number }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => removeFromPlan(productId))}
      disabled={pending}
      className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink-soft transition hover:bg-cream-sunk active:scale-95 disabled:opacity-60"
    >
      เลื่อนออก
    </button>
  );
}

function SaveButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => savePlanToAccount())}
      disabled={pending}
      className="w-full rounded-full bg-brand p-4 text-lg font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98] disabled:opacity-60"
    >
      เซฟแผนไว้ในบัญชี
    </button>
  );
}

export default function PlanView({
  items,
  budget,
  total,
  overBudgetBy,
  mustExceedsBudget,
  storeRollup,
  restock,
  isLoggedIn,
}: {
  items: PlanLine[];
  budget: number;
  total: number;
  overBudgetBy: number;
  mustExceedsBudget: boolean;
  storeRollup: Array<{ platform: string; total: number }>;
  restock: RestockGroup[];
  isLoggedIn: boolean;
}) {
  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [filter, setFilter] = useState<string>("all");
  const categories = [...new Set(items.map((i) => i.category))];
  const activeFilter = filter !== "all" && !categories.includes(filter) ? "all" : filter;
  const shown = activeFilter === "all" ? items : items.filter((i) => i.category === activeFilter);
  const over = overBudgetBy > 0;

  const prevOver = useRef(overBudgetBy);
  useEffect(() => {
    if (prevOver.current > 0 && overBudgetBy === 0) {
      celebrate();
    }
    prevOver.current = overBudgetBy;
  }, [overBudgetBy]);

  return (
    <>
      <h1 className="text-2xl font-semibold text-ink">แผนของฉัน</h1>

      <div className="mt-3 flex gap-5 border-b border-ink/10">
        <Tab active={tab === "list"} onClick={() => setTab("list")}>
          รายการ
        </Tab>
        <Tab active={tab === "calendar"} onClick={() => setTab("calendar")}>
          ปฏิทิน
        </Tab>
      </div>

      {tab === "list" && (
        <>
          <div className="my-4">
            <BudgetMeter total={total} budget={budget} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {over && mustExceedsBudget && (
              <motion.div
                key="must"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 flex gap-2 rounded-xl bg-cream-sunk p-3 text-sm text-ink-soft"
              >
                <span aria-hidden="true">🤝</span>
                <span>
                  ของจำเป็นล้วน ๆ ก็เกินงบ ฿{overBudgetBy.toLocaleString()} —
                  เราไม่ตัดของจำเป็นให้ ลองเปลี่ยนรุ่นถูกกว่า หรือแบ่งซื้อข้ามเดือน
                </span>
              </motion.div>
            )}
            {over && !mustExceedsBudget && (
              <motion.div
                key="defer"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
              >
                <span aria-hidden="true">💡</span>
                <span>
                  เกินงบ ฿{overBudgetBy.toLocaleString()} —
                  ลองเลื่อนของที่ไฮไลต์ไว้ไปซื้อรอบหน้า
                </span>
              </motion.div>
            )}
            {!over && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-3 flex gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
              >
                <span aria-hidden="true">✓</span>
                <span>อยู่ในงบ · เหลือ ฿{(budget - total).toLocaleString()}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {categories.length > 1 && (
            <div className="mb-3 flex flex-wrap gap-2">
              <FilterChip active={activeFilter === "all"} onClick={() => setFilter("all")}>
                ทั้งหมด
              </FilterChip>
              {categories.map((c) => (
                <FilterChip key={c} active={activeFilter === c} onClick={() => setFilter(c)}>
                  {c}
                </FilterChip>
              ))}
            </div>
          )}

          <div>
            <AnimatePresence initial={false}>
              {shown.map((it) => (
                <motion.div
                  key={it.productId}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.22, ease: EASE }}
                  className={`flex items-center gap-3 border-b border-ink/5 py-3 ${
                    it.suggested ? "rounded-xl bg-amber-50 px-3" : ""
                  }`}
                >
                  <span className="shrink-0 text-lg" aria-hidden="true">
                    {it.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-ink">{it.name}</div>
                    <div className="text-xs text-ink-muted">{tierLabel[it.tier]}</div>
                  </div>
                  <span className="text-sm text-ink-soft tabular-nums">
                    ฿{it.lineTotal.toLocaleString()}
                  </span>
                  {it.tier !== "must" && <RemoveButton productId={it.productId} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {items.length === 0 && (
            <p className="py-8 text-center text-sm text-ink-muted">
              ยังไม่มีของ เริ่มเก็บกันเลย!
            </p>
          )}

          {storeRollup.length > 0 && (
            <div className="mt-4 rounded-xl bg-cream-sunk p-3 text-xs text-ink-soft">
              ถ้าซื้อทั้งหมดที่:{" "}
              {storeRollup
                .map((s) => `${s.platform} ฿${s.total.toLocaleString()}`)
                .join(" · ")}
            </div>
          )}
        </>
      )}

      {tab === "calendar" && (
        <div className="mt-4">
          {restock.length > 0 ? (
            restock.map((group) => (
              <div key={group.cadence} className="mb-4">
                <div className="mb-2 text-sm font-semibold text-ink">
                  {cadenceLabel[group.cadence] ?? group.cadence}
                </div>
                <div className="divide-y divide-ink/5 rounded-xl border border-ink/8">
                  {group.items.map((it) => (
                    <div key={it.id} className="flex items-center gap-2 p-3">
                      <span className="text-lg" aria-hidden="true">
                        {it.icon}
                      </span>
                      <span className="flex-1 text-sm text-ink">{it.name}</span>
                      <span className="text-sm text-ink-soft tabular-nums">
                        ฿{it.price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-ink-muted">
              ยังไม่มีของสิ้นเปลืองในแผน — เพิ่มของหมวด Restock เพื่อวางแผนซื้อซ้ำ
            </p>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-ink/10 pt-4">
        {isLoggedIn ? (
          <SaveButton />
        ) : (
          <Link
            href="/register"
            className="block rounded-full bg-brand p-4 text-center text-lg font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98]"
          >
            เซฟแผน (สมัคร/เข้าสู่ระบบ)
          </Link>
        )}
      </div>
    </>
  );
}
