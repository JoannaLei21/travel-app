-- ============================================================
-- Migration 004: food_wishes 新增預約備註欄位
-- 執行日期：2026-04-08
-- ============================================================

ALTER TABLE food_wishes ADD COLUMN IF NOT EXISTS reservation_note text default '';
