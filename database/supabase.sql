-- BizNest Database
create table if not exists businesses (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete cascade,
 business_name text not null,
 category text,
 created_at timestamptz default now()
);
create table if not exists products (
 id uuid primary key default gen_random_uuid(),
 business_id uuid references businesses(id) on delete cascade,
 name text not null,
 price numeric default 0,
 category text,
 created_at timestamptz default now()
);
create table if not exists orders (
 id uuid primary key default gen_random_uuid(),
 business_id uuid references businesses(id) on delete cascade,
 customer_name text,
 total numeric default 0,
 status text default 'pending',
 created_at timestamptz default now()
);
alter table businesses enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
create policy "Business owner access" on businesses for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
