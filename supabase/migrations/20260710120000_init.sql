-- BuyBuddy schema (ported from the Laravel version)

create table public.categories (
    id bigint generated always as identity primary key,
    name text not null,
    slug text not null unique,
    sort_order int not null default 0,
    icon text not null default '📦',
    created_at timestamptz not null default now()
);

create table public.products (
    id bigint generated always as identity primary key,
    category_id bigint not null references public.categories(id) on delete cascade,
    name text not null,
    slug text not null unique,
    tier text not null check (tier in ('must', 'recommended', 'optional')),
    mode text not null check (mode in ('move_in', 'restock')),
    ref_price int not null,
    restock_cadence text,
    qty_scales_by text,
    triggers jsonb not null default '[]'::jsonb,
    icon text not null default '📦',
    created_at timestamptz not null default now()
);
create index products_category_id_idx on public.products (category_id);

create table public.product_prices (
    id bigint generated always as identity primary key,
    product_id bigint not null references public.products(id) on delete cascade,
    platform text not null,
    price int not null,
    url text
);
create index product_prices_product_id_idx on public.product_prices (product_id);

create table public.product_pairings (
    product_id bigint not null references public.products(id) on delete cascade,
    paired_product_id bigint not null references public.products(id) on delete cascade,
    primary key (product_id, paired_product_id)
);

create table public.plans (
    id bigint generated always as identity primary key,
    user_id uuid not null references auth.users(id) on delete cascade unique,
    spec jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.plan_products (
    plan_id bigint not null references public.plans(id) on delete cascade,
    product_id bigint not null references public.products(id) on delete cascade,
    primary key (plan_id, product_id)
);

-- Row Level Security
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_prices enable row level security;
alter table public.product_pairings enable row level security;
alter table public.plans enable row level security;
alter table public.plan_products enable row level security;

-- Catalog is public-readable (anon key)
create policy "catalog_read" on public.categories for select using (true);
create policy "catalog_read" on public.products for select using (true);
create policy "catalog_read" on public.product_prices for select using (true);
create policy "catalog_read" on public.product_pairings for select using (true);

-- Saved plans belong to their owner
create policy "own_plans" on public.plans for all
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_plan_products" on public.plan_products for all
    using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
    with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

-- Table privileges (RLS policies still gate rows; roles also need the grant)
grant select on public.categories to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.product_prices to anon, authenticated;
grant select on public.product_pairings to anon, authenticated;
grant select, insert, update, delete on public.plans to authenticated;
grant select, insert, update, delete on public.plan_products to authenticated;
