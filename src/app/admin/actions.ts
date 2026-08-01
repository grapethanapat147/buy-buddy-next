"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildPriceRows, type PriceRowInput } from "@/lib/admin";
import { MARKETPLACES } from "@/lib/marketplace";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "./guard";

/**
 * Replace a product's marketplace prices/links with the values from the admin
 * form. Admin-gated; writes with the service-role client (bypasses RLS).
 */
export async function saveProductPrices(formData: FormData): Promise<void> {
  await requireAdmin();

  const productId = Number(formData.get("product_id"));
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("bad product_id");
  }
  const slug = String(formData.get("slug") ?? "");

  const inputs: PriceRowInput[] = MARKETPLACES.map((platform) => ({
    platform,
    price: formData.get(`price__${platform}`),
    url: formData.get(`url__${platform}`),
  }));
  const rows = buildPriceRows(inputs);

  const supabase = createAdminClient();

  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const { error: imgError } = await supabase
    .from("products")
    .update({ image_url: imageUrl || null })
    .eq("id", productId);
  if (imgError) {
    throw imgError;
  }

  const { error: delError } = await supabase
    .from("product_prices")
    .delete()
    .eq("product_id", productId);
  if (delError) {
    throw delError;
  }

  if (rows.length > 0) {
    const { error: insError } = await supabase
      .from("product_prices")
      .insert(rows.map((r) => ({ product_id: productId, ...r })));
    if (insError) {
      throw insError;
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/products/${productId}`);
  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
  revalidatePath("/explore");
  revalidatePath("/recommendations");
  revalidatePath("/plan");

  redirect("/admin?saved=" + productId);
}
