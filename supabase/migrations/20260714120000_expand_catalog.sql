-- Expand the catalog: more products + more variety per need, and wire the new
-- wizard signals (room_size, has_kitchen_counter, has_wardrobe, has_dining_table,
-- has_aircon) into product triggers.

insert into public.categories (name, slug, sort_order, icon) values
  ('เฟอร์นิเจอร์', 'furniture', 7, '🪑')
on conflict (slug) do nothing;

insert into public.products (category_id, name, slug, tier, mode, ref_price, restock_cadence, qty_scales_by, triggers, icon) values
  -- ── ทำความสะอาด: ซักผ้า/ทำความสะอาดแบบมีตัวเลือก ──
  ((select id from public.categories where slug='cleaning'), 'น้ำยาซักผ้า', 'liquid-detergent', 'recommended', 'restock', 120, 'monthly', null, '[{"field":"laundry","op":"in","value":["own_machine","hand"]}]', '🧴'),
  ((select id from public.categories where slug='cleaning'), 'น้ำยาปรับผ้านุ่ม', 'fabric-softener', 'optional', 'restock', 95, 'monthly', null, '[{"field":"laundry","op":"in","value":["own_machine","hand"]}]', '🌸'),
  ((select id from public.categories where slug='cleaning'), 'น้ำยาถูพื้น', 'floor-cleaner', 'recommended', 'restock', 75, 'monthly', null, '[]', '🧪'),
  ((select id from public.categories where slug='cleaning'), 'น้ำยาล้างห้องน้ำ', 'toilet-cleaner', 'recommended', 'restock', 65, 'monthly', null, '[]', '🚽'),
  ((select id from public.categories where slug='cleaning'), 'ถุงขยะ (แพ็ค)', 'trash-bags', 'must', 'restock', 45, 'monthly', null, '[]', '🗑️'),
  ((select id from public.categories where slug='cleaning'), 'ไม้ถูพื้น + ถังบิด', 'mop-bucket', 'recommended', 'move_in', 390, null, null, '[]', '🧹'),
  ((select id from public.categories where slug='cleaning'), 'น้ำยาเช็ดกระจก', 'glass-cleaner', 'optional', 'restock', 55, 'monthly', null, '[]', '🪟'),

  -- ── เฟอร์นิเจอร์: โต๊ะกินข้าวหลายทรง (เลือกที่ชอบ) ──
  ((select id from public.categories where slug='furniture'), 'โต๊ะกินข้าวทรงเหลี่ยม', 'dining-table-square', 'recommended', 'move_in', 1490, null, null, '[{"field":"has_dining_table","op":"=","value":"no"}]', '🍽️'),
  ((select id from public.categories where slug='furniture'), 'โต๊ะกินข้าวทรงกลม', 'dining-table-round', 'optional', 'move_in', 1690, null, null, '[{"field":"has_dining_table","op":"=","value":"no"}]', '⭕'),
  ((select id from public.categories where slug='furniture'), 'โต๊ะกินข้าวทรงขอบมน', 'dining-table-rounded', 'optional', 'move_in', 1890, null, null, '[{"field":"has_dining_table","op":"=","value":"no"}]', '🟫'),
  ((select id from public.categories where slug='furniture'), 'เก้าอี้กินข้าว 2 ตัว', 'dining-chairs', 'recommended', 'move_in', 890, null, null, '[{"field":"has_dining_table","op":"=","value":"no"}]', '🪑'),

  -- ── เฟอร์นิเจอร์: ตู้เสื้อผ้า / ชั้นวาง ──
  ((select id from public.categories where slug='furniture'), 'ตู้เสื้อผ้าผ้า 2 ชั้น', 'fabric-wardrobe', 'must', 'move_in', 690, null, null, '[{"field":"has_wardrobe","op":"=","value":"no"}]', '👕'),
  ((select id from public.categories where slug='furniture'), 'ตู้เสื้อผ้าไม้ 2 บาน', 'wood-wardrobe', 'optional', 'move_in', 3290, null, null, '[{"field":"has_wardrobe","op":"=","value":"no"}]', '🚪'),
  ((select id from public.categories where slug='furniture'), 'ชั้นวางของครัว 3 ชั้น', 'kitchen-shelf', 'recommended', 'move_in', 790, null, null, '[{"field":"has_kitchen_counter","op":"=","value":"no"}]', '🗄️'),

  -- ── เฟอร์นิเจอร์: ตามขนาดห้อง ──
  ((select id from public.categories where slug='furniture'), 'ชั้นวางของแนวตั้ง 4 ชั้น', 'tall-shelf', 'recommended', 'move_in', 890, null, null, '[{"field":"room_size","op":"=","value":"small"}]', '📚'),
  ((select id from public.categories where slug='furniture'), 'ที่แขวนของหลังประตู', 'door-hanger', 'optional', 'move_in', 190, null, null, '[{"field":"room_size","op":"=","value":"small"}]', '🪝'),
  ((select id from public.categories where slug='furniture'), 'โซฟาเบด 2 ที่นั่ง', 'sofa-bed', 'optional', 'move_in', 4990, null, null, '[{"field":"room_size","op":"in","value":["medium","large"]}]', '🛋️'),
  ((select id from public.categories where slug='furniture'), 'พรมปูพื้น', 'rug', 'optional', 'move_in', 690, null, null, '[{"field":"room_size","op":"in","value":["medium","large"]}]', '🟦'),

  -- ── ครัว: เพิ่มตัวเลือก ──
  ((select id from public.categories where slug='kitchen'), 'เตาแม่เหล็กไฟฟ้า', 'induction-cooker', 'recommended', 'move_in', 990, null, null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🔥'),
  ((select id from public.categories where slug='kitchen'), 'ที่คว่ำจาน', 'dish-rack', 'recommended', 'move_in', 290, null, null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🍶'),
  ((select id from public.categories where slug='kitchen'), 'มีดทำครัว + เขียง', 'knife-board', 'recommended', 'move_in', 250, null, null, '[{"field":"cooking","op":"in","value":["sometimes","often"]}]', '🔪'),
  ((select id from public.categories where slug='kitchen'), 'กล่องถนอมอาหาร เซ็ต 3', 'food-containers', 'optional', 'move_in', 180, null, null, '[]', '🥡'),

  -- ── เครื่องนอน ──
  ((select id from public.categories where slug='bedroom'), 'ผ้าห่มนวม', 'blanket', 'recommended', 'move_in', 590, null, 'occupants', '[]', '🛌'),
  ((select id from public.categories where slug='bedroom'), 'ปลอกหมอน 2 ใบ', 'pillowcases', 'optional', 'move_in', 120, null, null, '[]', '💤'),
  ((select id from public.categories where slug='bedroom'), 'ผ้าม่านกันแสง', 'blackout-curtain', 'recommended', 'move_in', 490, null, null, '[]', '🪟'),
  ((select id from public.categories where slug='bedroom'), 'พัดลมไอเย็น', 'air-cooler', 'optional', 'move_in', 2490, null, null, '[{"field":"has_aircon","op":"=","value":"no"}]', '💨'),

  -- ── ห้องน้ำ ──
  ((select id from public.categories where slug='bathroom'), 'พรมเช็ดเท้า', 'bath-mat', 'recommended', 'move_in', 150, null, null, '[]', '🧼'),
  ((select id from public.categories where slug='bathroom'), 'ชั้นวางของห้องน้ำ', 'bathroom-shelf', 'optional', 'move_in', 350, null, null, '[]', '🧺'),
  ((select id from public.categories where slug='bathroom'), 'ที่แขวนผ้าเช็ดตัว', 'towel-rack', 'optional', 'move_in', 190, null, null, '[]', '🪝'),

  -- ── ทำงาน ──
  ((select id from public.categories where slug='work'), 'โต๊ะทำงาน', 'work-desk', 'recommended', 'move_in', 1290, null, null, '[{"field":"work_style","op":"in","value":["home","hybrid"]}]', '🪑'),
  ((select id from public.categories where slug='work'), 'เก้าอี้ทำงานมีพนักพิง', 'work-chair', 'recommended', 'move_in', 1590, null, null, '[{"field":"work_style","op":"in","value":["home","hybrid"]}]', '💺'),
  ((select id from public.categories where slug='work'), 'ปลั๊กพ่วง 4 ช่อง', 'power-strip', 'must', 'move_in', 250, null, null, '[]', '🔌'),

  -- ── ของกินตุน ──
  ((select id from public.categories where slug='pantry'), 'น้ำดื่ม 6 ขวด', 'drinking-water', 'must', 'restock', 60, 'weekly', 'occupants', '[]', '💧'),
  ((select id from public.categories where slug='pantry'), 'ชา/กาแฟ ชุดเริ่มต้น', 'coffee-tea', 'optional', 'restock', 150, 'monthly', null, '[]', '☕')
on conflict (slug) do nothing;

-- Marketplace prices for every product that doesn't have them yet (same jitter
-- formula as the starter catalog, so the cheapest store still varies per item).
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
where not exists (
    select 1 from public.product_prices pp where pp.product_id = p.id
);

-- Smart Bundle pairings for the new items
insert into public.product_pairings (product_id, paired_product_id) values
  ((select id from public.products where slug='liquid-detergent'), (select id from public.products where slug='fabric-softener')),
  ((select id from public.products where slug='mop-bucket'), (select id from public.products where slug='floor-cleaner')),
  ((select id from public.products where slug='dining-table-square'), (select id from public.products where slug='dining-chairs')),
  ((select id from public.products where slug='dining-table-round'), (select id from public.products where slug='dining-chairs')),
  ((select id from public.products where slug='induction-cooker'), (select id from public.products where slug='frying-pan')),
  ((select id from public.products where slug='work-desk'), (select id from public.products where slug='work-chair')),
  ((select id from public.products where slug='trash-bin'), (select id from public.products where slug='trash-bags')),
  ((select id from public.products where slug='fabric-wardrobe'), (select id from public.products where slug='clothes-rack'))
on conflict do nothing;
