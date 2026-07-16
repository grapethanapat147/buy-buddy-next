/**
 * Union of a saved account plan and a guest cookie plan, deduped and cleaned.
 *
 * This is the invariant that prevents the "logging in wipes my saved plan" bug:
 * logging in from a fresh device (empty guest plan) must return the saved plan
 * unchanged, never an empty list.
 */
export function mergePlanIds(
  saved: readonly number[],
  guest: readonly number[],
): number[] {
  const clean = (ids: readonly number[]) =>
    ids.map(Number).filter((id) => Number.isInteger(id) && id > 0);

  return [...new Set([...clean(saved), ...clean(guest)])];
}
