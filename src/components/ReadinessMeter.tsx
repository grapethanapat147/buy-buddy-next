"use client";

import { motion } from "motion/react";

export default function ReadinessMeter({ percent }: { percent: number }) {
  const label =
    percent >= 100
      ? "ห้องพร้อมอยู่แล้ว! 🎉"
      : percent >= 50
        ? "ใกล้แล้ว จัดต่อเลย"
        : "เริ่มจัดห้องกันเลย";
  return (
    <div className="rounded-2xl bg-brand-50 p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-ink">
          ห้องพร้อม {percent}%
        </span>
        <span className="text-sm text-brand-700">{label}</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/70">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand-100 via-brand to-brand-500"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        เก็บ “ของจำเป็น” ให้ครบ แถบก็จะเต็ม — ห้องพร้อมเข้าอยู่
      </p>
    </div>
  );
}
