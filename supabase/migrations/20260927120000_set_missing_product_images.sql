-- The last two products still on the emoji fallback now have bundled photos
-- (/public/products/dining-table-rounded.png, /public/products/induction-cooker.png).
-- Idempotent. On cloud, run it only AFTER the deploy carrying the PNGs is live,
-- otherwise the app points at files that don't exist yet and shows broken images.
update products set image_url = '/products/' || slug || '.png'
where slug in ('dining-table-rounded', 'induction-cooker');
