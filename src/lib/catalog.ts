import { createClient } from './supabase/server';
import type { Product } from './recommendation/types';

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapProduct(row: any): Product {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        icon: row.icon,
        categoryName: row.category?.name ?? '',
        tier: row.tier,
        mode: row.mode,
        refPrice: row.ref_price,
        restockCadence: row.restock_cadence,
        qtyScalesBy: row.qty_scales_by,
        triggers: Array.isArray(row.triggers) ? row.triggers : [],
        prices: (row.prices ?? []).map((p: any) => ({ platform: p.platform, price: p.price, url: p.url ?? null })),
    };
}

const PRODUCT_SELECT =
    'id,name,slug,icon,tier,mode,ref_price,restock_cadence,qty_scales_by,triggers, category:categories(name), prices:product_prices(platform,price,url)';

export async function getProducts(): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).order('id');
    if (error) throw error;
    return (data ?? []).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select(PRODUCT_SELECT).eq('slug', slug).maybeSingle();
    if (error) throw error;
    return data ? mapProduct(data) : null;
}

/** paired products (Smart Bundle) for a product id */
export async function getBundle(productId: number): Promise<Product[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('product_pairings')
        .select('paired:products!product_pairings_paired_product_id_fkey(' + PRODUCT_SELECT + ')')
        .eq('product_id', productId);
    if (error) throw error;
    return (data ?? []).map((row: any) => mapProduct(row.paired)).filter(Boolean);
}
