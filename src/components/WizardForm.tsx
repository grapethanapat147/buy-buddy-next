"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveSpecForm } from "@/app/actions";
import Button from "@/components/ui/Button";
import PlanningOverlay from "@/components/PlanningOverlay";

/** A catalog item the wizard asks about under "ในห้องมีอะไรอยู่แล้วบ้าง". */
export type OwnedCandidate = { id: number; icon: string; name: string };

/** Fixtures the room may already have — unchecked means "ไม่มี" so we recommend one. */
const fixtures: Array<[string, string, string]> = [
  ["has_kitchen_counter", "🍳", "เคาน์เตอร์ครัว"],
  ["has_wardrobe", "🚪", "ตู้เสื้อผ้า"],
  ["has_dining_table", "🍽️", "โต๊ะกินข้าว"],
  ["has_aircon", "❄️", "แอร์"],
];

type Step =
  | { kind: "number"; key: "budget" | "occupants"; label: string; hint?: string; min: number; prefix?: string; suffix?: string }
  | { kind: "choice"; key: string; label: string; hint?: string; options: Array<[string, string]> }
  | { kind: "have"; key: "have"; label: string; hint?: string };

const STEPS: Step[] = [
  { kind: "number", key: "budget", label: "งบประมาณเท่าไหร่", hint: "งบรวมคร่าว ๆ ปรับทีหลังได้", min: 0, prefix: "฿" },
  { kind: "number", key: "occupants", label: "อยู่กี่คน", hint: "มีผลกับของที่ใช้ตามจำนวนคน เช่น ผงซักฟอก", min: 1, suffix: "คน" },
  {
    kind: "choice", key: "room_size", label: "ห้องขนาดประมาณไหน",
    options: [["small", "เล็ก\n< 25 ตร.ม."], ["medium", "กลาง\n25–35"], ["large", "ใหญ่\n> 35"]],
  },
  {
    kind: "choice", key: "cooking", label: "ทำอาหารเองบ่อยแค่ไหน",
    options: [["never", "ไม่ทำเลย"], ["sometimes", "ทำบ้าง"], ["often", "ทำบ่อย"]],
  },
  {
    kind: "choice", key: "laundry", label: "ซักผ้ายังไง",
    options: [["own_machine", "มีเครื่องซัก"], ["hand", "ซักมือ"], ["service", "ส่งร้าน"]],
  },
  {
    kind: "choice", key: "work_style", label: "ทำงานที่ไหนเป็นหลัก",
    options: [["office", "ออฟฟิศ"], ["home", "ที่ห้อง"], ["hybrid", "ผสม"]],
  },
  {
    kind: "choice", key: "spending_style", label: "สไตล์การซื้อของ",
    options: [["essentials", "เอาที่จำเป็น"], ["balanced", "พอดี ๆ"], ["comfort", "อยากได้ครบ"]],
  },
  { kind: "have", key: "have", label: "ในห้องมีอะไรอยู่แล้วบ้าง", hint: "เลือกที่มีอยู่แล้ว เดี๋ยวเราไม่แนะนำซ้ำ · จะได้เหลืองบไปซื้ออย่างอื่น 💸" },
];

const optionClass = (active: boolean) =>
  `whitespace-pre-line rounded-2xl border p-4 text-base leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
    active
      ? "border-2 border-brand bg-brand-50 font-semibold text-brand-700"
      : "border-ink/10 text-ink-soft hover:bg-cream-sunk"
  }`;

const backClass =
  "flex-1 rounded-full border border-ink/15 p-3.5 text-center text-base font-semibold text-ink-soft transition hover:bg-cream-sunk active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none";

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

  const ownedIds = ownedCandidates.filter((c) => owned[c.id]).map((c) => c.id);
  const total = STEPS.length;
  const cur = STEPS[step];
  const isLast = step === total - 1;

  const goNext = () => setStep((s) => Math.min(total - 1, s + 1));
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

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

      {/* Progress */}
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>ตั้งค่าห้องของคุณ</span>
        <span className="tabular-nums">ข้อ {step + 1} จาก {total}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-cream-sunk">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-300"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mt-7 min-h-[220px]">
        <h1 className="text-2xl font-bold text-ink">{cur.label}</h1>
        {cur.hint && <p className="mt-1.5 text-sm text-ink-soft">{cur.hint}</p>}

        {cur.kind === "number" && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-ink/10 bg-cream-card p-2 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            {cur.prefix && <span className="pl-2 text-2xl font-bold text-ink-muted">{cur.prefix}</span>}
            <input
              type="number"
              inputMode="numeric"
              min={cur.min}
              autoFocus
              value={cur.key === "budget" ? budget : occupants}
              onChange={(e) =>
                cur.key === "budget" ? setBudget(e.target.value) : setOccupants(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  goNext();
                }
              }}
              className="w-full bg-transparent p-2 text-3xl font-bold text-ink focus:outline-none"
            />
            {cur.suffix && <span className="pr-3 text-lg text-ink-muted">{cur.suffix}</span>}
          </div>
        )}

        {cur.kind === "choice" && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {cur.options.map(([val, label]) => (
              <button
                key={val}
                type="button"
                aria-pressed={choices[cur.key] === val}
                onClick={() => setChoices((c) => ({ ...c, [cur.key]: val }))}
                className={optionClass(choices[cur.key] === val)}
              >
                {label}
              </button>
            ))}
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
                className={optionClass(Boolean(has[key])) + " flex items-center gap-2 text-left"}
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
                className={optionClass(Boolean(owned[c.id])) + " flex items-center gap-2 text-left"}
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
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center gap-3">
        {step === 0 ? (
          <Link href="/" className={backClass}>
            ← ออก
          </Link>
        ) : (
          <button type="button" onClick={goPrev} className={backClass}>
            ← ย้อนกลับ
          </button>
        )}
        <div className="flex-[2]">
          {isLast ? (
            <SubmitButton />
          ) : (
            <Button type="button" size="large" pill onClick={goNext} className="w-full">
              ไปต่อ →
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
