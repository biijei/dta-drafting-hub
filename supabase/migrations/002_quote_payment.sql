-- Run this after 001_init.sql if that migration is already applied.
-- New requests are saved before payment. An owner sets the price later.

alter type public.request_status add value if not exists 'Pending Review';
alter type public.request_status add value if not exists 'Awaiting Payment';

alter table public.requests
  add column if not exists paypal_order_id text,
  add column if not exists payment_url text;

create unique index if not exists requests_paypal_order_id_idx
  on public.requests (paypal_order_id)
  where paypal_order_id is not null;

grant execute on function public.next_public_id() to service_role;
