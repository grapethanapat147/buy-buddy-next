import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import Mascot from "@/components/Mascot";
import AiPlannerForm from "@/components/AiPlannerForm";
import Card from "@/components/ui/Card";

const perks: Array<[string, string]> = [
  ["🎯", "แนะนำตามคุณ"],
  ["💸", "คุ้มทุกบาท"],
  ["📅", "วางแผนซื้อซ้ำ"],
];

export default function Home() {
  return (
    <AppLayout>
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 flex items-center justify-center">
          <Mascot mood="happy" size={180} />
        </div>
        <h1 className="text-3xl font-bold leading-tight text-ink">
          จัดของเข้าห้อง
          <br />
          ง่าย ๆ ตามงบ
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-lg text-ink-soft">
          ย้ายเข้าห้องใหม่ต้องซื้ออะไรบ้าง? บอกเรามาเลย เดี๋ยวจัดของให้ครบ คุ้มสุด ไม่บานปลาย 💛
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/wizard"
            className="block rounded-full bg-brand p-4 text-center text-lg font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-[0.98]"
          >
            เริ่มเลย — ตอบ 4 ข้อ
          </Link>
          <Link
            href="/explore"
            className="block rounded-full border border-ink/15 p-4 text-center text-lg font-semibold text-ink transition hover:bg-cream-sunk active:scale-95"
          >
            เลือกดูของเอง
          </Link>
        </div>

        <div className="mt-6">
          <AiPlannerForm />
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {perks.map(([emoji, label]) => (
            <Card key={label} className="p-4 text-center">
              <div className="text-3xl" aria-hidden="true">
                {emoji}
              </div>
              <div className="mt-2 text-sm font-medium text-ink-soft">{label}</div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
