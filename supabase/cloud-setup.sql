-- BuyBuddy cloud setup — paste this whole file into Supabase SQL Editor and Run.
-- Combines: 20260710120000_init.sql + 20260710120100_seed_demo_catalog.sql

-- ============ SCHEMA ============
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

-- ============ DEMO DATA ============
-- BuyBuddy starter catalog

insert into public.categories (name, slug, sort_order, icon) values
  ('ครัว', 'kitchen', 1, '🍳'),
  ('เครื่องนอน', 'bedroom', 2, '🛏️'),
  ('ห้องน้ำ', 'bathroom', 3, '🚿'),
  ('ทำความสะอาด', 'cleaning', 4, '🧹'),
  ('ของกินตุน', 'pantry', 5, '🥫'),
  ('ทำงาน', 'work', 6, '💼');

insert into public.products (category_id, name, slug, tier, mode, ref_price, restock_cadence, qty_scales_by, triggers, icon) values
  ((select id from public.categories where slug='kitchen'), 'หม้อหุงข้าว 1.8 ลิตร', 'rice-cooker', 'must', 'move_in', 590, null, null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🍚'),
  ((select id from public.categories where slug='kitchen'), 'ข้าวสาร 5 กก.', 'rice-5kg', 'recommended', 'restock', 180, 'monthly', null, '[]', '🌾'),
  ((select id from public.categories where slug='kitchen'), 'ทัพพีตักข้าว', 'rice-spoon', 'optional', 'move_in', 45, null, null, '[]', '🥄'),
  ((select id from public.categories where slug='kitchen'), 'กระทะ + ตะหลิว', 'frying-pan', 'must', 'move_in', 250, null, null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🍳'),
  ((select id from public.categories where slug='kitchen'), 'ตู้เย็นเล็ก 3.2 คิว', 'mini-fridge', 'must', 'move_in', 3990, null, null, '[]', '🧊'),
  ((select id from public.categories where slug='kitchen'), 'กาต้มน้ำไฟฟ้า', 'kettle', 'recommended', 'move_in', 350, null, null, '[]', '🫖'),
  ((select id from public.categories where slug='kitchen'), 'จานชาม เซ็ต 4', 'plates', 'optional', 'move_in', 180, null, null, '[]', '🍽️'),
  ((select id from public.categories where slug='kitchen'), 'แก้วน้ำ 6 ใบ', 'glasses', 'optional', 'move_in', 120, null, null, '[]', '🥤'),
  ((select id from public.categories where slug='kitchen'), 'ไมโครเวฟ 20 ลิตร', 'microwave', 'optional', 'move_in', 1790, null, null, '[]', '🍲'),
  ((select id from public.categories where slug='bedroom'), 'ที่นอน 3.5 ฟุต', 'mattress-3-5ft', 'must', 'move_in', 1890, null, null, '[]', '🛏️'),
  ((select id from public.categories where slug='bedroom'), 'พัดลมตั้งพื้น', 'stand-fan', 'must', 'move_in', 690, null, null, '[]', '🌀'),
  ((select id from public.categories where slug='bedroom'), 'หมอน + ผ้าปูที่นอน', 'bedding-set', 'recommended', 'move_in', 490, null, null, '[]', '🛌'),
  ((select id from public.categories where slug='bedroom'), 'ราวแขวนผ้า', 'clothes-rack', 'optional', 'move_in', 350, null, null, '[]', '🧥'),
  ((select id from public.categories where slug='bathroom'), 'ของใช้ห้องน้ำชุดเริ่มต้น', 'toiletries-set', 'must', 'move_in', 250, null, null, '[]', '🧴'),
  ((select id from public.categories where slug='bathroom'), 'ผ้าเช็ดตัว 2 ผืน', 'towels', 'recommended', 'move_in', 180, null, null, '[]', '🧻'),
  ((select id from public.categories where slug='bathroom'), 'ที่ตากผ้าราว', 'drying-rack', 'optional', 'move_in', 250, null, null, '[]', '🧺'),
  ((select id from public.categories where slug='cleaning'), 'ผงซักฟอก', 'detergent', 'must', 'restock', 60, 'weekly', 'occupants', '[]', '🧼'),
  ((select id from public.categories where slug='cleaning'), 'น้ำยาล้างจาน', 'dish-soap', 'must', 'restock', 45, 'monthly', null, '[]', '🧽'),
  ((select id from public.categories where slug='cleaning'), 'ถังขยะมีฝา', 'trash-bin', 'must', 'move_in', 120, null, null, '[]', '🗑️'),
  ((select id from public.categories where slug='cleaning'), 'ไม้กวาด + ที่โกยผง', 'broom-set', 'recommended', 'move_in', 150, null, null, '[]', '🧹'),
  ((select id from public.categories where slug='cleaning'), 'ผ้าเช็ดทำความสะอาด', 'cleaning-cloth', 'optional', 'restock', 40, 'monthly', null, '[]', '🧽'),
  ((select id from public.categories where slug='pantry'), 'น้ำมันพืช', 'cooking-oil', 'recommended', 'restock', 60, 'monthly', null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🛢️'),
  ((select id from public.categories where slug='pantry'), 'เครื่องปรุงชุดเริ่มต้น', 'seasoning-set', 'optional', 'move_in', 150, null, null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🧂'),
  ((select id from public.categories where slug='pantry'), 'บะหมี่กึ่งสำเร็จรูป (แพ็ค)', 'instant-noodles', 'optional', 'restock', 90, 'weekly', null, '[]', '🍜'),
  ((select id from public.categories where slug='work'), 'โคมไฟตั้งโต๊ะ', 'desk-lamp', 'recommended', 'move_in', 290, null, null, '[{"field":"work_style","op":"in","value":["home","hybrid"]}]', '💡'),
  ((select id from public.categories where slug='work'), 'ราวตากผ้าในห้อง', 'laundry-rack', 'recommended', 'move_in', 350, null, null, '[{"field":"laundry","op":"in","value":["hand","service"]}]', '🧺');

-- Reference prices across the main marketplaces, with a small per-product
-- jitter so the cheapest store varies realistically from item to item.
insert into public.product_prices (product_id, platform, price)
select
    p.id,
    x.platform,
    greatest(1, round(p.ref_price * (x.mult + (((p.id * x.seed) % 7) - 3) * 0.012))::int)
from public.products p
cross join (values
    ('Shopee', 1.00, 3),
    ('Lazada', 1.03, 5),
    ('TikTok Shop', 0.98, 7),
    ('Official Store', 1.08, 2)
) as x(platform, mult, seed);

insert into public.product_pairings (product_id, paired_product_id) values
  ((select id from public.products where slug='rice-cooker'), (select id from public.products where slug='rice-5kg')),
  ((select id from public.products where slug='rice-cooker'), (select id from public.products where slug='rice-spoon')),
  ((select id from public.products where slug='mattress-3-5ft'), (select id from public.products where slug='bedding-set')),
  ((select id from public.products where slug='toiletries-set'), (select id from public.products where slug='towels'));
