import AppLayout from "@/components/AppLayout";
import ExploreControls from "@/components/ExploreControls";
import SwipeableItemRow from "@/components/SwipeableItemRow";
import { getProducts } from "@/lib/catalog";
import { cheapestPrice } from "@/lib/recommendation/engine";
import { getPlanIds } from "@/lib/session";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category = "", q = "" } = await searchParams;
  const products = await getProducts();
  const planIds = new Set(await getPlanIds());

  const categories: string[] = [];
  for (const p of products) {
    if (p.categoryName && !categories.includes(p.categoryName)) {
      categories.push(p.categoryName);
    }
  }

  const query = q.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const catOk = category ? p.categoryName === category : true;
    const qOk = query ? p.name.toLowerCase().includes(query) : true;
    return catOk && qOk;
  });

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold text-ink">เลือกดูของเอง</h1>
      <ExploreControls categories={categories} activeCategory={category} query={q} />

      <p className="mt-2 text-xs text-ink-muted">
        เคล็ดลับ: ปัดขวาเพื่อเพิ่ม · ปัดซ้ายเพื่อเอาออก 👉
      </p>

      <div className="mt-3 space-y-2">
        {filtered.map((p) => (
          <SwipeableItemRow
            key={p.id}
            productId={p.id}
            inPlan={planIds.has(p.id)}
            icon={p.icon}
            title={p.name}
            href={`/products/${p.slug}`}
            subtitle={
              <span className="tabular-nums">
                {p.categoryName} · ฿{cheapestPrice(p).toLocaleString()}
              </span>
            }
          />
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">ไม่พบสินค้า</p>
        )}
      </div>
    </AppLayout>
  );
}
