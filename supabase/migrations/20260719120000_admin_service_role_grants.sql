-- The admin panel writes marketplace prices/links with the service_role key.
-- service_role bypasses RLS, but Postgres table GRANTs are separate from RLS and
-- the initial migration only granted SELECT to anon/authenticated — so admin
-- writes failed with 42501 (permission denied). Grant service_role what it needs.
-- GRANT is idempotent, so this is safe to re-run.
grant select, insert, update, delete on public.product_prices to service_role;
