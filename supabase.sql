-- =========================================================
-- BIZNEST PROFESSIONAL - COMPLETE DATABASE SETUP
-- Run this whole file in Supabase SQL Editor
-- =========================================================
create extension if not exists pgcrypto;

create table if not exists public.businesses(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 slug text not null unique,
 tagline text,
 phone text,
 address text,
 logo_url text,
 created_at timestamptz default now()
);

create table if not exists public.products(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 name text not null,
 description text,
 price numeric default 0,
 image_url text,
 active boolean not null default true,
 created_at timestamptz default now()
);

create table if not exists public.services(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 name text not null,
 description text,
 price numeric default 0,
 active boolean not null default true,
 created_at timestamptz default now()
);

create table if not exists public.requests(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.businesses(id) on delete cascade,
 customer_id uuid references auth.users(id) on delete set null,
 type text not null check(type in ('order','booking')),
 item_name text not null,
 customer_name text not null,
 customer_phone text,
 note text,
 status text not null default 'pending',
 created_at timestamptz default now()
);

alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.services enable row level security;
alter table public.requests enable row level security;

drop policy if exists business_public_read on public.businesses;
drop policy if exists business_owner_all on public.businesses;
drop policy if exists products_public_read on public.products;
drop policy if exists products_owner_all on public.products;
drop policy if exists services_public_read on public.services;
drop policy if exists services_owner_all on public.services;
drop policy if exists requests_customer_insert on public.requests;
drop policy if exists requests_customer_read on public.requests;
drop policy if exists requests_owner_read on public.requests;
drop policy if exists requests_owner_update on public.requests;

create policy business_public_read on public.businesses for select using(true);
create policy business_owner_all on public.businesses for all to authenticated
using(owner_id=auth.uid()) with check(owner_id=auth.uid());

create policy products_public_read on public.products for select using(true);
create policy products_owner_all on public.products for all to authenticated
using(exists(select 1 from public.businesses b where b.id=products.business_id and b.owner_id=auth.uid()))
with check(exists(select 1 from public.businesses b where b.id=products.business_id and b.owner_id=auth.uid()));

create policy services_public_read on public.services for select using(true);
create policy services_owner_all on public.services for all to authenticated
using(exists(select 1 from public.businesses b where b.id=services.business_id and b.owner_id=auth.uid()))
with check(exists(select 1 from public.businesses b where b.id=services.business_id and b.owner_id=auth.uid()));

create policy requests_customer_insert on public.requests for insert to authenticated
with check(customer_id=auth.uid());

create policy requests_customer_read on public.requests for select to authenticated
using(customer_id=auth.uid());

create policy requests_owner_read on public.requests for select to authenticated
using(exists(select 1 from public.businesses b where b.id=requests.business_id and b.owner_id=auth.uid()));

create policy requests_owner_update on public.requests for update to authenticated
using(exists(select 1 from public.businesses b where b.id=requests.business_id and b.owner_id=auth.uid()))
with check(exists(select 1 from public.businesses b where b.id=requests.business_id and b.owner_id=auth.uid()));

-- DONE
