-- DTA Drafting Hub schema. Run this once in the Supabase SQL editor.
-- Access goes through the Next.js server using the service role. Row level
-- security is on and there are no public policies.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('owner', 'specialist');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.request_status as enum (
    'Pending Review',
    'Awaiting Payment',
    'Submitted',
    'In Progress',
    'Awaiting Your Review',
    'Revision Requested',
    'Approved',
    'Completed'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('Paid', 'Pending', 'Failed', 'Refunded');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.file_kind as enum ('client_upload', 'draft', 'revision', 'final');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.checkout_status as enum ('pending', 'paid');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'specialist',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default 'DTA Drafting Hub',
  primary_email text not null default '',
  phone text not null default '',
  address text not null default '',
  disclaimer text not null default ''
);

insert into public.settings (id, business_name, primary_email, phone, address, disclaimer)
values (
  1,
  'DTA Drafting Hub',
  '',
  '',
  '',
  'DTA Drafting Hub provides document drafting, review, and related support services. Services provided through this platform may vary by jurisdiction and service type. Submitting a request does not by itself establish a lawyer-client relationship. Where legal advice or representation is required, clients should consult a qualified legal professional licensed in the relevant jurisdiction.'
)
on conflict (id) do nothing;

create sequence if not exists public.request_number_seq start with 1000;

create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(),
  paypal_order_id text unique,
  status public.checkout_status not null default 'pending',
  service_slug text not null,
  service_title text not null,
  turnaround text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD',
  client jsonb not null,
  details jsonb not null,
  request_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  service_slug text not null,
  service_title text not null,
  status public.request_status not null default 'Submitted',
  client_name text not null,
  client_email text not null,
  phone text not null default '',
  company text not null default '',
  country text not null default '',
  region text not null default '',
  contact_method text not null default 'Email',
  details jsonb not null default '{}'::jsonb,
  amount_cents integer not null,
  currency text not null default 'USD',
  assignee_id uuid references public.profiles (id),
  internal_note text not null default '',
  turnaround text not null default '',
  paypal_order_id text,
  payment_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requests_email_idx on public.requests (client_email);
create index if not exists requests_created_idx on public.requests (created_at desc);
create unique index if not exists requests_paypal_order_id_idx
  on public.requests (paypal_order_id)
  where paypal_order_id is not null;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests (id) on delete cascade,
  checkout_id uuid references public.checkouts (id),
  paypal_order_id text not null,
  paypal_capture_id text unique,
  amount_cents integer not null,
  currency text not null default 'USD',
  status public.payment_status not null default 'Paid',
  method text not null default 'PayPal',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.revisions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  target_file_id uuid,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.requests (id) on delete cascade,
  checkout_id uuid references public.checkouts (id) on delete cascade,
  revision_id uuid references public.revisions (id) on delete cascade,
  kind public.file_kind not null,
  storage_path text not null,
  filename text not null,
  size_bytes integer not null,
  note text not null default '',
  author_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.revisions
  drop constraint if exists revisions_target_file_id_fkey;

alter table public.revisions
  add constraint revisions_target_file_id_fkey
  foreign key (target_file_id) references public.files (id) on delete set null;

create table if not exists public.activity (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.track_sessions (
  token text primary key,
  request_id uuid not null references public.requests (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.checkouts
  drop constraint if exists checkouts_request_id_fkey;

alter table public.checkouts
  add constraint checkouts_request_id_fkey
  foreign key (request_id) references public.requests (id);

create or replace function public.next_public_id()
returns text
language plpgsql
as $$
declare
  next_number bigint;
begin
  next_number := nextval('public.request_number_seq');
  return 'DTA-' || to_char(now(), 'YYYY') || '-' || lpad(next_number::text, 5, '0');
end;
$$;

create or replace function public.fulfill_checkout(
  p_paypal_order_id text,
  p_capture_id text
)
returns table (
  out_request_id uuid,
  out_public_id text,
  out_created boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  checkout public.checkouts%rowtype;
  new_request uuid;
  new_public text;
begin
  select * into checkout
  from public.checkouts
  where paypal_order_id = p_paypal_order_id
  for update;

  if not found then
    raise exception 'checkout_not_found';
  end if;

  if checkout.status = 'paid' and checkout.request_id is not null then
    select requests.public_id into new_public
    from public.requests
    where requests.id = checkout.request_id;

    return query
    select checkout.request_id, new_public, false;
    return;
  end if;

  new_public := public.next_public_id();

  insert into public.requests (
    public_id,
    service_slug,
    service_title,
    status,
    client_name,
    client_email,
    phone,
    company,
    country,
    region,
    contact_method,
    details,
    amount_cents,
    currency,
    turnaround
  )
  values (
    new_public,
    checkout.service_slug,
    checkout.service_title,
    'Submitted',
    coalesce(checkout.client->>'fullName', ''),
    lower(coalesce(checkout.client->>'email', '')),
    coalesce(checkout.client->>'phone', ''),
    coalesce(checkout.client->>'company', ''),
    coalesce(checkout.client->>'country', ''),
    coalesce(checkout.client->>'region', ''),
    coalesce(checkout.client->>'contactMethod', 'Email'),
    checkout.details,
    checkout.amount_cents,
    'USD',
    checkout.turnaround
  )
  returning id into new_request;

  insert into public.payments (
    request_id,
    checkout_id,
    paypal_order_id,
    paypal_capture_id,
    amount_cents,
    currency,
    status,
    method,
    paid_at
  )
  values (
    new_request,
    checkout.id,
    p_paypal_order_id,
    p_capture_id,
    checkout.amount_cents,
    'USD',
    'Paid',
    'PayPal',
    now()
  );

  update public.files
  set request_id = new_request
  where checkout_id = checkout.id;

  update public.checkouts
  set status = 'paid', request_id = new_request
  where id = checkout.id;

  insert into public.activity (request_id, message)
  values (new_request, 'Payment confirmed and request submitted.');

  return query
  select new_request, new_public, true;
end;
$$;

revoke all on function public.fulfill_checkout(text, text) from public, anon, authenticated;
revoke all on function public.next_public_id() from public, anon, authenticated;
grant execute on function public.next_public_id() to service_role;
grant execute on function public.fulfill_checkout(text, text) to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'staff'), '@', 1)),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.settings enable row level security;
alter table public.checkouts enable row level security;
alter table public.requests enable row level security;
alter table public.payments enable row level security;
alter table public.files enable row level security;
alter table public.revisions enable row level security;
alter table public.activity enable row level security;
alter table public.track_sessions enable row level security;

insert into storage.buckets (id, name, public, file_size_limit)
values ('request-files', 'request-files', false, 10485760)
on conflict (id) do update
set public = false,
    file_size_limit = 10485760;
