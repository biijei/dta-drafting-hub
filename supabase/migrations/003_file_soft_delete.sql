-- Owner deletes hide a draft from the admin panel. The row and storage stay
-- until purgeExpiredFiles removes them 60 days later.

alter table public.files
  add column if not exists deleted_at timestamptz;
