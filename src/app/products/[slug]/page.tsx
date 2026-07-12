import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import IconTile from "@/components/IconTile";
import { AddToPlanButton, AddBundleButton } from "@/components/ProductActions";
import { getBundle, getProductBySlug } from "@/lib/catalog";
import { cheapestPrice } from "@/lib/recommendation/engine";
import { getPlanIds } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const bundle = await getBundle(product.id);
  const planIds = new Set(await getPlanIds());

  const sortedPrices = product.prices.length
    ? [...product.prices].sort((a, b) => a.price - b.price)
    : [{ platform: "ราคาอ้างอิง", price: product.refPrice }];
  const cheapest = sortedPrices[0];

  const supabase = await createClient();
  const { data: cheapestRow } = await supabase
    .from("product_prices")
    .select("url")
    .eq("product_id", product.id)
    .order("price")
    .limit(1)
    .maybeSingle();
  const buyUrl: string | null = cheapestRow?.url ?? null;

  const bundleTotal = bundle.reduce((s, b) => s + cheapestPrice(b), 0);

  return (
    <AppLayout>
      <div className="flex items-center gap-3">
        <IconTile icon={product.icon} size="lg" />
        <h1 className="text-2xl font-semibold text-ink">{product.name}</h1>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-ink/10 bg-cream-card shadow-soft">
        <div className="flex items-center justify-between p-3">
          <span className="text-sm font-semibold text-ink">เทียบราคาจากร้านค้า</span>
          <span className="text-xs text-ink-muted">ราคาอ้างอิง</span>
        </div>
        {sortedPrices.map((pr, i) => (
          <div
            key={pr.platform}
            className={`flex items-center justify-between border-t border-ink/8 p-3 ${
              i === 0 ? "bg-emerald-50 text-emerald-700" : "text-ink"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              {pr.platform}
              {i === 0 && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  คุ้มสุด
                </span>
              )}
            </span>
            <span className="font-semibold tabular-nums">฿{pr.price.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {bundle.length > 0 && (
        <>
          <p className="mt-4 text-sm font-semibold text-ink">มักซื้อคู่กับ</p>
          <div className="mt-2 rounded-xl border border-ink/8 bg-cream-card shadow-soft">
            {bundle.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-2 border-b border-ink/5 p-3 last:border-0"
              >
                <span className="text-lg" aria-hidden="true">
                  {b.icon}
                </span>
                <span className="flex-1 text-sm text-ink">{b.name}</span>
                <span className="text-sm text-ink-soft tabular-nums">
                  ฿{cheapestPrice(b).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-cream-sunk p-3">
              <span className="text-sm text-ink-soft tabular-nums">
                ทั้งชุด · ฿{bundleTotal.toLocaleString()}
              </span>
              <AddBundleButton ids={bundle.map((b) => b.id)} />
            </div>
          </div>
        </>
      )}

      <AddToPlanButton productId={product.id} inPlan={planIds.has(product.id)} />

      {buyUrl && (
        <a
          href={buyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block rounded-full border border-ink/15 p-4 text-center text-lg font-semibold text-ink transition hover:bg-cream-sunk active:scale-[0.98]"
        >
          ไปซื้อจริงที่ {cheapest.platform}
        </a>
      )}
    </AppLayout>
  );
}
