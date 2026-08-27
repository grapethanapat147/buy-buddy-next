"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "motion/react";
import Link from "next/link";
import { saveSpecForm } from "@/app/actions";
import Button from "@/components/ui/Button";
import PlanningOverlay from "@/components/PlanningOverlay";
import { ArrowLeft, arrowBtnClass } from "@/components/FlowTopNav";

/** A catalog item the wizard asks about under "ในห้องมีอะไรอยู่แล้วบ้าง". */
export type OwnedCandidate = { id: number; icon: string; name: string };

/** Fixtures the room may already have — unchecked means "ไม่มี" so we recommend one. */
const fixtures: Array<[string, string, string]> = [
  ["has_kitchen_counter", "🍳", "เคาน์เตอร์ครัว"],
  ["has_wardrobe", "🚪", "ตู้เสื้อผ้า"],
  ["has_dining_table", "🍽️", "โต๊ะกินข้าว"],
  ["has_aircon", "❄️", "แอร์"],
];

type ChoiceOption = { value: string; emoji?: string; label: string; sub?: string };

type Step =
  | { kind: "budget"; key: "budget"; label: string; hint?: string; presets: number[] }
  | { kind: "stepper"; key: "occupants"; label: string; hint?: string; min: number; max: number; suffix: string }
  | { kind: "choice"; key: string; label: string; hint?: string; options: ChoiceOption[] }
  | { kind: "have"; key: "have"; label: string; hint?: string };

const STEPS: Step[] = [
  {
    kind: "budget", key: "budget", label: "งบประมาณเท่าไหร่",
    hint: "แตะปุ่มด่วน หรือพิมพ์เองก็ได้ · ปรับทีหลังได้",
    presets: [3000, 5000, 8000, 12000],
  },
  {
    kind: "stepper", key: "occupants", label: "อยู่กี่คน",
    hint: "มีผลกับของที่ใช้ตามจำนวนคน เช่น ผงซักฟอก",
    min: 1, max: 6, suffix: "คน",
  },
  {
    kind: "choice", key: "room_size", label: "ห้องขนาดประมาณไหน",
    options: [
      { value: "small", label: "เล็ก", sub: "< 25 ตร.ม." },
      { value: "medium", label: "กลาง", sub: "25–35" },
      { value: "large", label: "ใหญ่", sub: "> 35" },
    ],
  },
  {
    kind: "choice", key: "cooking", label: "ทำอาหารเองบ่อยแค่ไหน",
    options: [
      { value: "never", emoji: "🥡", label: "ไม่ทำเลย", sub: "สั่ง/ซื้อกิน" },
      { value: "sometimes", emoji: "🍜", label: "ทำบ้าง", sub: "อุ่น/ต้มง่าย ๆ" },
      { value: "often", emoji: "🍳", label: "ทำบ่อย", sub: "ทำเป็นประจำ" },
    ],
  },
  {
    kind: "choice", key: "laundry", label: "ซักผ้ายังไง",
    options: [
      { value: "own_machine", emoji: "🧺", label: "มีเครื่องซัก" },
      { value: "hand", emoji: "🫧", label: "ซักมือ" },
      { value: "service", emoji: "🏪", label: "ส่งร้าน" },
    ],
  },
  {
    kind: "choice", key: "work_style", label: "ทำงานที่ไหนเป็นหลัก",
    options: [
      { value: "office", emoji: "🏢", label: "ออฟฟิศ" },
      { value: "home", emoji: "🏠", label: "ที่ห้อง" },
      { value: "hybrid", emoji: "🔀", label: "ผสม" },
    ],
  },
  {
    kind: "choice", key: "spending_style", label: "สไตล์การซื้อของ",
    options: [
      { value: "essentials", emoji: "🎯", label: "เอาที่จำเป็น" },
      { value: "balanced", emoji: "⚖️", label: "พอดี ๆ" },
      { value: "comfort", emoji: "✨", label: "อยากได้ครบ" },
    ],
  },
  { kind: "have", key: "have", label: "ในห้องมีอะไรอยู่แล้วบ้าง", hint: "ห้องมีเฟอร์มาให้ หรือมีของเดิมอยู่แล้ว เลือกไว้เลย — เราจะแนะนำเฉพาะของที่ยังขาด" },
];

const toggleClass = (active: boolean) =>
  `flex items-center gap-2 whitespace-pre-line rounded-2xl border p-4 text-left text-base leading-snug transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
    active
      ? "border-2 border-brand bg-brand-50 font-semibold text-brand-700"
      : "border-ink/10 text-ink-soft hover:bg-cream-sunk"
  }`;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" pill disabled={pending} className="w-full">
      ดูของแนะนำ →
    </Button>
  );
}

export default function WizardForm({
  ownedCandidates = [],
}: {
  ownedCandidates?: OwnedCandidate[];
}) {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({
    room_size: "small",
    cooking: "sometimes",
    laundry: "own_machine",
    work_style: "office",
    spending_style: "balanced",
  });
  const [has, setHas] = useState<Record<string, boolean>>({});
  const [owned, setOwned] = useState<Record<number, boolean>>({});
  const [budget, setBudget] = useState("5000");
  const [occupants, setOccupants] = useState("1");
  /** +1 forward / -1 back — the question card slides in from that side. */
  const [dir, setDir] = useState(1);
  const advanceTimer = useRef<number | null>(null);

  const ownedIds = ownedCandidates.filter((c) => owned[c.id]).map((c) => c.id);
  const total = STEPS.length;
  const cur = STEPS[step];
  const isLast = step === total - 1;

  const clearAdvance = () => {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };
  const goNext = () => {
    setDir(1);
    setStep((s) => Math.min(total - 1, s + 1));
  };
  const goPrev = () => {
    clearAdvance();
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  /** Pick a single-select answer, then glide to the next step so tapping feels like progress. */
  const selectChoice = (key: string, value: string) => {
    setChoices((c) => ({ ...c, [key]: value }));
    clearAdvance();
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      goNext();
    }, 260);
  };

  const stepOccupants = (delta: number) =>
    setOccupants((n) => String(Math.min(6, Math.max(1, Number(n) + delta))));

  return (
    <form action={saveSpecForm}>
      <PlanningOverlay />
      {/* All answers travel as hidden inputs so the final submit carries every step. */}
      <input type="hidden" name="room_type" value="studio" />
      <input type="hidden" name="budget" value={budget} />
      <input type="hidden" name="occupants" value={occupants} />
      {Object.entries(choices).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      {fixtures.map(([key]) => (
        <input key={key} type="hidden" name={key} value={has[key] ? "yes" : "no"} />
      ))}
      {ownedIds.map((id) => (
        <input key={id} type="hidden" name="owned" value={id} />
      ))}

      {/* Back arrow + progress bar + counter, all on one line (mobile pattern). */}
      <div className="flex items-center gap-3">
        {step === 0 ? (
          <Link href="/" aria-label="ออก" className={arrowBtnClass}>
            <ArrowLeft />
          </Link>
        ) : (
          <button type="button" onClick={goPrev} aria-label="ย้อนกลับ" className={arrowBtnClass}>
            <ArrowLeft />
          </button>
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-cream-sunk">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-100 via-brand to-brand-500 transition-[width] duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-muted tabular-nums">
          {step + 1}/{total}
        </span>
      </div>

      {/* Question — remounts per step and glides in from the travel direction. */}
      <div className="mt-6 min-h-[240px] overflow-x-clip">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: dir * 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
        <h1 className="text-2xl font-bold text-ink">{cur.label}</h1>
        {cur.hint && <p className="mt-1.5 text-sm text-ink-soft">{cur.hint}</p>}

        {cur.kind === "budget" && (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-2.5">
              {cur.presets.map((amt) => {
                const active = budget === String(amt);
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBudget(String(amt))}
                    aria-pressed={active}
                    className={`rounded-2xl border p-4 text-center text-lg font-semibold tabular-nums transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                      active
                        ? "border-2 border-brand bg-brand-50 text-brand-700"
                        : "border-ink/10 text-ink-soft hover:bg-cream-sunk"
                    }`}
                  >
                    ฿{amt.toLocaleString()}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-ink/10 bg-cream-card p-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
              <span className="pl-2 text-2xl font-bold text-ink-muted">฿</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goNext();
                  }
                }}
                aria-label="งบเอง"
                className="w-full bg-transparent p-2 text-3xl font-bold text-ink focus:outline-none"
              />
            </div>
          </div>
        )}

        {cur.kind === "stepper" && (
          <div className="mt-8 flex items-center justify-center gap-6">
            <button
              type="button"
              aria-label="ลดจำนวนคน"
              onClick={() => stepOccupants(-1)}
              disabled={Number(occupants) <= cur.min}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink/15 text-3xl font-bold text-ink-soft transition active:scale-90 disabled:opacity-40"
            >
              −
            </button>
            <div className="flex min-w-[88px] flex-col items-center">
              <span className="text-6xl font-bold tabular-nums text-ink">{occupants}</span>
              <span className="mt-1 text-sm text-ink-muted">{cur.suffix}</span>
            </div>
            <button
              type="button"
              aria-label="เพิ่มจำนวนคน"
              onClick={() => stepOccupants(1)}
              disabled={Number(occupants) >= cur.max}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand bg-brand-50 text-3xl font-bold text-brand transition active:scale-90 disabled:opacity-40"
            >
              +
            </button>
          </div>
        )}

        {cur.kind === "choice" && (
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            {cur.options.map((opt) => {
              const active = choices[cur.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectChoice(cur.key, opt.value)}
                  className={`flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-2xl border p-3 text-center transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                    active
                      ? "border-2 border-brand bg-brand-50 shadow-soft"
                      : "border-ink/10 hover:bg-cream-sunk"
                  }`}
                >
                  {opt.emoji && (
                    <span className="text-3xl leading-none" aria-hidden="true">
                      {opt.emoji}
                    </span>
                  )}
                  <span
                    className={`font-semibold leading-tight ${opt.emoji ? "text-sm" : "text-lg"} ${
                      active ? "text-brand-700" : "text-ink"
                    }`}
                  >
                    {opt.label}
                  </span>
                  {opt.sub && (
                    <span className="text-[11px] leading-tight text-ink-muted">{opt.sub}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {cur.kind === "have" && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {fixtures.map(([key, emoji, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={Boolean(has[key])}
                onClick={() => setHas((h) => ({ ...h, [key]: !h[key] }))}
                className={toggleClass(Boolean(has[key]))}
              >
                <span aria-hidden="true">{emoji}</span>
                <span className="flex-1">{label}</span>
                <span aria-hidden="true" className={has[key] ? "text-brand" : "text-ink-muted/40"}>
                  {has[key] ? "✓" : "＋"}
                </span>
              </button>
            ))}
            {ownedCandidates.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={Boolean(owned[c.id])}
                onClick={() => setOwned((o) => ({ ...o, [c.id]: !o[c.id] }))}
                className={toggleClass(Boolean(owned[c.id]))}
              >
                <span aria-hidden="true">{c.icon}</span>
                <span className="flex-1">{c.name}</span>
                <span aria-hidden="true" className={owned[c.id] ? "text-brand" : "text-ink-muted/40"}>
                  {owned[c.id] ? "✓" : "＋"}
                </span>
              </button>
            ))}
          </div>
        )}
        </motion.div>
      </div>

      {/* Sticky footer — the forward action stays pinned with a gradient fade above it. */}
      <div className="sticky bottom-0 -mx-5 mt-6 bg-gradient-to-t from-cream-card via-cream-card to-transparent px-5 pb-1 pt-8">
        {isLast ? (
          <SubmitButton />
        ) : (
          <Button type="button" size="large" pill onClick={goNext} className="w-full">
            ไปต่อ →
          </Button>
        )}
      </div>
    </form>
  );
}
