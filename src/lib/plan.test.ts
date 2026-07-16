import { describe, expect, it } from "vitest";
import { mergePlanIds } from "./plan";

describe("mergePlanIds", () => {
  it("returns the saved plan unchanged when the guest plan is empty (fresh-device login)", () => {
    expect(mergePlanIds([1, 2, 3], [])).toEqual([1, 2, 3]);
  });

  it("unions saved and guest without duplicates", () => {
    expect(mergePlanIds([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });

  it("keeps the guest plan when there is nothing saved", () => {
    expect(mergePlanIds([], [4, 5])).toEqual([4, 5]);
  });

  it("drops malformed ids from either side", () => {
    expect(mergePlanIds([1, 0, -2], [NaN as unknown as number, 3, 3])).toEqual([1, 3]);
  });
});
