-- BuyBuddy starter catalog

insert into public.categories (name, slug, sort_order, icon) values
  ('ครัว', 'kitchen', 1, '🍳'),
  ('เครื่องนอน', 'bedroom', 2, '🛏️'),
  ('ห้องน้ำ', 'bathroom', 3, '🚿'),
  ('ทำความสะอาด', 'cleaning', 4, '🧹'),
  ('ของกินตุน', 'pantry', 5, '🥫'),
  ('ทำงาน', 'work', 6, '💼')
on conflict (slug) do nothing;

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
  ((select id from public.categories where slug='work'), 'ราวตากผ้าในห้อง', 'laundry-rack', 'recommended', 'move_in', 350, null, null, '[{"field":"laundry","op":"in","value":["hand","service"]}]', '🧺')
on conflict (slug) do nothing;

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
) as x(platform, mult, seed)
where not exists (select 1 from public.product_prices pp where pp.product_id = p.id);

insert into public.product_pairings (product_id, paired_product_id) values
  ((select id from public.products where slug='rice-cooker'), (select id from public.products where slug='rice-5kg')),
  ((select id from public.products where slug='rice-cooker'), (select id from public.products where slug='rice-spoon')),
  ((select id from public.products where slug='mattress-3-5ft'), (select id from public.products where slug='bedding-set')),
  ((select id from public.products where slug='toiletries-set'), (select id from public.products where slug='towels'))
on conflict do nothing;
