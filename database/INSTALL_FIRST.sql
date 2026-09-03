create extension if not exists pgcrypto;

create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,name text,role text not null default 'owner' check(role in ('owner','customer','admin')),created_at timestamptz default now());
create table if not exists public.businesses(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id) on delete cascade,name text not null,slug text not null unique,tagline text,phone text,email text,address text,created_at timestamptz default now());
create table if not exists public.products(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,name text not null,description text,price numeric default 0,image_url text,active boolean default true,created_at timestamptz default now());
create table if not exists public.services(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,name text not null,description text,price numeric default 0,active boolean default true,created_at timestamptz default now());
create table if not exists public.requests(id uuid primary key default gen_random_uuid(),business_id uuid not null references public.businesses(id) on delete cascade,customer_id uuid references auth.users(id) on delete set null,type text default 'general',item_name text,customer_name text,customer_phone text,note text,status text default 'new',created_at timestamptz default now());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,name,role) values(new.id,coalesce(new.raw_user_meta_data->>'name',''),'owner') on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;

alter table public.profiles enable row level security;alter table public.businesses enable row level security;alter table public.products enable row level security;alter table public.services enable row level security;alter table public.requests enable row level security;

drop policy if exists profiles_select on public.profiles;drop policy if exists business_public on public.businesses;drop policy if exists business_owner on public.businesses;drop policy if exists product_public on public.products;drop policy if exists product_owner on public.products;drop policy if exists service_public on public.services;drop policy if exists service_owner on public.services;drop policy if exists request_insert on public.requests;drop policy if exists request_customer on public.requests;drop policy if exists request_owner on public.requests;
create policy profiles_select on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy business_public on public.businesses for select using(true);
create policy business_owner on public.businesses for all to authenticated using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());
create policy product_public on public.products for select using(active=true or public.is_admin());
create policy product_owner on public.products for all to authenticated using(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy service_public on public.services for select using(active=true or public.is_admin());
create policy service_owner on public.services for all to authenticated using(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid())) with check(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));
create policy request_insert on public.requests for insert to authenticated with check(customer_id=auth.uid());
create policy request_customer on public.requests for select to authenticated using(customer_id=auth.uid());
create policy request_owner on public.requests for select to authenticated using(public.is_admin() or exists(select 1 from public.businesses b where b.id=business_id and b.owner_id=auth.uid()));

-- ADMIN SETUP AFTER REGISTERING THE ADMIN ACCOUNT:
-- update public.profiles set role='admin' where id='YOUR-AUTH-USER-UUID';
