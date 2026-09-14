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
export type OwnedCandidate = { id: number; name: string };

/** Fixtures the room may already have — unchecked means "ไม่มี" so we recommend one. */
const fixtures: Array<[string, string]> = [
  ["has_kitchen_counter", "เคาน์เตอร์ครัว"],
  ["has_wardrobe", "ตู้เสื้อผ้า"],
  ["has_dining_table", "โต๊ะกินข้าว"],
  ["has_aircon", "แอร์"],
];

/** Shared geometry for the answer-card line icons (no emoji anywhere in the UI). */
const ico = {
  width: 26,
  height: 26,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const Icons = {
  takeout: (
    <svg {...ico}>
      <path d="M5.5 5.5h13v2.6h-13z" />
      <path d="M7 8.1h10l-1 12.4H8z" />
      <path d="M12 11v6" />
    </svg>
  ),
  bowl: (
    <svg {...ico}>
      <path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0Z" />
      <path d="M9 7.5c0-1 1-1.4 1-2.4M12.5 7c0-1.2 1-1.6 1-2.8M16 7.5c0-1 .8-1.4.8-2.4" />
    </svg>
  ),
  pan: (
    <svg {...ico}>
      <ellipse cx="9.8" cy="13.5" rx="6.6" ry="5.2" />
      <path d="M16.2 12.2 22 9.4" />
      <circle cx="9.8" cy="13.5" r="1.9" />
    </svg>
  ),
  washer: (
    <svg {...ico}>
      <rect x="4" y="3" width="16" height="18" rx="2.2" />
      <circle cx="12" cy="14" r="4.2" />
      <circle cx="7.6" cy="6.6" r=".9" />
    </svg>
  ),
  bubbles: (
    <svg {...ico}>
      <circle cx="9" cy="10.5" r="4" />
      <circle cx="16" cy="7.8" r="2.2" />
      <circle cx="15.6" cy="15" r="3" />
    </svg>
  ),
  shop: (
    <svg {...ico}>
      <path d="M3 9.5h18" />
      <path d="M4.6 9.5V20a1 1 0 0 0 1 1h12.8a1 1 0 0 0 1-1V9.5" />
      <path d="m3 9.5 2-5.5h14l2 5.5" />
    </svg>
  ),
  building: (
    <svg {...ico}>
      <rect x="5" y="3" width="14" height="18" rx="1.6" />
      <path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10.5 21v-4h3v4" />
    </svg>
  ),
  house: (
    <svg {...ico}>
      <path d="M3.7 10.8 12 4l8.3 6.8" />
      <path d="M6.2 10.2V20h11.6v-9.8" />
      <path d="M10.2 20v-5h3.6v5" />
    </svg>
  ),
  swap: (
    <svg {...ico}>
      <path d="M4 8.5h13m-3.2-3.4L17.4 8.5l-3.6 3.4" />
      <path d="M20 15.5H7m3.2-3.4L6.6 15.5l3.6 3.4" />
    </svg>
  ),
  target: (
    <svg {...ico}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="12" cy="12" r=".7" fill="currentColor" stroke="none" />
    </svg>
  ),
  scales: (
    <svg {...ico}>
      <path d="M12 4.4v15.2M6.8 19.6h10.4M4 8.6h16" />
      <path d="M4 8.6 1.9 13.2h4.2Z" />
      <path d="M20 8.6l-2.1 4.6h4.2Z" />
    </svg>
  ),
  sparkle: (
    <svg {...ico}>
      <path d="M11 3.6 12.7 8.3 17.4 10 12.7 11.7 11 16.4 9.3 11.7 4.6 10 9.3 8.3Z" />
      <path d="M17.6 15.2 18.4 17.4 20.6 18.2 18.4 19 17.6 21.2 16.8 19 14.6 18.2 16.8 17.4Z" />
    </svg>
  ),
};

type ChoiceOption = { value: string; icon?: React.ReactNode; label: string; sub?: string };

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
      { value: "never", icon: Icons.takeout, label: "ไม่ทำเลย", sub: "0 วัน/สัปดาห์" },
      { value: "sometimes", icon: Icons.bowl, label: "ทำบ้าง", sub: "1–3 วัน/สัปดาห์" },
      { value: "often", icon: Icons.pan, label: "ทำบ่อย", sub: "4–7 วัน/สัปดาห์" },
    ],
  },
  {
    kind: "choice", key: "laundry", label: "ซักผ้ายังไง",
    options: [
      { value: "own_machine", icon: Icons.washer, label: "มีเครื่องซัก" },
      { value: "hand", icon: Icons.bubbles, label: "ซักมือ" },
      { value: "service", icon: Icons.shop, label: "ส่งร้าน" },
    ],
  },
  {
    kind: "choice", key: "work_style", label: "ทำงานที่ไหนเป็นหลัก",
    options: [
      { value: "office", icon: Icons.building, label: "ออฟฟิศ" },
      { value: "home", icon: Icons.house, label: "ที่ห้อง" },
      { value: "hybrid", icon: Icons.swap, label: "ผสม" },
    ],
  },
  {
    kind: "choice", key: "spending_style", label: "สไตล์การซื้อของ",
    options: [
      { value: "essentials", icon: Icons.target, label: "เอาที่จำเป็น" },
      { value: "balanced", icon: Icons.scales, label: "พอดี ๆ" },
      { value: "comfort", icon: Icons.sparkle, label: "อยากได้ครบ" },
    ],
  },
  { kind: "have", key: "have", label: "ในห้องมีอะไรอยู่แล้วบ้าง", hint: "ห้องมีเฟอร์มาให้ หรือมีของเดิมอยู่แล้ว เลือกไว้เลย — เราจะแนะนำเฉพาะของที่ยังขาด" },
];

/** Compact toggle for "what the room already has" — a chip reads faster than a card. */
const pillClass = (active: boolean) =>
  `rounded-full border px-3.5 py-2 text-sm transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
    active
      ? "border-brand bg-brand-50 font-semibold text-brand-700"
      : "border-ink/12 text-ink-soft hover:bg-cream-sunk"
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
                  {opt.icon && (
                    <span className={active ? "text-brand" : "text-ink-soft"}>{opt.icon}</span>
                  )}
                  <span
                    className={`font-semibold leading-tight ${opt.icon ? "text-sm" : "text-lg"} ${
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
          <div className="mt-5 flex flex-wrap gap-2">
            {fixtures.map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={Boolean(has[key])}
                onClick={() => setHas((h) => ({ ...h, [key]: !h[key] }))}
                className={pillClass(Boolean(has[key]))}
              >
                {label}
              </button>
            ))}
            {ownedCandidates.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={Boolean(owned[c.id])}
                onClick={() => setOwned((o) => ({ ...o, [c.id]: !o[c.id] }))}
                className={pillClass(Boolean(owned[c.id]))}
              >
                {c.name}
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
