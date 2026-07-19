import { MARKETPLACES } from "./marketplace";

/** Parse the ADMIN_EMAILS allowlist (comma/whitespace separated, case-insensitive). */
export function parseAdminEmails(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/[,\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Whether an email is on the admin allowlist. Empty allowlist = nobody is admin. */
export function isAdminEmail(email: string | null | undefined, raw: string | undefined): boolean {
  if (!email) {
    return false;
  }
  return parseAdminEmails(raw).includes(email.trim().toLowerCase());
}

export type PriceRowInput = { platform: string; price: unknown; url: unknown };
export type PriceRow = { platform: string; price: number; url: string | null };

/**
 * Clean the admin price form into rows ready for insert: only known marketplaces,
 * only positive integer prices (a blank/0 price means "no price here — skip it"),
 * url trimmed to null when empty.
 */
export function buildPriceRows(inputs: PriceRowInput[]): PriceRow[] {
  const allowed = new Set<string>(MARKETPLACES);
  const rows: PriceRow[] = [];

  for (const { platform, price, url } of inputs) {
    if (!allowed.has(platform)) {
      continue;
    }
    const priceNum = Math.round(Number(price));
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      continue;
    }
    const urlStr = typeof url === "string" ? url.trim() : "";
    rows.push({ platform, price: priceNum, url: urlStr === "" ? null : urlStr });
  }

  return rows;
}
