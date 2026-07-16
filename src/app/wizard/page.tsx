import AppLayout from "@/components/AppLayout";
import WizardForm, { type OwnedCandidate } from "@/components/WizardForm";
import AiPlannerForm from "@/components/AiPlannerForm";
import { getProducts } from "@/lib/catalog";

/**
 * Big-ticket items a renter most often already owns and brings along. Kept to a
 * short curated list (the wizard can't ask about all 60 products) and resolved
 * against the catalog, so names/icons stay in sync and a missing slug is simply
 * skipped. Room fixtures (wardrobe, dining table, ...) are asked separately, so
 * they are deliberately not repeated here.
 */
const OWNED_CANDIDATE_SLUGS = [
  "mini-fridge",
  "rice-cooker",
  "microwave",
  "stand-fan",
  "mattress-3-5ft",
  "kettle",
  "work-desk",
  "induction-cooker",
];

export default async function WizardPage() {
  const products = await getProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const ownedCandidates: OwnedCandidate[] = OWNED_CANDIDATE_SLUGS.flatMap((slug) => {
    const p = bySlug.get(slug);
    return p ? [{ id: p.id, icon: p.icon, name: p.name }] : [];
  });

  return (
    <AppLayout>
      <WizardForm ownedCandidates={ownedCandidates} />
      <div className="mt-8 border-t border-ink/10 pt-6">
        <AiPlannerForm />
      </div>
    </AppLayout>
  );
}
