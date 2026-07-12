import AppLayout from "@/components/AppLayout";
import PlanView, {
  type PlanLine,
  type RestockGroup,
} from "@/components/PlanView";
import { getProducts } from "@/lib/catalog";
import { cheapestPrice, storeRollup, summarizePlan } from "@/lib/recommendation/engine";
import { tierPriority } from "@/lib/recommendation/types";
import { getPlanIds, getSpec } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

export default async function PlanPage() {
  const planIds = await getPlanIds();
  const spec = await getSpec();
  const budget = spec?.budget ?? 5000;
  const occupants = spec?.occupants ?? 1;

  const products = await getProducts();
  const planProducts = products.filter((p) => planIds.includes(p.id));

  const withQty = planProducts.map((p) => {
    const qty = p.qtyScalesBy === "occupants" ? occupants : 1;
    return { product: p, qty, lineTotal: cheapestPrice(p) * qty };
  });

  const summary = summarizePlan(
    withQty.map(({ product, lineTotal }) => ({
      productId: product.id,
      tier: product.tier,
      lineTotal,
    })),
    budget,
  );
  const suggested = new Set(summary.suggestedDeferrals);

  const items: PlanLine[] = withQty
    .map(({ product, lineTotal }) => ({
      productId: product.id,
      name: product.name,
      icon: product.icon,
      tier: product.tier,
      category: product.categoryName,
      lineTotal,
      suggested: suggested.has(product.id),
    }))
    .sort((a, b) => tierPriority[a.tier] - tierPriority[b.tier] || a.lineTotal - b.lineTotal);

  const rollup = storeRollup(
    withQty.map(({ product, qty }) => ({ product, qty })),
  );

  const restockOrder = ["weekly", "monthly"];
  const restockMap = new Map<string, RestockGroup["items"]>();
  for (const p of planProducts) {
    if (p.mode !== "restock") {
      continue;
    }
    const cadence = p.restockCadence ?? "other";
    if (!restockMap.has(cadence)) {
      restockMap.set(cadence, []);
    }
    restockMap.get(cadence)!.push({
      id: p.id,
      icon: p.icon,
      name: p.name,
      price: cheapestPrice(p),
    });
  }
  const restock: RestockGroup[] = [...restockMap.keys()]
    .sort((a, b) => {
      const ia = restockOrder.indexOf(a);
      const ib = restockOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((cadence) => ({ cadence, items: restockMap.get(cadence)! }));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AppLayout>
      <PlanView
        items={items}
        budget={budget}
        total={summary.total}
        overBudgetBy={summary.overBudgetBy}
        mustExceedsBudget={summary.mustExceedsBudget}
        storeRollup={rollup}
        restock={restock}
        isLoggedIn={Boolean(user)}
      />
    </AppLayout>
  );
}
