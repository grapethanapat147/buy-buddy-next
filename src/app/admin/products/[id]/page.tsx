import Link from "next/link";
import { notFound } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import IconTile from "@/components/IconTile";
import Button from "@/components/ui/Button";
import { getProducts } from "@/lib/catalog";
import { MARKETPLACES } from "@/lib/marketplace";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "../../guard";
import { saveProductPrices } from "../../actions";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const productId = Number(id);

  const products = await getProducts();
  const product = products.find((p) => p.id === productId);
  if (!product) {
    notFound();
  }

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("product_prices")
    .select("platform,price,url")
    .eq("product_id", productId);

  const current = new Map(
    (rows ?? []).map((r) => [r.platform, { price: r.price as number, url: (r.url as string) ?? "" }]),
  );

  const inputClass =
    "w-full rounded-xl border border-ink/10 bg-cream-card p-2.5 text-base text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none";

  return (
    <AppLayout>
      <Link href="/admin" className="text-sm text-ink-soft transition-colors hover:text-ink">
        ← กลับรายการ
      </Link>

      <div className="mt-2 flex items-center gap-3">
        <IconTile icon={product.icon} imageUrl={product.imageUrl} />
        <div>
          <h1 className="text-xl font-semibold text-ink">{product.name}</h1>
          <p className="text-xs text-ink-soft">
            {product.categoryName} · ราคาอ้างอิง ฿{product.refPrice.toLocaleString()}
          </p>
        </div>
      </div>

      <form action={saveProductPrices} className="mt-5">
        <input type="hidden" name="product_id" value={product.id} />
        <input type="hidden" name="slug" value={product.slug} />

        <div className="rounded-xl border border-ink/8 bg-cream-card p-3 shadow-soft">
          <label htmlFor="image_url" className="text-sm font-semibold text-ink">
            รูปสินค้า
          </label>
          <p className="mt-0.5 text-xs text-ink-muted">
            วางลิงก์รูป (URL) · เว้นว่าง = ใช้ emoji {product.icon} แทน
          </p>
          <input
            id="image_url"
            type="url"
            name="image_url"
            placeholder="https://…/photo.jpg"
            defaultValue={product.imageUrl ?? ""}
            className={inputClass + " mt-2"}
          />
        </div>

        <p className="mt-4 text-sm text-ink-soft">
          กรอกราคาจริง (บาท) + ลิงก์หน้าสินค้าของแต่ละร้าน · เว้นราคาว่างไว้ = ไม่มีขายที่ร้านนั้น
        </p>

        <div className="mt-3 space-y-4">
          {MARKETPLACES.map((platform) => {
            const cur = current.get(platform);
            return (
              <div key={platform} className="rounded-xl border border-ink/8 bg-cream-card p-3 shadow-soft">
                <div className="text-sm font-semibold text-ink">{platform}</div>
                <div className="mt-2 grid grid-cols-[7rem_1fr] gap-2">
                  <input
                    type="number"
                    name={`price__${platform}`}
                    min={0}
                    inputMode="numeric"
                    placeholder="ราคา ฿"
                    defaultValue={cur?.price ?? ""}
                    className={inputClass}
                  />
                  <input
                    type="url"
                    name={`url__${platform}`}
                    placeholder="https://… ลิงก์หน้าสินค้า"
                    defaultValue={cur?.url ?? ""}
                    className={inputClass}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button type="submit" size="large" pill className="mt-6 w-full">
          บันทึกรูป ราคา & ลิงก์
        </Button>
      </form>
    </AppLayout>
  );
}
