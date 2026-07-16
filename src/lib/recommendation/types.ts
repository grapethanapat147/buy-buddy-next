export type ProductTier = 'must' | 'recommended' | 'optional';
export type ProductMode = 'move_in' | 'restock';

export const tierPriority: Record<ProductTier, number> = {
    must: 0,
    recommended: 1,
    optional: 2,
};

export const tierLabel: Record<ProductTier, string> = {
    must: 'จำเป็น',
    recommended: 'แนะนำ',
    optional: 'ถ้ามีงบ',
};

export interface TriggerRule {
    field: string;
    op: '=' | '>=' | 'in';
    value: string | number | Array<string | number>;
}

export interface ProductPrice {
    platform: string;
    price: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    icon: string;
    categoryName: string;
    tier: ProductTier;
    mode: ProductMode;
    refPrice: number;
    restockCadence: string | null;
    qtyScalesBy: string | null;
    triggers: TriggerRule[];
    prices: ProductPrice[];
}

export interface Spec {
    budget: number;
    roomType: string;
    /** 'small' (<25 ตร.ม.) | 'medium' (25–35) | 'large' (>35) */
    roomSize: string;
    occupants: number;
    cooking: string;
    laundry: string;
    workStyle: string;
    spendingStyle: string;
    /** Fixtures the room already has — when false, we recommend buying one. */
    hasKitchenCounter: boolean;
    hasWardrobe: boolean;
    hasDiningTable: boolean;
    hasAircon: boolean;
    ownedProductIds: number[];
}

export const defaultSpec: Spec = {
    budget: 5000,
    roomType: 'studio',
    roomSize: 'small',
    occupants: 1,
    cooking: 'sometimes',
    laundry: 'own_machine',
    workStyle: 'office',
    spendingStyle: 'balanced',
    hasKitchenCounter: false,
    hasWardrobe: false,
    hasDiningTable: false,
    hasAircon: false,
    ownedProductIds: [],
};

/** Fill in any field an older stored spec cookie is missing. */
export function normalizeSpec(raw: Partial<Spec> | null | undefined): Spec {
    const merged = { ...defaultSpec, ...(raw ?? {}) };

    // recommend() calls .includes() on this, so a malformed cookie must not get through.
    merged.ownedProductIds = Array.isArray(merged.ownedProductIds)
        ? merged.ownedProductIds.map(Number).filter((id) => Number.isInteger(id) && id > 0)
        : [];

    return merged;
}

export interface RecommendationItem {
    productId: number;
    name: string;
    icon: string;
    category: string;
    tier: ProductTier;
    quantity: number;
    lineTotal: number;
    status: 'in_plan' | 'deferred';
}

export interface PlanSummary {
    total: number;
    budget: number;
    overBudgetBy: number;
    mustExceedsBudget: boolean;
    suggestedDeferrals: number[];
}
