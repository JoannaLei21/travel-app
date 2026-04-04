-- ============================================================
-- Joanna's Travel App - Supabase Schema
-- 在 Supabase SQL Editor 中執行此檔案
-- ============================================================

-- 1. 旅遊計畫
create table if not exists trips (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  start_date date not null,
  end_date date not null,
  transport jsonb,          -- { type, number, depTime, depPlace, arrPlace }
  return_transport jsonb,   -- same structure
  created_at timestamptz default now()
);

-- 2. 許願行程
create table if not exists wishes (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  title text not null,
  address text default '',
  price numeric default 0,
  currency text default 'JPY',
  recommend_time text default '',
  ticket_date text default '',
  url text default '',
  booked boolean default false,
  confirmed boolean default false,
  created_at timestamptz default now()
);

-- 3. 行程 (calendar events)
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  title text not null,
  date date not null,
  start_h integer not null,
  end_h integer not null,
  location text default '',
  price numeric default 0,
  currency text default 'JPY',
  wish_id uuid,
  created_at timestamptz default now()
);

-- 4. 記帳
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  date date,
  category text default '',
  description text default '',
  amount numeric default 0,
  currency text default 'JPY',
  qty integer default 1,
  created_at timestamptz default now()
);

-- 5. 許願清單 (shopping wishlist)
create table if not exists shopwish (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  store text default '',
  price numeric default 0,
  currency text default 'JPY',
  prices jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 6. 許願餐廳
create table if not exists food_wishes (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  category text default '正餐',       -- 正餐 / 甜點 / 咖啡廳
  price numeric default 0,
  currency text default 'JPY',
  business_hours text default '',      -- 營業時間
  nearest_station text default '',     -- 最近車站
  url text default '',
  reservation_url text default '',     -- 預約網站
  booked boolean default false,        -- 已預約
  visited boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security (RLS)
-- 個人使用：允許 anon key 完全存取
-- ============================================================
alter table trips enable row level security;
alter table wishes enable row level security;
alter table events enable row level security;
alter table expenses enable row level security;
alter table shopwish enable row level security;

-- Allow all operations for anon (personal use)
create policy "Allow all on trips" on trips for all using (true) with check (true);
create policy "Allow all on wishes" on wishes for all using (true) with check (true);
create policy "Allow all on events" on events for all using (true) with check (true);
create policy "Allow all on expenses" on expenses for all using (true) with check (true);
create policy "Allow all on shopwish" on shopwish for all using (true) with check (true);
alter table food_wishes enable row level security;
create policy "Allow all on food_wishes" on food_wishes for all using (true) with check (true);
