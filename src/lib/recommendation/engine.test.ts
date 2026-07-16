import { describe, expect, it } from 'vitest';
import { cheapestPrice, passesTriggers, recommend, storeRollup, summarizePlan } from './engine';
import { defaultSpec, normalizeSpec, type Product, type ProductTier, type Spec } from './types';

function spec(overrides: Partial<Spec> = {}): Spec {
    return { ...defaultSpec, ...overrides };
}

let nextId = 1;
function product(overrides: Partial<Product> = {}): Product {
    return {
        id: nextId++,
        name: 'item',
        slug: `item-${nextId}`,
        icon: '📦',
        categoryName: 'cat',
        tier: 'must',
        mode: 'move_in',
        refPrice: 100,
        restockCadence: null,
        qtyScalesBy: null,
        triggers: [],
        prices: [],
        ...overrides,
    };
}

describe('triggers', () => {
    it('passes with no triggers', () => {
        expect(passesTriggers([], spec())).toBe(true);
    });
    it('matches "in" and ">=" and requires all (AND)', () => {
        expect(passesTriggers([{ field: 'cooking', op: 'in', value: ['sometimes', 'often'] }], spec({ cooking: 'never' }))).toBe(false);
        expect(passesTriggers([{ field: 'occupants', op: '>=', value: 2 }], spec({ occupants: 2 }))).toBe(true);
        expect(passesTriggers([{ field: 'cooking', op: '=', value: 'often' }, { field: 'occupants', op: '>=', value: 2 }], spec({ cooking: 'often', occupants: 1 }))).toBe(false);
    });
    it('matches room_size', () => {
        expect(passesTriggers([{ field: 'room_size', op: '=', value: 'small' }], spec({ roomSize: 'small' }))).toBe(true);
        expect(passesTriggers([{ field: 'room_size', op: '=', value: 'small' }], spec({ roomSize: 'large' }))).toBe(false);
        expect(passesTriggers([{ field: 'room_size', op: 'in', value: ['medium', 'large'] }], spec({ roomSize: 'large' }))).toBe(true);
    });
    it('maps "has_*" fixtures to yes/no so missing ones are recommended', () => {
        // A product triggered by "no wardrobe" shows only when the room has none.
        const noWardrobe = [{ field: 'has_wardrobe', op: '=' as const, value: 'no' }];
        expect(passesTriggers(noWardrobe, spec({ hasWardrobe: false }))).toBe(true);
        expect(passesTriggers(noWardrobe, spec({ hasWardrobe: true }))).toBe(false);

        expect(passesTriggers([{ field: 'has_dining_table', op: '=', value: 'no' }], spec({ hasDiningTable: true }))).toBe(false);
        expect(passesTriggers([{ field: 'has_kitchen_counter', op: '=', value: 'no' }], spec({ hasKitchenCounter: false }))).toBe(true);
        expect(passesTriggers([{ field: 'has_aircon', op: '=', value: 'no' }], spec({ hasAircon: true }))).toBe(false);
    });
    it('hides fixture products the room already has', () => {
        const wardrobe = product({ tier: 'must', triggers: [{ field: 'has_wardrobe', op: '=', value: 'no' }] });
        const fan = product({ tier: 'must' });
        const ids = (s: Spec) => recommend([wardrobe, fan], s).map((i) => i.productId);

        expect(ids(spec({ hasWardrobe: false }))).toContain(wardrobe.id);
        expect(ids(spec({ hasWardrobe: true }))).not.toContain(wardrobe.id);
        expect(ids(spec({ hasWardrobe: true }))).toContain(fan.id);
    });
});

describe('cheapestPrice', () => {
    it('falls back to ref price with no platform prices', () => {
        expect(cheapestPrice(product({ refPrice: 300 }))).toBe(300);
    });
    it('returns the lowest platform price', () => {
        expect(cheapestPrice(product({ prices: [{ platform: 'A', price: 650 }, { platform: 'B', price: 590 }] }))).toBe(590);
    });
});

describe('recommend', () => {
    it('excludes owned and trigger-mismatched, scales by occupants, orders musts first', () => {
        const keep = product({ tier: 'must', refPrice: 100 });
        const owned = product({ tier: 'must', refPrice: 100 });
        const cook = product({ tier: 'must', triggers: [{ field: 'cooking', op: 'in', value: ['often'] }] });
        const detergent = product({ tier: 'must', refPrice: 60, qtyScalesBy: 'occupants' });
        const optional = product({ tier: 'optional', refPrice: 100 });

        const result = recommend([optional, keep, owned, cook, detergent], spec({ ownedProductIds: [owned.id], occupants: 3, cooking: 'never' }));
        const ids = result.map((i) => i.productId);

        expect(ids).toContain(keep.id);
        expect(ids).not.toContain(owned.id);
        expect(ids).not.toContain(cook.id);
        expect(result.find((i) => i.productId === detergent.id)!.lineTotal).toBe(180);
        expect(result[0].tier).toBe('must');
    });

    it('defers optional that does not fit, and flags must-exceeds', () => {
        const defer = recommend([product({ tier: 'must', refPrice: 800 }), product({ tier: 'optional', refPrice: 300 })], spec({ budget: 1000 }));
        expect(defer.filter((i) => i.status === 'deferred')).toHaveLength(1);

        const musts = recommend([product({ tier: 'must', refPrice: 2000 }), product({ tier: 'must', refPrice: 1500 })], spec({ budget: 3000 }));
        expect(musts.every((i) => i.status === 'in_plan')).toBe(true);
    });

    it('hides optional for essentials spenders but shows for comfort', () => {
        const opt = product({ tier: 'optional' });
        const list = [opt, product({ tier: 'must' })];
        expect(recommend(list, spec({ spendingStyle: 'essentials' })).map((i) => i.productId)).not.toContain(opt.id);
        expect(recommend(list, spec({ spendingStyle: 'comfort' })).map((i) => i.productId)).toContain(opt.id);
    });
});

describe('summarizePlan', () => {
    const line = (id: number, tier: ProductTier, lineTotal: number) => ({ productId: id, tier, lineTotal });

    it('is in budget with no suggestions', () => {
        const s = summarizePlan([line(1, 'must', 800), line(2, 'optional', 150)], 1000);
        expect(s.overBudgetBy).toBe(0);
        expect(s.suggestedDeferrals).toEqual([]);
    });
    it('suggests deferring the lowest-priority optional when over', () => {
        const s = summarizePlan([line(1, 'must', 800), line(2, 'optional', 250), line(3, 'recommended', 120)], 1000);
        expect(s.overBudgetBy).toBe(170);
        expect(s.mustExceedsBudget).toBe(false);
        expect(s.suggestedDeferrals).toEqual([2]);
    });
    it('flags must-exceeds', () => {
        const s = summarizePlan([line(1, 'must', 2000), line(2, 'must', 1500)], 3000);
        expect(s.mustExceedsBudget).toBe(true);
        expect(s.overBudgetBy).toBe(500);
        expect(s.suggestedDeferrals).toEqual([]);
    });
});

describe('storeRollup', () => {
    it('totals per platform with cheapest fallback', () => {
        const a = product({ refPrice: 100, prices: [{ platform: 'Shopee', price: 100 }, { platform: 'Lazada', price: 120 }] });
        const b = product({ refPrice: 200, prices: [{ platform: 'Shopee', price: 200 }] });
        const rows = storeRollup([{ product: a, qty: 1 }, { product: b, qty: 2 }]);
        expect(rows[0]).toEqual({ platform: 'Shopee', total: 500 });
        expect(rows[1]).toEqual({ platform: 'Lazada', total: 520 });
    });
});

describe('normalizeSpec', () => {
    it('keeps owned ids and fills fields an older cookie is missing', () => {
        const s = normalizeSpec({ budget: 9000, ownedProductIds: [4, 7] });

        expect(s.budget).toBe(9000);
        expect(s.ownedProductIds).toEqual([4, 7]);
        expect(s.cooking).toBe(defaultSpec.cooking);
    });

    it('coerces a malformed ownedProductIds so recommend() cannot crash on .includes()', () => {
        const bad = (value: unknown) => normalizeSpec({ ownedProductIds: value as number[] }).ownedProductIds;

        expect(bad('nope')).toEqual([]);
        expect(bad(undefined)).toEqual([]);
        expect(normalizeSpec(null).ownedProductIds).toEqual([]);
        expect(bad(['3', 0, -1, 'x'])).toEqual([3]);
    });

    it('still recommends normally after normalizing a spec that owns an item', () => {
        const owned = product({ tier: 'must', refPrice: 100 });
        const keep = product({ tier: 'must', refPrice: 100 });

        const result = recommend([owned, keep], normalizeSpec({ ownedProductIds: [owned.id] }));

        expect(result.map((i) => i.productId)).toEqual([keep.id]);
    });
});
