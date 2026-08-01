import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import ExploreControls from "@/components/ExploreControls";
import Mascot from "@/components/Mascot";
import ScrollToTop from "@/components/ScrollToTop";
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

  // When a search comes up empty, fall back to close matches: same category if
  // one is picked, otherwise a handful of items so the page is never a dead end.
  const suggestions = (
    category ? products.filter((p) => p.categoryName === category) : products
  ).slice(0, 4);
  const googleHref = `https://www.google.com/search?q=${encodeURIComponent(`${q} ราคา`)}`;

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
      </div>

      {filtered.length === 0 && (
        <div className="mt-3">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-cream-sunk px-4 py-8 text-center">
            <Mascot mood="thinking" size={60} />
            <div>
              <p className="text-sm font-semibold text-ink">
                ไม่พบ{query ? ` “${q}”` : "สินค้า"} ในคลังของเรา
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                ลองคำอื่น ดูของใกล้เคียงด้านล่าง หรือค้นราคานอกแอปก็ได้
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/explore"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-500 active:scale-95"
              >
                ดูของทั้งหมด
              </Link>
              {query && (
                <a
                  href={googleHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink-soft transition hover:bg-cream-card active:scale-95"
                >
                  ค้นราคาใน Google ↗
                </a>
              )}
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold text-ink">
                {category ? `ของใกล้เคียงในหมวด${category}` : "ลองของยอดนิยมพวกนี้"}
              </h2>
              <div className="space-y-2">
                {suggestions.map((p) => (
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
              </div>
            </div>
          )}
        </div>
      )}
      <ScrollToTop />
    </AppLayout>
  );
}
