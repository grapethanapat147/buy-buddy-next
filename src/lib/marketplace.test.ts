import { describe, expect, it } from "vitest";
import { buyUrlFor, marketplaceSearchUrl } from "./marketplace";

describe("marketplaceSearchUrl", () => {
  it("builds an encoded search URL for each known marketplace", () => {
    expect(marketplaceSearchUrl("Shopee", "หม้อหุงข้าว 1.8 ลิตร")).toBe(
      "https://shopee.co.th/search?keyword=" + encodeURIComponent("หม้อหุงข้าว 1.8 ลิตร"),
    );
    expect(marketplaceSearchUrl("Lazada", "kettle")).toBe(
      "https://www.lazada.co.th/catalog/?q=kettle",
    );
    expect(marketplaceSearchUrl("TikTok Shop", "a b")).toContain("tiktok.com/search?q=a%20b");
    expect(marketplaceSearchUrl("Official Store", "x")).toContain("google.com/search?tbm=shop");
  });

  it("returns null for an unknown platform (e.g. the ราคาอ้างอิง fallback)", () => {
    expect(marketplaceSearchUrl("ราคาอ้างอิง", "x")).toBeNull();
  });
});

describe("buyUrlFor", () => {
  it("prefers a real stored deep link over the generated search", () => {
    expect(buyUrlFor("Shopee", "kettle", "https://shopee.co.th/product/123")).toBe(
      "https://shopee.co.th/product/123",
    );
  });

  it("falls back to a marketplace search when there is no stored url", () => {
    expect(buyUrlFor("Shopee", "kettle", null)).toBe(
      "https://shopee.co.th/search?keyword=kettle",
    );
    expect(buyUrlFor("Shopee", "kettle", "  ")).toBe(
      "https://shopee.co.th/search?keyword=kettle",
    );
  });
});
