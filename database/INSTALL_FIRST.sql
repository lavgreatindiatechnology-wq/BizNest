create extension if not exists pgcrypto;
create table if not exists public.businesses(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,name text not null,slug text not null unique,tagline text,phone text,email text,address text,created_at timestamptz default now());
create table if not exists public.products(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,name text not null,description text,price numeric default 0,image_url text,active boolean default true,created_at timestamptz default now());
create table if not exists public.services(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,name text not null,description text,price numeric default 0,active boolean default true,created_at timestamptz default now());
create table if not exists public.requests(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,customer_id uuid references auth.users(id),type text default 'general',item_name text,customer_name text,customer_phone text,note text,status text default 'new',created_at timestamptz default now());
alter table public.businesses enable row level security;alter table public.products enable row level security;alter table public.services enable row level security;alter table public.requests enable row level security;
drop policy if exists b_public on public.businesses;create policy b_public on public.businesses for select using(true);
drop policy if exists p_public on public.products;create policy p_public on public.products for select using(active=true);
drop policy if exists s_public on public.services;create policy s_public on public.services for select using(active=true);
drop policy if exists b_owner on public.businesses;create policy b_owner on public.businesses for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists p_owner on public.products;create policy p_owner on public.products for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists s_owner on public.services;create policy s_owner on public.services for all to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
drop policy if exists r_insert on public.requests;create policy r_insert on public.requests for insert to authenticated with check(customer_id=auth.uid());
drop policy if exists r_customer on public.requests;create policy r_customer on public.requests for select to authenticated using(customer_id=auth.uid());
drop policy if exists r_owner on public.requests;create policy r_owner on public.requests for select to authenticated using(exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

-- Admin profiles
create table if not exists public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
for select to authenticated using(id=auth.uid());

-- IMPORTANT: create your first admin manually in SQL after registering:
-- insert into public.profiles(id,role)
-- values ('YOUR_AUTH_USER_UUID','admin')
-- on conflict (id) do update set role='admin';
