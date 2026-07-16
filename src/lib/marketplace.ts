/**
 * Where "ไปซื้อจริง" sends the user. We don't have per-product deep links, so we
 * build a search URL on the marketplace for the product name — the honest
 * advisor behaviour (we point at the store, the user picks the exact listing).
 * A real affiliate/deep link stored on product_prices.url takes precedence when
 * present (see buyUrlFor).
 */
const SEARCH_URL: Record<string, (q: string) => string> = {
  Shopee: (q) => `https://shopee.co.th/search?keyword=${q}`,
  Lazada: (q) => `https://www.lazada.co.th/catalog/?q=${q}`,
  "TikTok Shop": (q) => `https://www.tiktok.com/search?q=${q}`,
  // No single "official store" — Google Shopping surfaces brand/official listings.
  "Official Store": (q) => `https://www.google.com/search?tbm=shop&q=${q}`,
};

/** Search URL for a platform, or null for an unknown platform (e.g. the ราคาอ้างอิง fallback). */
export function marketplaceSearchUrl(platform: string, query: string): string | null {
  const build = SEARCH_URL[platform];
  return build ? build(encodeURIComponent(query.trim())) : null;
}

/** Prefer a real stored deep link; otherwise fall back to a marketplace search. */
export function buyUrlFor(
  platform: string,
  productName: string,
  storedUrl?: string | null,
): string | null {
  if (storedUrl && storedUrl.trim() !== "") {
    return storedUrl;
  }
  return marketplaceSearchUrl(platform, productName);
}
