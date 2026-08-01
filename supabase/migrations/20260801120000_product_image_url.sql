-- Optional real product photo. When null, the UI falls back to the emoji icon.
alter table products add column if not exists image_url text;
