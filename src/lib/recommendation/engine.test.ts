import { describe, expect, it } from 'vitest';
import { cheapestPrice, passesTriggers, recommend, storeRollup, summarizePlan } from './engine';
import type { Product, ProductTier, Spec } from './types';

function spec(overrides: Partial<Spec> = {}): Spec {
    return {
        budget: 5000,
        roomType: 'studio',
        occupants: 1,
        cooking: 'sometimes',
        laundry: 'own_machine',
        workStyle: 'office',
        spendingStyle: 'balanced',
        ownedProductIds: [],
        ...overrides,
    };
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
