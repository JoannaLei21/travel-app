-- ============================================================
-- Migration 002: 新增許願餐廳 table
-- 執行日期：2026-04-04
-- ============================================================

-- 6. 許願餐廳
create table if not exists food_wishes (
  id uuid default gen_random_uuid() primary key,
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  category text default '正餐',           -- 正餐 / 甜點 / 咖啡廳
  price numeric default 0,
  currency text default 'JPY',
  business_hours text default '',          -- 營業時間
  nearest_station text default '',         -- 最近車站
  url text default '',                     -- 店家網站
  reservation_url text default '',         -- 預約網站
  booked boolean default false,            -- 已預約
  visited boolean default false,           -- 已造訪
  created_at timestamptz default now()
);

-- RLS
alter table food_wishes enable row level security;
create policy "Allow all on food_wishes" on food_wishes for all using (true) with check (true);
