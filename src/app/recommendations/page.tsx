import { redirect } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import RecommendationsQuest, {
  type OtherCategory,
  type OtherItem,
  type OwnedItem,
  type QuestCategory,
  type QuestItem,
} from "@/components/RecommendationsQuest";
import ScrollToTop from "@/components/ScrollToTop";
import { getProducts } from "@/lib/catalog";
import { cheapestPrice, recommend } from "@/lib/recommendation/engine";
import { getPlanIds, getSpec } from "@/lib/session";

export default async function RecommendationsPage() {
  const spec = await getSpec();
  if (!spec) {
    redirect("/wizard");
  }

  const products = await getProducts();
  const recs = recommend(products, spec);
  const planIds = new Set(await getPlanIds());
  const bySlug = new Map(products.map((p) => [p.id, p.slug]));

  const items: QuestItem[] = recs.map((r) => ({
    productId: r.productId,
    name: r.name,
    slug: bySlug.get(r.productId) ?? String(r.productId),
    icon: r.icon,
    tier: r.tier,
    lineTotal: r.lineTotal,
    inPlan: planIds.has(r.productId),
  }));

  const categoryOrder: string[] = [];
  const grouped = new Map<string, QuestItem[]>();
  for (const item of items) {
    const cat = recs.find((r) => r.productId === item.productId)!.category;
    if (!grouped.has(cat)) {
      grouped.set(cat, []);
      categoryOrder.push(cat);
    }
    grouped.get(cat)!.push(item);
  }

  const categories: QuestCategory[] = categoryOrder.map((name) => {
    const catItems = grouped.get(name)!;
    return {
      name,
      items: catItems,
      total: catItems.length,
      collected: catItems.filter((i) => i.inPlan).length,
    };
  });

  const musts = items.filter((i) => i.tier === "must");
  const collectedMusts = musts.filter((i) => i.inPlan).length;
  const readinessPercent = musts.length
    ? Math.round((collectedMusts / musts.length) * 100)
    : 0;
  const plannedTotal = items
    .filter((i) => i.inPlan)
    .reduce((sum, i) => sum + i.lineTotal, 0);

  // Things the user told us they already own: don't recommend them, don't list
  // them as "add me" — just acknowledge them so the room doesn't read as empty.
  const ownedIdSet = new Set(spec.ownedProductIds);
  const ownedItems: OwnedItem[] = products
    .filter((p) => ownedIdSet.has(p.id))
    .map((p) => ({ productId: p.id, name: p.name, slug: p.slug, icon: p.icon }));

  // Everything else the engine didn't surface (and the user doesn't already own),
  // so they can still browse the full catalog — recommended first, then the rest.
  const recIds = new Set(recs.map((r) => r.productId));
  const otherOrder: string[] = [];
  const otherGrouped = new Map<string, OtherItem[]>();
  for (const p of products) {
    if (recIds.has(p.id) || ownedIdSet.has(p.id)) {
      continue;
    }
    const cat = p.categoryName || "อื่น ๆ";
    if (!otherGrouped.has(cat)) {
      otherGrouped.set(cat, []);
      otherOrder.push(cat);
    }
    otherGrouped.get(cat)!.push({
      productId: p.id,
      name: p.name,
      slug: p.slug,
      icon: p.icon,
      price: cheapestPrice(p),
      inPlan: planIds.has(p.id),
    });
  }
  const otherCategories: OtherCategory[] = otherOrder.map((name) => ({
    name,
    items: otherGrouped.get(name)!,
  }));

  return (
    <AppLayout>
      <RecommendationsQuest
        categories={categories}
        otherCategories={otherCategories}
        ownedItems={ownedItems}
        budget={spec.budget}
        plannedTotal={plannedTotal}
        readinessPercent={readinessPercent}
      />
      <ScrollToTop />
    </AppLayout>
  );
}
