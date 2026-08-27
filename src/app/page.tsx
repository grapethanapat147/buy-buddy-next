import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import Mascot from "@/components/Mascot";
import Card from "@/components/ui/Card";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const perks: Array<{ label: string; icon: React.ReactNode }> = [
  {
    label: "แนะนำ\nตามคุณ",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "คุ้มค่า\nทุกบาท",
    icon: (
      <svg {...iconProps}>
        <path d="M4 7a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
        <path d="M20 8H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1Z" />
        <circle cx="16.5" cy="13" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "วางแผน\nซื้อซ้ำ",
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
        <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
        <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <AppLayout>
      <div className="py-6 text-center">
        <div className="relative mx-auto mb-5 flex items-center justify-center">
          <div
            className="absolute h-44 w-44 rounded-full bg-brand-100/70 blur-3xl"
            aria-hidden="true"
          />
          <Mascot mood="happy" size={180} className="relative" />
        </div>
        <h1 className="text-3xl font-bold leading-tight text-ink">
          จัดของเข้าห้อง
          <br />
          ง่าย ๆ ตามงบ
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-lg text-ink-soft">
          ย้ายเข้าห้องใหม่ต้องซื้ออะไรบ้าง บอกงบมา เดี๋ยวจัดให้ครบ คุ้มสุด ไม่บานปลาย
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/wizard"
            className="block rounded-full bg-brand-grad p-4 text-center text-lg font-semibold text-white shadow-soft transition hover:brightness-105 active:scale-[0.98]"
          >
            เริ่มเลย — ตอบไม่กี่ข้อ
          </Link>
          <Link
            href="/explore"
            className="block rounded-full border border-ink/15 p-4 text-center text-lg font-semibold text-ink transition hover:bg-cream-sunk active:scale-95"
          >
            เลือกดูของเอง
          </Link>
        </div>

        <Link
          href="/assistant"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-cream-sunk p-4 text-left transition hover:brightness-[0.98] active:scale-[0.99]"
        >
          <Mascot mood="thinking" size={40} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-ink">คุยกับ BuyBuddy</div>
            <div className="text-xs text-ink-muted">เล่าเรื่องห้องแบบสบาย ๆ เดี๋ยวจัดของให้</div>
          </div>
          <span aria-hidden="true" className="text-ink-muted">
            →
          </span>
        </Link>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {perks.map((perk) => (
            <Card key={perk.label} className="flex flex-col items-center px-2 py-4 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand">
                {perk.icon}
              </span>
              <div className="mt-2 whitespace-pre-line break-keep text-xs font-medium leading-tight text-ink-soft">
                {perk.label}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
