import { describe, expect, it } from "vitest";
import { buildPriceRows, isAdminEmail, parseAdminEmails } from "./admin";

describe("parseAdminEmails / isAdminEmail", () => {
  it("splits on commas/whitespace and lowercases", () => {
    expect(parseAdminEmails("A@x.com, b@y.com\n c@z.com")).toEqual([
      "a@x.com",
      "b@y.com",
      "c@z.com",
    ]);
  });

  it("matches case-insensitively; empty allowlist means nobody is admin", () => {
    expect(isAdminEmail("Owner@Shop.com", "owner@shop.com")).toBe(true);
    expect(isAdminEmail("someone@else.com", "owner@shop.com")).toBe(false);
    expect(isAdminEmail("owner@shop.com", "")).toBe(false);
    expect(isAdminEmail(null, "owner@shop.com")).toBe(false);
  });
});

describe("buildPriceRows", () => {
  it("keeps known marketplaces with a positive price, trims url to null when blank", () => {
    const rows = buildPriceRows([
      { platform: "Shopee", price: "590", url: " https://shopee.co.th/x " },
      { platform: "Lazada", price: "622", url: "" },
      { platform: "TikTok Shop", price: "0", url: "x" }, // 0 price -> skipped
      { platform: "Weird Store", price: "100", url: "x" }, // unknown -> skipped
    ]);

    expect(rows).toEqual([
      { platform: "Shopee", price: 590, url: "https://shopee.co.th/x" },
      { platform: "Lazada", price: 622, url: null },
    ]);
  });

  it("drops non-numeric or negative prices", () => {
    expect(buildPriceRows([{ platform: "Shopee", price: "abc", url: "" }])).toEqual([]);
    expect(buildPriceRows([{ platform: "Shopee", price: -5, url: "" }])).toEqual([]);
  });
});
