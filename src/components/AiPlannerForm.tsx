"use client";

import { useFormStatus } from "react-dom";
import { planFromText } from "@/app/plan-actions";
import Mascot from "./Mascot";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-full bg-brand p-3 text-base font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? "กำลังคิดให้อยู่…" : "ให้ BuyBuddy จัดให้"}
    </button>
  );
}

export default function AiPlannerForm() {
  return (
    <form action={planFromText} className="rounded-2xl bg-cream-sunk p-4 text-left">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <Mascot mood="thinking" size={24} />
        บอกเรามาเลย เดี๋ยวจัดของให้
      </div>
      <textarea
        name="text"
        rows={2}
        required
        placeholder="เช่น 'งบ 5000 อยู่คนเดียว ทำอาหารบ้าง'"
        className="mt-2 w-full resize-none rounded-xl border border-ink/10 bg-cream-card p-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
      />
      <SubmitButton />
    </form>
  );
}
