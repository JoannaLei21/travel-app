# Joanna 的療癒之旅

旅遊計劃 App — 記錄行程、許願景點、餐廳清單、購物清單、記帳，一個 App 搞定。

## 功能

- **行程日曆** — 拖拉式時間軸，規劃每日行程
- **許願行程** — 記錄想去的景點、票價、售票時間，可加入行程
- **許願餐廳** — 記錄想吃的餐廳、分類、地址、營業時間，連結 Google Maps
- **許願清單** — 購物清單，支援比價紀錄
- **記帳** — 日圓/台幣雙幣記帳，自動換算

## 技術

- React 19 + Vite 8
- Tailwind CSS v4
- Supabase（資料庫 + Auth）
- Zeabur（部署）

## 本地開發

```bash
# 安裝
npm install

# 設定環境變數
cp .env.example .env
# 填入 Supabase URL 和 Anon Key

# 啟動
npm run dev
```

## 環境變數

| 變數 | 說明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 專案 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key |

## 資料庫

SQL schema 在 `supabase-schema.sql`，migration 記錄在 `supabase/migrations/`。
