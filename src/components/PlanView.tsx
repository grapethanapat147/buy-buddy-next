"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import BudgetMeter from "./BudgetMeter";
import FlowNav from "./FlowNav";
import FlowTopNav from "./FlowTopNav";
import Mascot from "./Mascot";
import PlanItemRow from "./PlanItemRow";
import RestockCalendar, { type RestockItem } from "./RestockCalendar";
import { celebrate } from "@/lib/celebrate";
import { savePlanToAccount } from "@/app/actions";
import { type ProductTier } from "@/lib/recommendation/types";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Each marketplace's brand colour for the "ซื้อทั้งชุดที่ร้านเดียว" cards. */
const STORE_BRAND: Record<string, { bg: string; label: string }> = {
  Shopee: { bg: "#EE4D2D", label: "Shopee" },
  Lazada: { bg: "#0F146D", label: "Lazada" },
  "TikTok Shop": { bg: "#FE2C55", label: "TikTok Shop" },
  "Official Store": { bg: "#334155", label: "Official Store" },
};

export type PlanLine = {
  productId: number;
  name: string;
  icon: string;
  tier: ProductTier;
  category: string;
  lineTotal: number;
  suggested: boolean;
  note: string;
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
  restockItems,
  isLoggedIn,
}: {
  items: PlanLine[];
  budget: number;
  total: number;
  overBudgetBy: number;
  mustExceedsBudget: boolean;
  storeRollup: Array<{ platform: string; total: number }>;
  restockItems: RestockItem[];
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
      <FlowTopNav backHref="/recommendations" />
      <div className="flex items-center gap-2">
        <Mascot mood="holding" size={40} />
        <div>
          <h1 className="text-2xl font-semibold text-ink">กระเป๋าของฉัน</h1>
          <p className="text-xs text-ink-soft">ของที่เลือกไว้ + วันซื้อของ ครบในที่เดียว</p>
        </div>
      </div>

      <div className="mt-3 flex gap-5 border-b border-ink/10">
        <Tab active={tab === "list"} onClick={() => setTab("list")}>
          ของในกระเป๋า
        </Tab>
        <Tab active={tab === "calendar"} onClick={() => setTab("calendar")}>
          📅 ปฏิทินซื้อของ
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

          <p className="mb-2 text-xs text-ink-muted">ปัดซ้ายที่รายการเพื่อเอาออกจากกระเป๋า 👈</p>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {shown.map((it) => (
                <motion.div
                  key={it.productId}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -60, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.22, ease: EASE }}
                >
                  <PlanItemRow
                    productId={it.productId}
                    name={it.name}
                    icon={it.icon}
                    tier={it.tier}
                    lineTotal={it.lineTotal}
                    suggested={it.suggested}
                    note={it.note}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {items.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Mascot mood="happy" size={72} />
              <p className="text-sm text-ink-muted">
                กระเป๋ายังว่างอยู่เลย~
                <br />
                ไปเลือกของที่ถูกใจมาใส่กันเถอะ 🛍️
              </p>
            </div>
          )}

          {storeRollup.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-ink">ซื้อทั้งชุดที่ร้านเดียว</p>
              <div className="grid grid-cols-2 gap-2">
                {storeRollup.map((s, i) => {
                  const brand = STORE_BRAND[s.platform] ?? { bg: "#5C3A2E", label: s.platform };
                  return (
                    <div
                      key={s.platform}
                      className="flex flex-col gap-1 rounded-2xl p-3 text-white shadow-soft"
                      style={{ backgroundColor: brand.bg }}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold">{brand.label}</span>
                        {i === 0 && (
                          <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold">
                            คุ้มสุด
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold tabular-nums">
                        ฿{s.total.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "calendar" && <RestockCalendar items={restockItems} />}

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

      <FlowNav backHref="/recommendations" backLabel="กลับไปจัดห้อง" />
    </>
  );
}
