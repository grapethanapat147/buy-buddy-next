-- Feedback: sizes/counts hardcoded in product names made a single-person plan
-- read like a family's ("จานชาม เซ็ต 4", "แก้วน้ำ 6 ใบ") and asserted specific
-- dimensions that don't match reality ("ที่นอน 3.5 ฟุต" — dorm beds start at 5ft;
-- "ตู้เย็น 3.2 คิว" reads hotel-ish). Strip the numeric size/count from names so
-- each item is a neutral pick. Type/shape/material variety (dining table shapes,
-- wardrobe materials) and compound tool names (กระทะ + ตะหลิว) are kept on purpose.
-- Idempotent: plain UPDATEs by slug, safe to re-run.

update public.products set name = 'หม้อหุงข้าว'        where slug = 'rice-cooker';
update public.products set name = 'ข้าวสาร'            where slug = 'rice-5kg';
update public.products set name = 'ตู้เย็น'            where slug = 'mini-fridge';
update public.products set name = 'จานชาม'            where slug = 'plates';
update public.products set name = 'แก้วน้ำ'            where slug = 'glasses';
update public.products set name = 'ไมโครเวฟ'          where slug = 'microwave';
update public.products set name = 'ที่นอน'            where slug = 'mattress-3-5ft';
update public.products set name = 'ผ้าเช็ดตัว'         where slug = 'towels';
update public.products set name = 'บะหมี่กึ่งสำเร็จรูป'  where slug = 'instant-noodles';
update public.products set name = 'ถุงขยะ'            where slug = 'trash-bags';
update public.products set name = 'เก้าอี้กินข้าว'      where slug = 'dining-chairs';
update public.products set name = 'ตู้เสื้อผ้าแบบผ้า'   where slug = 'fabric-wardrobe';
update public.products set name = 'ตู้เสื้อผ้าไม้'      where slug = 'wood-wardrobe';
update public.products set name = 'ชั้นวางของครัว'     where slug = 'kitchen-shelf';
update public.products set name = 'ชั้นวางของแนวตั้ง'   where slug = 'tall-shelf';
update public.products set name = 'โซฟาเบด'           where slug = 'sofa-bed';
update public.products set name = 'กล่องถนอมอาหาร'    where slug = 'food-containers';
update public.products set name = 'ปลอกหมอน'          where slug = 'pillowcases';
update public.products set name = 'ปลั๊กพ่วง'          where slug = 'power-strip';
update public.products set name = 'น้ำดื่ม'           where slug = 'drinking-water';
update public.products set name = 'เก้าอี้ทำงาน'       where slug = 'work-chair';
