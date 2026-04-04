-- ============================================================
-- Migration 003: food_wishes 補齊欄位
-- 執行日期：2026-04-04
-- 適用情境：已經執行過 002 建立 food_wishes table，需要補上後來新增的欄位
-- ============================================================

ALTER TABLE food_wishes ADD COLUMN IF NOT EXISTS address text default '';
ALTER TABLE food_wishes ADD COLUMN IF NOT EXISTS reservation_url text default '';
ALTER TABLE food_wishes ADD COLUMN IF NOT EXISTS booked boolean default false;
