-- BizNest Supabase starter database
create table if not exists profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 name text, business_name text, role text default 'user',
 is_blocked boolean default false, created_at timestamptz default now()
);
create table if not exists products (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete cascade,
 name text not null, price numeric default 0, status text default 'active'
);
create table if not exists leads (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete cascade,
 name text, email text, status text default 'new'
);
create table if not exists orders (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete cascade,
 customer_name text, total numeric default 0, status text default 'pending'
);
