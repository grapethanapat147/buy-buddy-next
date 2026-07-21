import AppLayout from "@/components/AppLayout";
import PlanView, { type PlanLine } from "@/components/PlanView";
import { type RestockItem } from "@/components/RestockCalendar";
import { getProducts } from "@/lib/catalog";
import { cheapestPrice, storeRollup, summarizePlan } from "@/lib/recommendation/engine";
import { tierPriority } from "@/lib/recommendation/types";
import { getPlanIds, getProductNotes, getRestockSchedule, getSpec } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

/** Spread items across the month deterministically when the user hasn't picked a day yet. */
function defaultDay(productId: number): number {
  return ((productId * 7) % 28) + 1;
}

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
  const notes = await getProductNotes();

  const items: PlanLine[] = withQty
    .map(({ product, lineTotal }) => ({
      productId: product.id,
      name: product.name,
      icon: product.icon,
      tier: product.tier,
      category: product.categoryName,
      lineTotal,
      suggested: suggested.has(product.id),
      note: notes[String(product.id)] ?? "",
    }))
    .sort((a, b) => tierPriority[a.tier] - tierPriority[b.tier] || a.lineTotal - b.lineTotal);

  const rollup = storeRollup(
    withQty.map(({ product, qty }) => ({ product, qty })),
  );

  const schedule = await getRestockSchedule();
  const restockItems: RestockItem[] = planProducts
    .filter((p) => p.mode === "restock")
    .map((p) => {
      const slot = schedule[String(p.id)];
      return {
        id: p.id,
        icon: p.icon,
        name: p.name,
        price: cheapestPrice(p),
        cadence: p.restockCadence ?? "other",
        day: slot?.day ?? defaultDay(p.id),
        done: slot?.done ?? false,
      };
    })
    .sort((a, b) => a.day - b.day);

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
        restockItems={restockItems}
        isLoggedIn={Boolean(user)}
      />
    </AppLayout>
  );
}
