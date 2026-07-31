"use client";

import { useFormStatus } from "react-dom";
import Mascot from "./Mascot";

/**
 * Full-screen loading state shown while a plan is being generated. Must be
 * rendered INSIDE the <form> whose submission it should track (useFormStatus).
 */
export default function PlanningOverlay({
  label = "กำลังจัดของให้คุณ",
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
        <Mascot mood="search" size={168} />
      </div>
      <p className="text-2xl font-bold text-ink">
        {label}
        <span aria-hidden="true" className="text-brand">
          <span className="inline-block motion-safe:animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
          <span className="inline-block motion-safe:animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
          <span className="inline-block motion-safe:animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
        </span>
      </p>
      <p className="max-w-xs text-sm text-ink-soft">เดี๋ยวแนะนำของที่คุ้มสุด ไม่เกินงบให้เลย</p>
    </div>
  );
}
