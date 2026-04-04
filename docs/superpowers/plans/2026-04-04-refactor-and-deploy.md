# 旅遊計劃 App — 重構 + 部署 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 1005 行的 App.jsx 拆分成獨立元件，建立 Git repo，部署到 Zeabur

**Architecture:** 把 App.jsx 拆成 constants、theme、utils、hooks、components 等獨立檔案。每個 Tab 頁面是獨立元件，共用元件（Modal、TabBar）也獨立。部署使用 Zeabur 連接 GitHub repo，環境變數透過 Zeabur dashboard 設定。

**Tech Stack:** React 19, Vite 8, Supabase, Zeabur, GitHub

---

## 檔案結構規劃

拆分後的目標結構：

```
src/
├── main.jsx                     （不動）
├── index.css                    （不動）
├── App.jsx                      （大幅精簡，只剩路由邏輯 ~30 行）
├── constants/
│   ├── icons.js                 （所有 ICON_* 常數）
│   ├── tabs.js                  （TABS 設定）
│   ├── defaults.js              （INIT_WISHES, INIT_SHOPWISH, DEFAULT_CATS, TRANSPORT_TYPES 等）
│   └── index.js                 （統一匯出）
├── theme.js                     （顏色常數 C）
├── utils.js                     （makeDates, getWD, isWkend, HOURS, JPY_TO_TWD, uid）
├── hooks/
│   ├── useSupabase.js           （不動）
│   └── useLocalStore.js         （從 App.jsx 搬出）
├── components/
│   ├── Modal.jsx                （通用彈窗）
│   ├── TabBar.jsx               （底部導航）
│   ├── CatIcon.jsx              （分類圖示小元件）
│   ├── HomePage.jsx             （旅程列表首頁）
│   ├── TripView.jsx             （旅程詳情容器 + Header）
│   ├── WishTripTab.jsx          （許願行程頁）
│   ├── CalendarTab.jsx          （行程日曆頁）
│   ├── WishlistTab.jsx          （許願清單頁）
│   └── ExpensesTab.jsx          （記帳頁）
├── lib/
│   └── supabase.js              （不動）
└── assets/                      （不動）
```

---

## Phase 1：基礎建設（Git + 環境）

### Task 1: 初始化 Git repo

**Files:**
- 已建立: `.gitignore`, `.env`

- [ ] **Step 1: 初始化 git**

```bash
cd "/Users/leiyenchen/Desktop/Ai 專案/旅遊計劃"
git init
```

- [ ] **Step 2: 確認 .gitignore 生效**

```bash
git status
```

預期：不應該看到 `node_modules/`、`.env`、`.DS_Store`

- [ ] **Step 3: 第一次 commit**

```bash
git add .
git commit -m "初始版本：旅遊計劃 App（重構前）"
```

- [ ] **Step 4: 建立 GitHub repo 並推送**

```bash
gh repo create travel-app --private --source=. --remote=origin --push
```

如果沒有安裝 `gh` CLI，手動操作：
1. 到 GitHub 網站建立新的 private repo（名稱：`travel-app`）
2. 執行：
```bash
git remote add origin https://github.com/你的帳號/travel-app.git
git branch -M main
git push -u origin main
```

---

## Phase 2：抽出共用模組（不改功能，只搬程式碼）

### Task 2: 抽出 theme.js

**Files:**
- Create: `src/theme.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/theme.js**

```js
// 全站顏色主題常數
export const C = {
  bg: "#fffbf5", accent: "#e8909c", accent2: "#d4a05a", brown: "#5c4033",
  brownLight: "#8a6d50", card: "#fffef9", border: "#f0dcc8", borderLight: "#f7eedf",
  warmBg: "#fff8ec", greenBg: "#eef7e8", green: "#5a9e4b", red: "#d96b6b",
  pink: "#fce4ec", pinkLight: "#fff0f3", yellow: "#fdf6e3", yellowLight: "#fffcf0",
  accentDark: "#c97080",
};
```

- [ ] **Step 2: 修改 App.jsx — 移除 C 定義，加上 import**

在 App.jsx 最上方加入 `import { C } from "./theme";`，然後刪除第 110~116 行的 `const C = { ... };`

- [ ] **Step 3: 驗證 App 仍然能跑**

```bash
npm run dev
```

在瀏覽器確認畫面正常顯示，顏色沒有跑掉。

- [ ] **Step 4: Commit**

```bash
git add src/theme.js src/App.jsx
git commit -m "refactor: 抽出 theme.js 顏色常數"
```

### Task 3: 抽出 utils.js

**Files:**
- Create: `src/utils.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/utils.js**

```js
// 匯率
export const JPY_TO_TWD = 0.22;

// 產生日期陣列（從 start 到 end）
export const makeDates = (start, end) => {
  const arr = [];
  for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
    arr.push(new Date(d).toISOString().slice(0, 10));
  }
  return arr;
};

// 星期幾
const WD = ["日", "一", "二", "三", "四", "五", "六"];
export const getWD = (s) => WD[new Date(s + "T00:00:00").getDay()];
export const isWkend = (s) => { const d = new Date(s + "T00:00:00").getDay(); return d === 0 || d === 6; };

// 可選時段（7:00 ~ 22:00）
export const HOURS = [];
for (let h = 7; h <= 22; h++) HOURS.push(h);

// 簡易 ID 產生器
let _id = 100;
export const uid = () => ++_id;
```

- [ ] **Step 2: 修改 App.jsx — 移除這些工具函式，改用 import**

在 App.jsx 上方加入：
```js
import { JPY_TO_TWD, makeDates, getWD, isWkend, HOURS, uid } from "./utils";
```
刪除 App.jsx 中對應的定義（第 39~53 行、第 104~105 行）

- [ ] **Step 3: 驗證**

```bash
npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/utils.js src/App.jsx
git commit -m "refactor: 抽出 utils.js 工具函式"
```

### Task 4: 抽出 constants/

**Files:**
- Create: `src/constants/icons.js`
- Create: `src/constants/tabs.js`
- Create: `src/constants/defaults.js`
- Create: `src/constants/index.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/constants/icons.js**

```js
// 圖示路徑常數
export const ICON_WISHTRIP = "/icons/learning.png";
export const ICON_CALENDAR = "/icons/schedule.png";
export const ICON_WISHLIST = "/icons/growth.png";
export const ICON_EXPENSE = "/icons/homework.png";
export const ICON_PEN = "/icons/pen.png";
export const ICON_TEMPLE = "/icons/temple.png";
export const ICON_SUCCESS = "/icons/success.png";
export const ICON_STOPWATCH = "/icons/stopwatch.png";
export const ICON_TICKET = "/icons/ticket.png";
export const ICON_TVSCREEN = "/icons/tv-screen.png";
export const ICON_CAT_RAMEN = "/icons/ramen.png";
export const ICON_CAT_DANGO = "/icons/dango.png";
export const ICON_CAT_SHINKANSEN = "/icons/shinkansen.png";
export const ICON_CAT_BUY = "/icons/buy.png";
export const ICON_CAT_GIFT_BOX = "/icons/gift-box.png";
export const ICON_CAT_COIN = "/icons/coin.png";
export const ICON_CAT_JAPANESE = "/icons/japanese.png";
export const ICON_CAT_MOTIVATION = "/icons/motivation.png";
export const ICON_ORIGAMI = "/icons/origami.png";
export const ICON_BACK = "/icons/forward.png";
export const ICON_CAT_TICKET = ICON_TICKET;
```

- [ ] **Step 2: 建立 src/constants/tabs.js**

```js
import { ICON_WISHTRIP, ICON_CALENDAR, ICON_WISHLIST, ICON_EXPENSE } from "./icons";

export const TABS = [
  { id: "wishtrip", label: "許願行程", imgSrc: ICON_WISHTRIP },
  { id: "calendar", label: "行程", imgSrc: ICON_CALENDAR },
  { id: "wishlist", label: "許願清單", imgSrc: ICON_WISHLIST },
  { id: "expenses", label: "記帳", imgSrc: ICON_EXPENSE },
];
```

- [ ] **Step 3: 建立 src/constants/defaults.js**

```js
import {
  ICON_CAT_RAMEN, ICON_CAT_DANGO, ICON_CAT_SHINKANSEN,
  ICON_CAT_TICKET, ICON_CAT_BUY, ICON_CAT_GIFT_BOX,
  ICON_CAT_COIN, ICON_CAT_JAPANESE, ICON_CAT_MOTIVATION,
} from "./icons";

export const DEFAULT_START = "2026-08-20";
export const DEFAULT_END = "2026-09-10";

export const TRANSPORT_TYPES = ["✈ 飛機", "🚄 高鐵", "🚌 巴士", "🚗 自駕", "🚢 船"];

export const DEFAULT_CATS = [
  { id: "正餐", imgSrc: ICON_CAT_RAMEN, color: "#e65100" },
  { id: "點心", imgSrc: ICON_CAT_DANGO, color: "#d4a05a" },
  { id: "交通", imgSrc: ICON_CAT_SHINKANSEN, color: "#1565c0" },
  { id: "門票", imgSrc: ICON_CAT_TICKET, color: "#c62828" },
  { id: "購物", imgSrc: ICON_CAT_BUY, color: "#2e7d32" },
  { id: "禮物", imgSrc: ICON_CAT_GIFT_BOX, color: "#ad1457" },
  { id: "藥妝", imgSrc: ICON_CAT_JAPANESE, color: "#e91e63" },
  { id: "工作", imgSrc: ICON_CAT_MOTIVATION, color: "#ff8f00" },
  { id: "其他", imgSrc: ICON_CAT_COIN, color: "#546e7a" },
];
```

- [ ] **Step 4: 建立 src/constants/index.js**

```js
export * from "./icons";
export * from "./tabs";
export * from "./defaults";
```

- [ ] **Step 5: 修改 App.jsx — 用 import 取代所有常數定義**

在 App.jsx 上方加入：
```js
import {
  ICON_PEN, ICON_TEMPLE, ICON_SUCCESS, ICON_STOPWATCH, ICON_TICKET,
  ICON_TVSCREEN, ICON_ORIGAMI, ICON_BACK, ICON_EXPENSE,
  TABS, DEFAULT_START, DEFAULT_END, DEFAULT_CATS, TRANSPORT_TYPES,
} from "./constants";
```
刪除 App.jsx 中第 10~83 行的所有常數定義。

- [ ] **Step 6: 驗證**

```bash
npm run dev
```

- [ ] **Step 7: Commit**

```bash
git add src/constants/ src/App.jsx
git commit -m "refactor: 抽出 constants/ 資料夾（icons, tabs, defaults）"
```

### Task 5: 抽出 useLocalStore hook

**Files:**
- Create: `src/hooks/useLocalStore.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/hooks/useLocalStore.js**

```js
import { useState, useCallback } from "react";

// 用 window.__ts 暫存 UI 偏好（非 DB 資料）
export function useLocalStore(key, init) {
  const [s, setS] = useState(() => {
    try { const v = window.__ts?.[key]; if (v !== undefined) return v; } catch {}
    return typeof init === "function" ? init() : init;
  });
  const set = useCallback((v) => {
    setS((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      if (!window.__ts) window.__ts = {};
      window.__ts[key] = next;
      return next;
    });
  }, [key]);
  return [s, set];
}
```

- [ ] **Step 2: 修改 App.jsx — import useLocalStore，刪除原定義**

加入 `import { useLocalStore } from "./hooks/useLocalStore";`，刪除第 88~102 行。

- [ ] **Step 3: 驗證 + Commit**

```bash
npm run dev
git add src/hooks/useLocalStore.js src/App.jsx
git commit -m "refactor: 抽出 useLocalStore hook"
```

---

## Phase 3：拆分元件

### Task 6: 抽出 Modal + CatIcon + TabBar

**Files:**
- Create: `src/components/Modal.jsx`
- Create: `src/components/CatIcon.jsx`
- Create: `src/components/TabBar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/components/Modal.jsx**

```jsx
// 通用彈窗元件
export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl p-4 max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 建立 src/components/CatIcon.jsx**

```jsx
// 分類圖示小元件
export default function CatIcon({ src }) {
  return <img src={src} alt="" style={{ width: 16, height: 16, display: "inline", verticalAlign: "middle" }} />;
}
```

- [ ] **Step 3: 建立 src/components/TabBar.jsx**

```jsx
import { TABS } from "../constants";
import { C } from "../theme";

// 底部 Tab 導航列
export default function TabBar({ active, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex border-t-2 bg-white z-50" style={{ borderColor: C.accent }}>
      {TABS.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className="flex-1 flex flex-col items-center py-2"
          style={{ background: active === t.id ? C.pinkLight : "white", color: active === t.id ? C.accentDark : "#aaa" }}>
          <img src={t.imgSrc} alt="" style={{ width: 26, height: 26 }} />
          <span style={{ fontSize: 10 }} className="mt-0.5 font-medium">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: 修改 App.jsx — 刪除這三個元件定義，改用 import**

```js
import Modal from "./components/Modal";
import CatIcon from "./components/CatIcon";
import TabBar from "./components/TabBar";
```
刪除 App.jsx 中 `function Modal`、`const CatIcon`、`function TabBar` 的定義。

- [ ] **Step 5: 驗證 + Commit**

```bash
npm run dev
git add src/components/Modal.jsx src/components/CatIcon.jsx src/components/TabBar.jsx src/App.jsx
git commit -m "refactor: 抽出 Modal, CatIcon, TabBar 共用元件"
```

### Task 7: 抽出 WishTripTab

**Files:**
- Create: `src/components/WishTripTab.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/components/WishTripTab.jsx**

把 App.jsx 中 `function WishTripTab` 整個搬過來（第 163~303 行），加上需要的 import：

```jsx
import { useState } from "react";
import { C } from "../theme";
import { getWD, isWkend, JPY_TO_TWD, HOURS } from "../utils";
import { ICON_PEN, ICON_STOPWATCH, ICON_TICKET, ICON_TVSCREEN } from "../constants";
import Modal from "./Modal";

export default function WishTripTab({ wishes, wishOps, events, eventOps, dates }) {
  // ...（完整搬移原本 WishTripTab 的所有內容）
}
```

- [ ] **Step 2: 修改 App.jsx — 刪除 WishTripTab，改用 import**

```js
import WishTripTab from "./components/WishTripTab";
```

- [ ] **Step 3: 驗證 + Commit**

```bash
npm run dev
git add src/components/WishTripTab.jsx src/App.jsx
git commit -m "refactor: 抽出 WishTripTab 元件"
```

### Task 8: 抽出 CalendarTab

**Files:**
- Create: `src/components/CalendarTab.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/components/CalendarTab.jsx**

搬移 App.jsx 中 `function CalendarTab`（第 308~428 行），加上 import：

```jsx
import { useState, useRef } from "react";
import { C } from "../theme";
import { getWD, isWkend, HOURS } from "../utils";
import Modal from "./Modal";

export default function CalendarTab({ events, eventOps, dates }) {
  // ...（完整搬移）
}
```

- [ ] **Step 2: 修改 App.jsx + 驗證 + Commit**

```bash
npm run dev
git add src/components/CalendarTab.jsx src/App.jsx
git commit -m "refactor: 抽出 CalendarTab 元件"
```

### Task 9: 抽出 WishlistTab

**Files:**
- Create: `src/components/WishlistTab.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/components/WishlistTab.jsx**

搬移 `function WishlistTab`（第 433~590 行），加上 import：

```jsx
import { useState } from "react";
import { C } from "../theme";
import { JPY_TO_TWD, uid } from "../utils";
import { ICON_PEN, ICON_TEMPLE, ICON_SUCCESS } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import { useLocalStore } from "../hooks/useLocalStore";
import Modal from "./Modal";

export default function WishlistTab({ tripId }) {
  // ...（完整搬移）
}
```

- [ ] **Step 2: 修改 App.jsx + 驗證 + Commit**

```bash
npm run dev
git add src/components/WishlistTab.jsx src/App.jsx
git commit -m "refactor: 抽出 WishlistTab 元件"
```

### Task 10: 抽出 ExpensesTab

**Files:**
- Create: `src/components/ExpensesTab.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/components/ExpensesTab.jsx**

搬移 `function ExpensesTab`（第 595~754 行），加上 import：

```jsx
import { useState, useRef } from "react";
import { C } from "../theme";
import { getWD, isWkend, JPY_TO_TWD, HOURS } from "../utils";
import { ICON_EXPENSE } from "../constants";
import { DEFAULT_CATS } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import { useLocalStore } from "../hooks/useLocalStore";
import CatIcon from "./CatIcon";

export default function ExpensesTab({ dates, tripId }) {
  // ...（完整搬移）
}
```

- [ ] **Step 2: 修改 App.jsx + 驗證 + Commit**

```bash
npm run dev
git add src/components/ExpensesTab.jsx src/App.jsx
git commit -m "refactor: 抽出 ExpensesTab 元件"
```

### Task 11: 抽出 HomePage + TripView，精簡 App.jsx

**Files:**
- Create: `src/components/HomePage.jsx`
- Create: `src/components/TripView.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: 建立 src/components/HomePage.jsx**

搬移 `function HomePage`（第 762~955 行），加上 import：

```jsx
import { useState } from "react";
import { C } from "../theme";
import { ICON_PEN, ICON_ORIGAMI } from "../constants";
import { DEFAULT_START, DEFAULT_END, TRANSPORT_TYPES } from "../constants";

export default function HomePage({ trips, tripOps, onSelectTrip }) {
  // ...（完整搬移，包含 calcDays 函式）
}
```

- [ ] **Step 2: 建立 src/components/TripView.jsx**

搬移 `function TripView`（第 960~989 行），加上 import：

```jsx
import { useState, useMemo } from "react";
import { C } from "../theme";
import { makeDates } from "../utils";
import { ICON_BACK } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import TabBar from "./TabBar";
import WishTripTab from "./WishTripTab";
import CalendarTab from "./CalendarTab";
import WishlistTab from "./WishlistTab";
import ExpensesTab from "./ExpensesTab";

export default function TripView({ trip, onBack }) {
  // ...（完整搬移）
}
```

- [ ] **Step 3: App.jsx 精簡為只剩路由邏輯**

最終 App.jsx 大約 20 行：

```jsx
import { useState } from "react";
import { useTrips } from "./hooks/useSupabase";
import HomePage from "./components/HomePage";
import TripView from "./components/TripView";

export default function App() {
  const [trips, tripOps] = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(null);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || null;

  if (selectedTrip) {
    return <TripView trip={selectedTrip} onBack={() => setSelectedTripId(null)} />;
  }

  return <HomePage trips={trips} tripOps={tripOps} onSelectTrip={(t) => setSelectedTripId(t.id)} />;
}
```

- [ ] **Step 4: 驗證所有功能正常**

```bash
npm run dev
```

逐一檢查：首頁 → 進入旅程 → 四個 Tab（許願行程、行程、許願清單、記帳）都能正常顯示和操作。

- [ ] **Step 5: Commit**

```bash
git add src/components/HomePage.jsx src/components/TripView.jsx src/App.jsx
git commit -m "refactor: 抽出 HomePage + TripView，App.jsx 精簡為路由"
```

---

## Phase 4：清理

### Task 12: 處理舊檔案 + 清理

- [ ] **Step 1: 確認 tokyo-trip-2026.jsx 不再被引用**

```bash
grep -r "tokyo-trip" src/
```

如果沒有任何結果，這個檔案是舊版備份，可以安全刪除。

- [ ] **Step 2: 刪除或歸檔**

```bash
# 如果確認不需要了：
rm tokyo-trip-2026.jsx

# 或者想留著備份：
mkdir -p archive
mv tokyo-trip-2026.jsx archive/
```

- [ ] **Step 3: 推送到 GitHub**

```bash
git add -A
git commit -m "chore: 清理舊檔案"
git push origin main
```

---

## Phase 5：Zeabur 部署

### Task 13: 設定 Zeabur 部署

- [ ] **Step 1: 登入 Zeabur**

到 https://zeabur.com 登入（可用 GitHub 帳號）

- [ ] **Step 2: 建立新專案**

1. 點擊「Create Project」
2. 選擇區域（建議選 Asia - Tokyo 或 Hong Kong）

- [ ] **Step 3: 部署 GitHub repo**

1. 點擊「Add Service」→「Git」→ 選擇你的 `travel-app` repo
2. Zeabur 會自動偵測 Vite 專案，使用 Node.js 建構

- [ ] **Step 4: 設定環境變數**

在 Zeabur 的 Service 頁面 → Variables tab，加入：

```
VITE_SUPABASE_URL = （從 .env 複製你的值）
VITE_SUPABASE_ANON_KEY = （從 .env 複製你的值）
```

**重要：** Vite 的環境變數必須以 `VITE_` 開頭，build 時才會被打包進去。

- [ ] **Step 5: 綁定網域**

1. 在 Networking tab → 點擊「Generate Domain」取得免費的 `.zeabur.app` 網域
2. 或者綁定自己的網域

- [ ] **Step 6: 驗證部署成功**

打開 Zeabur 給的網址，確認：
- 首頁能正常顯示
- 能建立新旅程
- Supabase 資料能正常讀寫

---

## 完成後的成果

| 項目 | 改善前 | 改善後 |
|------|--------|--------|
| App.jsx 行數 | 1005 行 | ~20 行 |
| 元件檔案數 | 1 個 | 9 個獨立元件 |
| Git | 無 | GitHub private repo |
| 環境變數 | 無 .env | .env + .gitignore 保護 |
| 部署 | 無 | Zeabur 自動部署 |
