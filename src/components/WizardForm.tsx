"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { saveSpecForm } from "@/app/actions";
import Button from "@/components/ui/Button";

type Choice = { key: string; label: string; options: Array<[string, string]> };

/** A catalog item the wizard asks about under "ของพวกนี้มีอยู่แล้วไหม". */
export type OwnedCandidate = { id: number; icon: string; name: string };

/** Fixtures the room may already have — unchecked means "ไม่มี" so we recommend one. */
const fixtures: Array<[string, string, string]> = [
  ["has_kitchen_counter", "🍳", "เคาน์เตอร์ครัว"],
  ["has_wardrobe", "🚪", "ตู้เสื้อผ้า"],
  ["has_dining_table", "🍽️", "โต๊ะกินข้าว"],
  ["has_aircon", "❄️", "แอร์"],
];

const questions: Choice[] = [
  {
    key: "room_size",
    label: "ห้องขนาดประมาณไหน",
    options: [
      ["small", "เล็ก\n< 25 ตร.ม."],
      ["medium", "กลาง\n25–35"],
      ["large", "ใหญ่\n> 35"],
    ],
  },
  {
    key: "cooking",
    label: "ทำอาหารเองบ่อยแค่ไหน",
    options: [
      ["never", "ไม่ทำเลย"],
      ["sometimes", "ทำบ้าง"],
      ["often", "ทำบ่อย"],
    ],
  },
  {
    key: "laundry",
    label: "ซักผ้ายังไง",
    options: [
      ["own_machine", "มีเครื่องซัก"],
      ["hand", "ซักมือ"],
      ["service", "ส่งร้าน"],
    ],
  },
  {
    key: "work_style",
    label: "ทำงานที่ไหนเป็นหลัก",
    options: [
      ["office", "ออฟฟิศ"],
      ["home", "ที่ห้อง"],
      ["hybrid", "ผสม"],
    ],
  },
  {
    key: "spending_style",
    label: "สไตล์การซื้อของ",
    options: [
      ["essentials", "เอาที่จำเป็น"],
      ["balanced", "พอดี ๆ"],
      ["comfort", "อยากได้ครบ"],
    ],
  },
];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-ink/10 bg-cream-card p-3 text-base text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none";

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
  const [choices, setChoices] = useState<Record<string, string>>({
    room_size: "small",
    cooking: "sometimes",
    laundry: "own_machine",
    work_style: "office",
    spending_style: "balanced",
  });
  const [has, setHas] = useState<Record<string, boolean>>({});
  const [owned, setOwned] = useState<Record<number, boolean>>({});

  const ownedIds = ownedCandidates.filter((c) => owned[c.id]).map((c) => c.id);

  return (
    <form action={saveSpecForm}>
      <input type="hidden" name="room_type" value="studio" />
      {Object.entries(choices).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      {fixtures.map(([key]) => (
        <input key={key} type="hidden" name={key} value={has[key] ? "yes" : "no"} />
      ))}
      {ownedIds.map((id) => (
        <input key={id} type="hidden" name="owned" value={id} />
      ))}

      <h1 className="text-2xl font-bold text-ink">ตั้งค่าห้องของคุณ</h1>
      <p className="mt-1 text-base text-ink-soft">ตอบสั้น ๆ เพื่อให้เราแนะนำได้ตรงใจ</p>

      <label className="mt-6 block text-base font-medium text-ink">งบประมาณ (฿)</label>
      <input type="number" name="budget" defaultValue={5000} min={0} className={inputClass} />

      <label className="mt-5 block text-base font-medium text-ink">อยู่กี่คน</label>
      <input type="number" name="occupants" defaultValue={1} min={1} className={inputClass} />

      {questions.map((q) => (
        <div key={q.key} className="mt-6">
          <p className="text-base font-medium text-ink">{q.label}</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {q.options.map(([val, label]) => {
              const active = choices[q.key] === val;
              return (
                <button
                  key={val}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setChoices((c) => ({ ...c, [q.key]: val }))}
                  className={`whitespace-pre-line rounded-2xl border p-3 text-base leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                    active
                      ? "border-2 border-brand bg-brand-50 font-semibold text-brand-700"
                      : "border-ink/10 text-ink-soft hover:bg-cream-sunk"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-6">
        <p className="text-base font-medium text-ink">ในห้องมีอะไรอยู่แล้วบ้าง</p>
        <p className="mt-0.5 text-sm text-ink-muted">
          เลือกที่มีอยู่แล้ว เดี๋ยวเราไม่แนะนำซ้ำ · จะได้เหลืองบไปซื้ออย่างอื่น 💸
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {fixtures.map(([key, emoji, label]) => {
            const active = Boolean(has[key]);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setHas((h) => ({ ...h, [key]: !h[key] }))}
                className={`flex items-center gap-2 rounded-2xl border p-3 text-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  active
                    ? "border-2 border-brand bg-brand-50 font-semibold text-brand-700"
                    : "border-ink/10 text-ink-soft hover:bg-cream-sunk"
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
                <span className="flex-1 text-left leading-snug">{label}</span>
                <span aria-hidden="true" className={active ? "text-brand" : "text-ink-muted/40"}>
                  {active ? "✓" : "＋"}
                </span>
              </button>
            );
          })}
          {ownedCandidates.map((c) => {
            const active = Boolean(owned[c.id]);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setOwned((o) => ({ ...o, [c.id]: !o[c.id] }))}
                className={`flex items-center gap-2 rounded-2xl border p-3 text-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                  active
                    ? "border-2 border-brand bg-brand-50 font-semibold text-brand-700"
                    : "border-ink/10 text-ink-soft hover:bg-cream-sunk"
                }`}
              >
                <span aria-hidden="true">{c.icon}</span>
                <span className="flex-1 text-left leading-snug">{c.name}</span>
                <span aria-hidden="true" className={active ? "text-brand" : "text-ink-muted/40"}>
                  {active ? "✓" : "＋"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Link
          href="/"
          className="flex-1 rounded-full border border-ink/15 p-3.5 text-center text-base font-semibold text-ink-soft transition hover:bg-cream-sunk active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
        >
          ← ย้อนกลับ
        </Link>
        <div className="flex-[2]">
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
