-- ============================================================
-- Migration 005: wishes 新增營業時間欄位
-- 執行日期：2026-04-08
-- ============================================================

ALTER TABLE wishes ADD COLUMN IF NOT EXISTS business_hours text default '';
