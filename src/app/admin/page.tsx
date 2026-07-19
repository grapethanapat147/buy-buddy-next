import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { getProducts } from "@/lib/catalog";
import { cheapestPrice } from "@/lib/recommendation/engine";
import { MARKETPLACES } from "@/lib/marketplace";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./guard";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { saved } = await searchParams;

  const products = await getProducts();

  // Which products already have at least one real store link.
  const supabase = await createClient();
  const { data: linked } = await supabase
    .from("product_prices")
    .select("product_id")
    .not("url", "is", null);
  const hasLink = new Set((linked ?? []).map((r) => r.product_id));

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold text-ink">⚙️ Admin · ราคา & ลิงก์</h1>
      <p className="mt-1 text-sm text-ink-soft">
        แตะสินค้าเพื่อกรอกราคาจริง + ลิงก์ร้านค้า ({MARKETPLACES.length} ร้าน/ชิ้น)
      </p>

      {saved && (
        <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          ✓ บันทึกราคาสินค้าเรียบร้อยแล้ว
        </div>
      )}

      <div className="mt-4 space-y-2">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/admin/products/${p.id}`}
            className="flex items-center gap-3 rounded-xl border border-ink/8 bg-cream-card p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="text-2xl" aria-hidden="true">
              {p.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-ink">{p.name}</div>
              <div className="text-xs text-ink-soft tabular-nums">
                {p.categoryName} · ฿{cheapestPrice(p).toLocaleString()} · {p.prices.length}/
                {MARKETPLACES.length} ร้าน
              </div>
            </div>
            {hasLink.has(p.id) ? (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                🔗 มีลิงก์
              </span>
            ) : (
              <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                ยังไม่มีลิงก์
              </span>
            )}
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
