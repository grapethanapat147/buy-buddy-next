"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import Mascot from "./Mascot";
import { celebrate } from "@/lib/celebrate";
import { setRestockDay, toggleRestockDone } from "@/app/actions";

export type RestockItem = {
  id: number;
  icon: string;
  name: string;
  price: number;
  cadence: string;
  day: number;
  done: boolean;
};

const cadenceLabel: Record<string, string> = {
  weekly: "ทุกสัปดาห์",
  monthly: "ทุกเดือน",
};

const WEEKDAYS = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default function RestockCalendar({ items }: { items: RestockItem[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const itemsOnDay = (day: number) =>
    items.filter((it) => Math.min(daysInMonth, it.day) === day);

  const assignDay = (day: number) => {
    if (selectedId === null) {
      return;
    }
    const id = selectedId;
    setSelectedId(null);
    startTransition(() => setRestockDay(id, day));
  };

  const toggleDone = (it: RestockItem) => {
    const willBeDone = !it.done;
    const remainingAfter = items.filter(
      (x) => !x.done && x.id !== it.id,
    ).length;
    startTransition(async () => {
      await toggleRestockDone(it.id, it.day);
      if (willBeDone && remainingAfter === 0) {
        celebrate();
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Mascot mood="thinking" size={72} />
        <p className="text-sm text-ink-muted">
          ยังไม่มีของที่ต้องซื้อซ้ำในกระเป๋า
          <br />
          เก็บพวกของกินของใช้เข้ามา แล้วมาวางแผนวันซื้อกันน้า 🛒
        </p>
      </div>
    );
  }

  const doneCount = items.filter((it) => it.done).length;

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-cream-sunk p-3">
        <Mascot mood={selectedId !== null ? "search" : "holding"} size={40} />
        <p className="text-xs text-ink-soft">
          {selectedId !== null ? (
            <>แตะวันในปฏิทินเลย เดี๋ยวจัดให้ 📅</>
          ) : (
            <>แตะของด้านล่างเลือกก่อน แล้วแตะวันในปฏิทินเพื่อย้ายวันซื้อ · แตะ ✓ เมื่อซื้อแล้ว</>
          )}
        </p>
      </div>

      <div className="mb-1 text-center text-sm font-semibold text-ink">
        {THAI_MONTHS[month]} {year + 543}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-[11px] font-medium text-ink-muted">
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`blank-${i}`} />;
          }
          const dayItems = itemsOnDay(day);
          const isToday = day === today;
          const clickable = selectedId !== null;
          return (
            <button
              key={day}
              onClick={() => assignDay(day)}
              disabled={!clickable}
              className={`flex min-h-[46px] flex-col items-center rounded-lg border p-1 text-center transition ${
                isToday ? "border-brand/50 bg-brand-50" : "border-ink/5 bg-cream-card"
              } ${
                clickable
                  ? "cursor-pointer hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
                  : "cursor-default"
              }`}
            >
              <span
                className={`text-[11px] tabular-nums ${
                  isToday ? "font-bold text-brand-700" : "text-ink-soft"
                }`}
              >
                {day}
              </span>
              <span className="mt-0.5 flex flex-wrap justify-center gap-0.5 leading-none">
                {dayItems.slice(0, 3).map((it) => (
                  <span
                    key={it.id}
                    className={`text-sm ${it.done ? "opacity-30 grayscale" : ""}`}
                    aria-hidden="true"
                  >
                    {it.icon}
                  </span>
                ))}
                {dayItems.length > 3 && (
                  <span className="text-[9px] text-ink-muted">+{dayItems.length - 3}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">ของที่ต้องซื้อซ้ำ</span>
        <span className="rounded-full bg-cream-sunk px-2.5 py-0.5 text-xs font-semibold text-ink-soft tabular-nums">
          ซื้อแล้ว {doneCount}/{items.length}
        </span>
      </div>

      <div className="mt-2 space-y-2">
        <AnimatePresence initial={false}>
          {items.map((it) => {
            const selected = selectedId === it.id;
            return (
              <motion.div
                key={it.id}
                layout
                className={`flex items-center gap-2 rounded-xl border p-2.5 transition ${
                  selected
                    ? "border-brand bg-brand-50 shadow-soft"
                    : it.done
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-ink/8 bg-cream-card"
                }`}
              >
                <button
                  onClick={() => setSelectedId(selected ? null : it.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className={`text-lg ${it.done ? "opacity-40 grayscale" : ""}`} aria-hidden="true">
                    {it.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${
                        it.done ? "text-ink-muted line-through" : "text-ink"
                      }`}
                    >
                      {it.name}
                    </span>
                    <span className="block text-xs text-ink-muted">
                      {cadenceLabel[it.cadence] ?? "ตามรอบ"} · วันที่ {Math.min(daysInMonth, it.day)} · ฿
                      {it.price.toLocaleString()}
                    </span>
                  </span>
                  {selected && (
                    <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-white">
                      เลือกวันเลย
                    </span>
                  )}
                </button>
                <button
                  onClick={() => toggleDone(it)}
                  disabled={pending}
                  aria-label={it.done ? "ยังไม่ได้ซื้อ" : "ซื้อแล้ว"}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition active:scale-90 disabled:opacity-60 ${
                    it.done
                      ? "bg-emerald-100 text-emerald-600"
                      : "border border-ink/15 text-ink-soft hover:bg-cream-sunk"
                  }`}
                >
                  <span className="animate-pop" key={String(it.done)} aria-hidden="true">
                    {it.done ? "✓" : "🛒"}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
