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
    occupants: number;
    cooking: string;
    laundry: string;
    workStyle: string;
    spendingStyle: string;
    ownedProductIds: number[];
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
