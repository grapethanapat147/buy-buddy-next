import { redirect } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import RecommendationsQuest, {
  type QuestCategory,
  type QuestItem,
} from "@/components/RecommendationsQuest";
import { getProducts } from "@/lib/catalog";
import { recommend } from "@/lib/recommendation/engine";
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

  return (
    <AppLayout>
      <RecommendationsQuest
        categories={categories}
        budget={spec.budget}
        plannedTotal={plannedTotal}
        readinessPercent={readinessPercent}
      />
    </AppLayout>
  );
}
