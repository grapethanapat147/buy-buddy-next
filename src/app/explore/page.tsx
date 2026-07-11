import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import IconTile from "@/components/IconTile";
import ExploreControls from "@/components/ExploreControls";
import PlanToggleButton from "@/components/PlanToggleButton";
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

      <div className="mt-4 space-y-2">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 rounded-xl border border-ink/8 bg-cream-card p-3 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <IconTile icon={p.icon} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/products/${p.slug}`}
                className="text-sm font-semibold text-ink transition-colors hover:text-brand"
              >
                {p.name}
              </Link>
              <div className="text-xs text-ink-soft tabular-nums">
                {p.categoryName} · ฿{cheapestPrice(p).toLocaleString()}
              </div>
            </div>
            <PlanToggleButton productId={p.id} inPlan={planIds.has(p.id)} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-muted">ไม่พบสินค้า</p>
        )}
      </div>
    </AppLayout>
  );
}
