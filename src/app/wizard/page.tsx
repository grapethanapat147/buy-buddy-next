import AppLayout from "@/components/AppLayout";
import WizardForm, { type OwnedCandidate } from "@/components/WizardForm";
import { getProducts } from "@/lib/catalog";

/**
 * Items a renter most often already has — either brought along or left behind in
 * a furnished room (the bigger renter group). Curated (the wizard can't ask about
 * all 60 products) and resolved against the catalog, so names/icons stay in sync
 * and a missing slug is simply skipped. Room fixtures (wardrobe, dining table,
 * counter, aircon) are asked separately, so they are deliberately not repeated.
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
  "work-chair",
  "sofa-bed",
  "blackout-curtain",
  "desk-lamp",
  "tall-shelf",
  "laundry-rack",
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
    </AppLayout>
  );
}
