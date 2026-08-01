-- The admin panel now writes products.image_url with the service_role key.
-- service_role bypasses RLS but needs an explicit table GRANT (same reason as
-- product_prices in 20260719120000). GRANT is idempotent, safe to re-run.
grant select, update on public.products to service_role;
