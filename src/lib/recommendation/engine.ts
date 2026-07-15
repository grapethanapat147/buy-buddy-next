import {
    type PlanSummary,
    type Product,
    type RecommendationItem,
    type Spec,
    type TriggerRule,
    tierPriority,
} from './types';

export function cheapestPrice(product: Pick<Product, 'prices' | 'refPrice'>): number {
    if (product.prices.length === 0) {
        return product.refPrice;
    }

    return Math.min(...product.prices.map((p) => p.price));
}

function specValue(spec: Spec, field: string): string | number {
    switch (field) {
        case 'budget':
            return spec.budget;
        case 'room_type':
            return spec.roomType;
        case 'room_size':
            return spec.roomSize;
        case 'occupants':
            return spec.occupants;
        case 'cooking':
            return spec.cooking;
        case 'laundry':
            return spec.laundry;
        case 'work_style':
            return spec.workStyle;
        case 'spending_style':
            return spec.spendingStyle;
        case 'has_kitchen_counter':
            return spec.hasKitchenCounter ? 'yes' : 'no';
        case 'has_wardrobe':
            return spec.hasWardrobe ? 'yes' : 'no';
        case 'has_dining_table':
            return spec.hasDiningTable ? 'yes' : 'no';
        case 'has_aircon':
            return spec.hasAircon ? 'yes' : 'no';
        default:
            return '';
    }
}

export function passesTriggers(triggers: TriggerRule[], spec: Spec): boolean {
    return triggers.every((rule) => {
        const actual = specValue(spec, rule.field);
        switch (rule.op) {
            case '=':
                return actual === rule.value;
            case '>=':
                return typeof rule.value === 'number' && typeof actual === 'number' && actual >= rule.value;
            case 'in':
                return Array.isArray(rule.value) && (rule.value as Array<string | number>).includes(actual);
            default:
                return false;
        }
    });
}

function toItem(product: Product, spec: Spec): RecommendationItem {
    const quantity = product.qtyScalesBy === 'occupants' ? spec.occupants : 1;

    return {
        productId: product.id,
        name: product.name,
        icon: product.icon,
        category: product.categoryName,
        tier: product.tier,
        quantity,
        lineTotal: cheapestPrice(product) * quantity,
        status: 'in_plan',
    };
}

function fitToBudget(items: RecommendationItem[], budget: number): RecommendationItem[] {
    const musts = items.filter((i) => i.tier === 'must');
    const rest = items.filter((i) => i.tier !== 'must');
    const mustTotal = musts.reduce((sum, i) => sum + i.lineTotal, 0);

    const fitted: RecommendationItem[] = musts.map((i) => ({ ...i, status: 'in_plan' }));

    if (mustTotal > budget) {
        return [...fitted, ...rest.map((i): RecommendationItem => ({ ...i, status: 'deferred' }))];
    }

    let running = mustTotal;
    for (const item of rest) {
        if (running + item.lineTotal <= budget) {
            running += item.lineTotal;
            fitted.push({ ...item, status: 'in_plan' });
        } else {
            fitted.push({ ...item, status: 'deferred' });
        }
    }

    return fitted;
}

/** Rule-based recommendation: filter by triggers + owned + spending style, scale, tier-sort, budget-fit. */
export function recommend(products: Product[], spec: Spec): RecommendationItem[] {
    const eligible = products.filter(
        (p) =>
            !spec.ownedProductIds.includes(p.id) &&
            passesTriggers(p.triggers, spec) &&
            !(spec.spendingStyle === 'essentials' && p.tier === 'optional'),
    );

    const items = eligible
        .map((p) => toItem(p, spec))
        .sort((a, b) => tierPriority[a.tier] - tierPriority[b.tier] || a.lineTotal - b.lineTotal);

    return fitToBudget(items, spec.budget);
}

/** Budget status for a user-chosen basket (which may exceed budget). */
export function summarizePlan(
    lines: Array<{ productId: number; tier: RecommendationItem['tier']; lineTotal: number }>,
    budget: number,
): PlanSummary {
    const total = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const overBudgetBy = Math.max(0, total - budget);
    const mustTotal = lines.filter((l) => l.tier === 'must').reduce((sum, l) => sum + l.lineTotal, 0);

    if (mustTotal > budget) {
        return { total, budget, overBudgetBy, mustExceedsBudget: true, suggestedDeferrals: [] };
    }

    const suggested: number[] = [];
    if (overBudgetBy > 0) {
        const candidates = lines
            .filter((l) => l.tier !== 'must')
            .sort((a, b) => tierPriority[b.tier] - tierPriority[a.tier] || b.lineTotal - a.lineTotal);

        let need = overBudgetBy;
        for (const line of candidates) {
            if (need <= 0) break;
            suggested.push(line.productId);
            need -= line.lineTotal;
        }
    }

    return { total, budget, overBudgetBy, mustExceedsBudget: false, suggestedDeferrals: suggested };
}

/** "Buy everything at store X" totals, cheapest fallback where a store lacks an item. */
export function storeRollup(
    lines: Array<{ product: Pick<Product, 'prices' | 'refPrice'>; qty: number }>,
): Array<{ platform: string; total: number }> {
    const platforms = new Set<string>();
    for (const { product } of lines) {
        for (const price of product.prices) platforms.add(price.platform);
    }

    return [...platforms]
        .map((platform) => ({
            platform,
            total: lines.reduce((sum, { product, qty }) => {
                const match = product.prices.find((p) => p.platform === platform);
                return sum + (match ? match.price : cheapestPrice(product)) * qty;
            }, 0),
        }))
        .sort((a, b) => a.total - b.total)
        .slice(0, 3);
}
