"use client";

import { useFormStatus } from "react-dom";
import Mascot from "./Mascot";

/**
 * Full-screen loading state shown while a plan is being generated. Must be
 * rendered INSIDE the <form> whose submission it should track (useFormStatus).
 */
export default function PlanningOverlay({
  label = "กำลังจัดของให้คุณ…",
}: {
  label?: string;
}) {
  const { pending } = useFormStatus();
  if (!pending) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-cream/95 px-6 text-center backdrop-blur-sm"
    >
      <div className="motion-safe:animate-bounce">
        <Mascot mood="search" size={120} />
      </div>
      <p className="text-xl font-bold text-ink">{label}</p>
      <p className="max-w-xs text-sm text-ink-soft">
        เดี๋ยวแนะนำของที่คุ้มสุด ไม่เกินงบให้เลย
      </p>
      <div className="mt-1 flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-brand motion-safe:animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-2.5 w-2.5 rounded-full bg-brand motion-safe:animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-2.5 w-2.5 rounded-full bg-brand motion-safe:animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
