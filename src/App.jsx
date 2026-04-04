import { useState, useCallback, useRef, useMemo } from "react";
import { useTrips, useSupabaseTable } from "./hooks/useSupabase";

// ============================================================
// 東京旅行 2026 — v3 日系和風
// ============================================================

// Icon images (base64 from 64px PNGs)

const ICON_WISHTRIP = "/icons/learning.png";
const ICON_CALENDAR = "/icons/schedule.png";
const ICON_WISHLIST = "/icons/growth.png";
const ICON_EXPENSE = "/icons/homework.png";
const ICON_PEN = "/icons/pen.png";
const ICON_TEMPLE = "/icons/temple.png";
const ICON_SUCCESS = "/icons/success.png";
const ICON_STOPWATCH = "/icons/stopwatch.png";
const ICON_TICKET = "/icons/ticket.png";
const ICON_TVSCREEN = "/icons/tv-screen.png";
const ICON_CAT_RAMEN = "/icons/ramen.png";
const ICON_CAT_DANGO = "/icons/dango.png";
const ICON_CAT_SHINKANSEN = "/icons/shinkansen.png";
const ICON_CAT_BUY = "/icons/buy.png";
const ICON_CAT_GIFT_BOX = "/icons/gift-box.png";
const ICON_CAT_COIN = "/icons/coin.png";
const ICON_CAT_JAPANESE = "/icons/japanese.png";
const ICON_CAT_MOTIVATION = "/icons/motivation.png";
const ICON_ORIGAMI = "/icons/origami.png";
const ICON_BACK = "/icons/forward.png";
const ICON_CAT_TICKET = ICON_TICKET;

const TABS = [
  { id: "wishtrip", label: "許願行程", imgSrc: ICON_WISHTRIP },
  { id: "calendar", label: "行程", imgSrc: ICON_CALENDAR },
  { id: "wishlist", label: "許願清單", imgSrc: ICON_WISHLIST },
  { id: "expenses", label: "記帳", imgSrc: ICON_EXPENSE },
];

const JPY_TO_TWD = 0.22;
const makeDates = (start, end) => {
  const arr = [];
  for (let d = new Date(start); d <= new Date(end); d.setDate(d.getDate() + 1)) {
    arr.push(new Date(d).toISOString().slice(0, 10));
  }
  return arr;
};
const DEFAULT_START = "2026-08-20";
const DEFAULT_END = "2026-09-10";
const WD = ["日", "一", "二", "三", "四", "五", "六"];
const getWD = (s) => WD[new Date(s + "T00:00:00").getDay()];
const isWkend = (s) => { const d = new Date(s + "T00:00:00").getDay(); return d === 0 || d === 6; };
const HOURS = [];
for (let h = 7; h <= 22; h++) HOURS.push(h);

const INIT_WISHES = [
  { id: 1, title: "哈利波特影城", address: "練馬區・西武豐島線豐島園站", price: 7000, currency: "JPY", recommend_time: "平日 09:00", ticket_date: "已開放", url: "https://www.wbstudiotour.jp/en/tickets/", booked: false, confirmed: false },
  { id: 2, title: "teamLab Planets", address: "豐洲站步行 10 分鐘", price: 4200, currency: "JPY", recommend_time: "平日下午 14:00~", ticket_date: "約 4 月底開放 7 月票", url: "https://teamlabplanets.dmm.com/en", booked: false, confirmed: false },
  { id: 3, title: "teamLab Borderless", address: "麻布台 Hills・神谷町站 5 分鐘", price: 4200, currency: "JPY", recommend_time: "平日下午", ticket_date: "待確認", url: "https://www.teamlab.art/e/tokyo/", booked: false, confirmed: false },
  { id: 4, title: "PokéPark KANTO", address: "讀賣樂園・新宿搭車約 25 分鐘", price: 7900, currency: "JPY", recommend_time: "週二~四最便宜最少人", ticket_date: "2026 夏季開售", url: "https://www.pokepark-kanto.co.jp/", booked: false, confirmed: false },
  { id: 5, title: "Pokémon Center Mega Tokyo", address: "池袋 Sunshine City 2F", price: 0, currency: "JPY", recommend_time: "週末可去", ticket_date: "免票", url: "", booked: false, confirmed: false },
  { id: 6, title: "Pokémon Center Tokyo DX", address: "日本橋高島屋 5F（附寶可夢咖啡廳）", price: 0, currency: "JPY", recommend_time: "週末", ticket_date: "咖啡廳需預約", url: "", booked: false, confirmed: false },
  { id: 7, title: "Pokémon Center Skytree Town", address: "晴空塔附近", price: 0, currency: "JPY", recommend_time: "週末", ticket_date: "免票", url: "", booked: false, confirmed: false },
  { id: 8, title: "Pokémon Center Tokyo Bay", address: "LaLaport 船橋（千葉）", price: 0, currency: "JPY", recommend_time: "週末", ticket_date: "免票", url: "", booked: false, confirmed: false },
];

const INIT_SHOPWISH = [
  { id: 1, name: "寶可夢中心限定周邊", store: "Pokemon Center", price: 5000, currency: "JPY", prices: [] },
  { id: 2, name: "哈利波特魔杖", store: "哈利波特影城", price: 5500, currency: "JPY", prices: [] },
];

const CatIcon = ({ src }) => <img src={src} alt="" style={{ width: 16, height: 16, display: "inline", verticalAlign: "middle" }} />;

const DEFAULT_CATS = [
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

// ============================================================
// Local state hook (for non-DB state like UI preferences)
// ============================================================
function useLocalStore(key, init) {
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

let _id = 100;
const uid = () => ++_id;

// ============================================================
// Styles
// ============================================================
const C = {
  bg: "#fffbf5", accent: "#e8909c", accent2: "#d4a05a", brown: "#5c4033",
  brownLight: "#8a6d50", card: "#fffef9", border: "#f0dcc8", borderLight: "#f7eedf",
  warmBg: "#fff8ec", greenBg: "#eef7e8", green: "#5a9e4b", red: "#d96b6b",
  pink: "#fce4ec", pinkLight: "#fff0f3", yellow: "#fdf6e3", yellowLight: "#fffcf0",
  accentDark: "#c97080",
};

// ============================================================
// Header
// ============================================================
function Header() {
  return (
    <div className="relative overflow-hidden border-b-2 px-4 py-3 text-center" style={{ background: "linear-gradient(135deg, #fff0f3, #fdf6e3, #fff0f3)", borderColor: C.accent }}>
      <h1 className="text-xl font-bold" style={{ color: C.accentDark, fontFamily: "serif" }}>東京旅行 2026</h1>
      <p className="text-xs mt-0.5" style={{ color: C.accent2 }}>8月下旬〜9月上旬 ✈ 一人旅</p>
    </div>
  );
}

// ============================================================
// TabBar
// ============================================================
function TabBar({ active, onChange }) {
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

// ============================================================
// Modal
// ============================================================
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }} onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-2xl p-4 max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// Tab 1: 許願行程 (with ticketDate)
// ============================================================
function WishTripTab({ wishes, wishOps, events, eventOps, dates }) {
  const DATES = dates;
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: "", address: "", price: "", currency: "JPY", recommend_time: "", ticket_date: "", url: "" });
  const [addToCalId, setAddToCalId] = useState(null);
  const [calForm, setCalForm] = useState({ date: DATES[0], start_h: 9, end_h: 11 });

  const openNew = () => { setForm({ title: "", address: "", price: "", currency: "JPY", recommend_time: "", ticket_date: "", url: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (w) => { setForm({ title: w.title, address: w.address, price: String(w.price), currency: w.currency, recommend_time: w.recommend_time, ticket_date: w.ticket_date || "", url: w.url }); setEditId(w.id); setShowForm(true); };

  const save = () => {
    if (!form.title) return;
    if (editId) {
      wishOps.update(editId, { ...form, price: Number(form.price) || 0 });
    } else {
      wishOps.add({ ...form, price: Number(form.price) || 0, booked: false, confirmed: false });
    }
    setShowForm(false);
  };

  const remove = (id) => { if (confirm("刪除此許願行程？")) wishOps.remove(id); };
  const toggle = (id, field) => { const w = wishes.find(x => x.id === id); if (w) wishOps.update(id, { [field]: !w[field] }); };

  const addToCal = () => {
    const wish = wishes.find((w) => w.id === addToCalId);
    if (!wish) return;
    eventOps.add({ title: wish.title, date: calForm.date, start_h: calForm.start_h, end_h: calForm.end_h, location: wish.address, price: wish.price, currency: wish.currency, wish_id: wish.id });
    wishOps.update(addToCalId, { confirmed: true });
    setAddToCalId(null);
  };

  return (
    <div className="p-3 pb-20">
      {wishes.map((w) => (
        <div key={w.id} className="rounded-xl border mb-3 overflow-hidden" style={{ borderColor: C.border, background: C.card }}>
          <div className="p-3">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-sm" style={{ color: C.brown }}>{w.title}</h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(w)} className="w-5 h-5"><img src={ICON_PEN} alt="edit" className="w-full h-full" /></button>
                <button onClick={() => remove(w.id)} className="text-xs px-1 py-0.5 opacity-40 hover:opacity-80">✕</button>
              </div>
            </div>
            <p className="text-xs mt-1 opacity-60">📍 {w.address}</p>
            <div className="flex items-center gap-3 mt-2">
              {w.price > 0 ? (
                <span className="text-sm font-bold" style={{ color: C.accent }}>{w.currency === "JPY" ? "¥" : "NT$"}{w.price.toLocaleString()}</span>
              ) : (
                <span className="text-sm font-bold" style={{ color: C.green }}>免費</span>
              )}
              {w.price > 0 && w.currency === "JPY" && (
                <span className="text-xs opacity-40">≈ NT${Math.round(w.price * JPY_TO_TWD).toLocaleString()}</span>
              )}
            </div>
            <p className="text-xs mt-1.5" style={{ color: C.accent2 }}><img src={ICON_STOPWATCH} alt="" style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle", marginRight: 3 }} />推薦：{w.recommend_time}</p>
            {w.ticket_date && <p className="text-xs mt-1" style={{ color: "#1565c0" }}><img src={ICON_TICKET} alt="" style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle", marginRight: 3 }} />售票：{w.ticket_date}</p>}
            {w.url && <a href={w.url} target="_blank" rel="noreferrer" className="inline-block text-xs mt-1 underline" style={{ color: "#1565c0" }}><img src={ICON_TVSCREEN} alt="" style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle", marginRight: 3 }} />購票網站</a>}
            <div className="flex items-center gap-3 mt-3 pt-2 border-t" style={{ borderColor: C.borderLight }}>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: w.booked ? C.green : "#888" }}>
                <input type="checkbox" checked={w.booked} onChange={() => toggle(w.id, "booked")} className="accent-green-600" /> 已訂票
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: w.confirmed ? C.green : "#888" }}>
                <input type="checkbox" checked={w.confirmed} onChange={() => toggle(w.id, "confirmed")} className="accent-green-600" /> 確定參訪
              </label>
              <div className="flex-1" />
              <button onClick={() => { setAddToCalId(w.id); setCalForm({ date: DATES[0], start_h: 9, end_h: 11 }); }}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold"
                style={{ background: "#e8909c", color: "white" }}>
                ＋ 加入行程
              </button>
            </div>
          </div>
        </div>
      ))}

      <button onClick={openNew} className="w-full py-4 rounded-xl border-dashed border-2 text-sm font-bold flex items-center justify-center gap-1"
        style={{ borderColor: C.accent, color: C.accent }}>
        ＋ 新增許願景點
      </button>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="font-bold text-base mb-3" style={{ color: C.brown }}>{editId ? "編輯景點" : "新增許願景點"}</h3>
          <input placeholder="景點名稱 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="地址 / 交通方式" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-2 mb-2">
            <input placeholder="票價" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="flex-1 p-2.5 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
              {["JPY", "TWD"].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, currency: c })} className="px-3 py-2 text-xs font-bold"
                  style={{ background: form.currency === c ? C.accent : "white", color: form.currency === c ? "white" : "#888" }}>
                  {c === "JPY" ? "¥ 日圓" : "$ 台幣"}
                </button>
              ))}
            </div>
          </div>
          <input placeholder="推薦到訪時間（如：平日 09:00）" value={form.recommend_time} onChange={(e) => setForm({ ...form, recommend_time: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="售票開始日期（如：2026/6月開放）" value={form.ticket_date} onChange={(e) => setForm({ ...form, ticket_date: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="購票網站連結" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full p-2.5 mb-3 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>儲存</button>
          </div>
        </Modal>
      )}

      {addToCalId && (
        <Modal onClose={() => setAddToCalId(null)}>
          <h3 className="font-bold text-base mb-1" style={{ color: C.brown }}>加入行程</h3>
          <p className="text-xs mb-3 opacity-60">{wishes.find((w) => w.id === addToCalId)?.title}</p>
          <label className="text-xs font-bold mb-1 block" style={{ color: C.brownLight }}>選擇日期</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {DATES.map((d) => (
              <button key={d} onClick={() => setCalForm({ ...calForm, date: d })}
                className="px-2 py-1.5 rounded-lg text-xs border font-medium"
                style={{ borderColor: calForm.date === d ? C.accent : "#eee", background: calForm.date === d ? C.pinkLight : isWkend(d) ? "#fff5f5" : "white", color: calForm.date === d ? C.accentDark : isWkend(d) ? C.red : C.brown }}>
                {d.slice(5).replace("-", "/")}({getWD(d)})
              </button>
            ))}
          </div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs font-bold mb-1 block" style={{ color: C.brownLight }}>開始時間</label>
              <select value={calForm.start_h} onChange={(e) => setCalForm({ ...calForm, start_h: Number(e.target.value) })} className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border }}>
                {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold mb-1 block" style={{ color: C.brownLight }}>結束時間</label>
              <select value={calForm.end_h} onChange={(e) => setCalForm({ ...calForm, end_h: Number(e.target.value) })} className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border }}>
                {HOURS.filter((h) => h > calForm.start_h).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
          </div>
          <button onClick={addToCal} className="w-full py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>確認加入</button>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// Tab 2: 行程 Calendar
// ============================================================
function CalendarTab({ events, eventOps, dates }) {
  const DATES = dates;
  const [selDate, setSelDate] = useState(DATES[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", start_h: 9, end_h: 10, location: "" });
  const touchStartX = useRef(null);
  const [slideDir, setSlideDir] = useState(null);

  const dayEvents = events.filter((e) => e.date === selDate).sort((a, b) => a.start_h - b.start_h);

  const handleSwipe = (diff) => {
    if (Math.abs(diff) < 50) return;
    const idx = DATES.indexOf(selDate);
    if (diff < 0 && idx < DATES.length - 1) { setSlideDir("left"); setTimeout(() => { setSelDate(DATES[idx + 1]); setSlideDir(null); }, 180); }
    if (diff > 0 && idx > 0) { setSlideDir("right"); setTimeout(() => { setSelDate(DATES[idx - 1]); setSlideDir(null); }, 180); }
  };
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => { if (touchStartX.current === null) return; handleSwipe(e.changedTouches[0].clientX - touchStartX.current); touchStartX.current = null; };
  const onMouseDown = (e) => { touchStartX.current = e.clientX; };
  const onMouseUp = (e) => { if (touchStartX.current === null) return; handleSwipe(e.clientX - touchStartX.current); touchStartX.current = null; };

  const addEvent = () => {
    if (!form.title) return;
    eventOps.add({ title: form.title, date: selDate, start_h: form.start_h, end_h: form.end_h, location: form.location, price: 0, currency: "JPY" });
    setShowForm(false);
  };

  const removeEvent = (id) => eventOps.remove(id);

  const PAD_TOP = 16;
  const timeToTop = (h) => PAD_TOP + (h - 7) * 56;
  const totalHeight = PAD_TOP + (22 - 7) * 56 + 40;

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-white border-b overflow-x-auto" style={{ borderColor: C.border }}>
        <div className="flex px-2 py-2 gap-1" style={{ minWidth: "max-content" }}>
          {DATES.map((d) => {
            const wd = getWD(d); const wk = isWkend(d); const sel = selDate === d;
            const hasEvents = events.some((e) => e.date === d);
            return (
              <button key={d} onClick={() => setSelDate(d)} className="flex flex-col items-center px-2.5 py-1.5 rounded-xl relative"
                style={{ background: sel ? C.accent : "transparent", color: sel ? "white" : wk ? C.red : C.brown, minWidth: 44, boxShadow: sel ? "0 2px 8px rgba(232,144,156,0.3)" : "none" }}>
                <span className="text-xs font-medium">{wd}</span>
                <span className="text-sm font-bold">{d.slice(8)}</span>
                {hasEvents && !sel && <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: C.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 flex justify-end">
        <span className="text-xs opacity-50">{dayEvents.length} 個行程</span>
      </div>

      <div className="mx-3 relative select-none overflow-hidden" style={{ height: totalHeight, cursor: "grab" }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
        <div style={{ transition: "transform 0.18s ease-out, opacity 0.18s ease-out", transform: slideDir === "left" ? "translateX(-60px)" : slideDir === "right" ? "translateX(60px)" : "translateX(0)", opacity: slideDir ? 0.3 : 1 }}>
          {HOURS.map((h) => (
            <div key={h} className="absolute left-0 right-0 flex items-start" style={{ top: timeToTop(h) }}>
              <span className="text-xs w-10 text-right pr-2 -mt-2 flex-shrink-0" style={{ color: "#bbb" }}>{String(h).padStart(2, "0")}:00</span>
              <div className="flex-1 border-t" style={{ borderColor: "#f0ebe5" }} />
            </div>
          ))}
          {dayEvents.map((ev) => {
            const top = timeToTop(ev.start_h) + 1;
            const height = (ev.end_h - ev.start_h) * 56 - 2;
            return (
              <div key={ev.id} className="absolute rounded-xl px-3 py-2 overflow-hidden"
                style={{ top, height: Math.max(height, 28), left: 48, right: 8, background: "linear-gradient(135deg, #fff0f3, #fdf6e3)", border: "1.5px solid " + C.accent + "55" }}>
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate" style={{ color: C.brown }}>{ev.title}</p>
                    {ev.location && <p className="text-xs truncate opacity-50 mt-0.5">📍 {ev.location}</p>}
                    <p className="text-xs opacity-40 mt-0.5">{String(ev.start_h).padStart(2, "0")}:00 - {String(ev.end_h).padStart(2, "0")}:00</p>
                  </div>
                  <button onClick={() => removeEvent(ev.id)} className="text-xs opacity-30 hover:opacity-80 ml-1">✕</button>
                </div>
              </div>
            );
          })}
          {dayEvents.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ left: 48 }}>
              <p className="text-xs opacity-30">這天還沒有行程</p>
            </div>
          )}
        </div>
      </div>

      <button onClick={() => { setForm({ title: "", start_h: 9, end_h: 10, location: "" }); setShowForm(true); }}
        className="fixed z-40 rounded-full flex items-center justify-center text-white text-2xl font-bold"
        style={{ width: 48, height: 48, borderRadius: "50%", background: "#e8909c", bottom: 80, left: "50%", transform: "translateX(-50%)" }}>
        ＋
      </button>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="font-bold text-base mb-3" style={{ color: C.brown }}>新增行程 — {selDate.slice(5).replace("-", "/")}</h3>
          <input placeholder="行程名稱 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="地點（選填）" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs font-bold mb-1 block" style={{ color: C.brownLight }}>開始</label>
              <select value={form.start_h} onChange={(e) => setForm({ ...form, start_h: Number(e.target.value) })} className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border }}>
                {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold mb-1 block" style={{ color: C.brownLight }}>結束</label>
              <select value={form.end_h} onChange={(e) => setForm({ ...form, end_h: Number(e.target.value) })} className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border }}>
                {HOURS.filter((h) => h > form.start_h).map((h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
              </select>
            </div>
          </div>
          <button onClick={addEvent} className="w-full py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>確認新增</button>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// Tab 3: 許願清單 (grouped by store)
// ============================================================
function WishlistTab({ tripId }) {
  const [items, itemOps] = useSupabaseTable("shopwish", tripId);
  const [storeList, setStoreList] = useLocalStore(`store_list_${tripId}`, []);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", store: "", price: "", currency: "JPY" });
  const [priceItemId, setPriceItemId] = useState(null);
  const [priceForm, setPriceForm] = useState({ store: "", price: "" });
  const [showNewStore, setShowNewStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");

  const openNew = (storeName) => { setForm({ name: "", store: storeName || "", price: "", currency: "JPY" }); setEditId(null); setShowForm(true); };
  const openEdit = (it) => { setForm({ name: it.name, store: it.store, price: String(it.price), currency: it.currency }); setEditId(it.id); setShowForm(true); };

  const save = () => {
    if (!form.name) return;
    if (editId) {
      itemOps.update(editId, { ...form, price: Number(form.price) || 0 });
    } else {
      itemOps.add({ ...form, price: Number(form.price) || 0, prices: [] });
    }
    setShowForm(false);
  };

  const addStore = () => {
    if (!newStoreName || storeList.includes(newStoreName)) return;
    setStoreList((p) => [...p, newStoreName]);
    setForm({ ...form, store: newStoreName });
    setNewStoreName("");
    setShowNewStore(false);
  };

  const remove = (id) => { if (confirm("刪除此項目？")) itemOps.remove(id); };

  const addPrice = () => {
    if (!priceForm.price) return;
    const item = items.find(it => it.id === priceItemId);
    if (item) itemOps.update(priceItemId, { prices: [...(item.prices || []), { store: priceForm.store, price: Number(priceForm.price), id: uid() }] });
    setPriceForm({ store: "", price: "" });
  };

  const removePrice = (itemId, priceId) => {
    const item = items.find(it => it.id === itemId);
    if (item) itemOps.update(itemId, { prices: item.prices.filter((pr) => pr.id !== priceId) });
  };

  // Group by store
  const stores = [...new Set(items.map((i) => i.store || "未分類"))];

  return (
    <div className="p-3 pb-20">
      {stores.map((storeName) => {
        const storeItems = items.filter((i) => (i.store || "未分類") === storeName);
        return (
          <div key={storeName} className="mb-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-bold flex items-center gap-1.5" style={{ color: C.brown }}><img src={ICON_TEMPLE} alt="" style={{ width: 18, height: 18 }} />{storeName}</h3>
              <button onClick={() => openNew(storeName)} className="text-xs font-bold" style={{ color: C.accent }}>＋ 新增</button>
            </div>
            {storeItems.map((it) => {
              const cheapest = it.prices && it.prices.length > 0 ? Math.min(...it.prices.map((p) => p.price)) : null;
              return (
                <div key={it.id} className="rounded-xl border mb-2 overflow-hidden" style={{ borderColor: C.border, background: C.card }}>
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm" style={{ color: C.brown }}>{it.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(it)} className="w-5 h-5"><img src={ICON_PEN} alt="edit" className="w-full h-full" /></button>
                        <button onClick={() => remove(it.id)} className="text-xs px-1 opacity-40 hover:opacity-80">✕</button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold" style={{ color: C.accent }}>
                        {it.currency === "JPY" ? "¥" : "NT$"}{it.price.toLocaleString()}
                      </span>
                      {cheapest !== null && cheapest < it.price && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: C.greenBg, color: C.green }}>最低 ¥{cheapest.toLocaleString()}</span>
                      )}
                    </div>
                    {it.prices && it.prices.length > 0 && (
                      <div className="mt-2 pt-2 border-t" style={{ borderColor: C.borderLight }}>
                        <p className="text-xs font-bold mb-1" style={{ color: C.brownLight }}>比價紀錄</p>
                        {it.prices.map((pr) => (
                          <div key={pr.id} className="flex justify-between items-center py-1 text-xs">
                            <span style={{ color: C.brown }}>{pr.store || "未標註"}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold" style={{ color: cheapest === pr.price ? C.green : C.brown }}>¥{pr.price.toLocaleString()}{cheapest === pr.price && " ★"}</span>
                              <button onClick={() => removePrice(it.id, pr.id)} className="opacity-30 hover:opacity-80">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: C.borderLight }}>
                      {priceItemId === it.id ? (
                        <div className="flex gap-2">
                          <input placeholder="商店名" value={priceForm.store} onChange={(e) => setPriceForm({ ...priceForm, store: e.target.value })} className="flex-1 p-1.5 rounded-lg border text-xs" style={{ borderColor: C.border }} />
                          <input placeholder="價格" type="number" value={priceForm.price} onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })} className="w-20 p-1.5 rounded-lg border text-xs" style={{ borderColor: C.border }} />
                          <button onClick={addPrice} className="px-3 py-1 rounded-lg text-white text-xs font-bold" style={{ background: "#e8909c" }}>+</button>
                          <button onClick={() => setPriceItemId(null)} className="text-xs opacity-50">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setPriceItemId(it.id); setPriceForm({ store: "", price: "" }); }} className="text-xs font-medium" style={{ color: C.accent }}><img src={ICON_SUCCESS} alt="" style={{ width: 16, height: 16, display: "inline", verticalAlign: "middle", marginRight: 4 }} />新增比價</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <button onClick={() => openNew("")} className="w-full py-4 rounded-xl border-dashed border-2 text-sm font-bold flex items-center justify-center"
        style={{ borderColor: C.accent, color: C.accent }}>
        ＋ 新增許願商品
      </button>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="font-bold text-base mb-3" style={{ color: C.brown }}>{editId ? "編輯商品" : "新增許願商品"}</h3>
          <input placeholder="商品名稱 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-2 mb-2">
            <select value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })} className="flex-1 p-2.5 rounded-lg border text-sm" style={{ borderColor: C.border, color: form.store ? C.brown : "#aaa" }}>
              <option value="">選擇商店分類</option>
              {storeList.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowNewStore(true)} className="w-10 h-10 rounded-lg border-2 border-dashed flex items-center justify-center text-sm"
              style={{ borderColor: "#ccc", color: "#aaa", flexShrink: 0 }}>＋</button>
          </div>
          {showNewStore && (
            <div className="flex gap-2 mb-2">
              <input placeholder="新商店名稱" value={newStoreName} onChange={(e) => setNewStoreName(e.target.value)}
                className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
              <button onClick={addStore} className="px-3 py-2 rounded-lg text-white text-xs font-bold" style={{ background: "#e8909c" }}>加入</button>
              <button onClick={() => setShowNewStore(false)} className="text-xs opacity-50">✕</button>
            </div>
          )}
          <div className="flex gap-2 mb-3">
            <input placeholder="預估價格" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="flex-1 p-2.5 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
              {["JPY", "TWD"].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, currency: c })} className="px-3 py-2 text-xs font-bold"
                  style={{ background: form.currency === c ? C.accent : "white", color: form.currency === c ? "white" : "#888" }}>
                  {c === "JPY" ? "¥" : "$"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>儲存</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// Tab 4: 記帳 (with daily totals, custom categories, qty)
// ============================================================
function ExpensesTab({ dates, tripId }) {
  const DATES = dates;
  const [expenses, expOps] = useSupabaseTable("expenses", tripId);
  const [cats, setCats] = useLocalStore(`exp_cats_${tripId}`, DEFAULT_CATS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", category: "食", description: "", amount: "", currency: "JPY", qty: "1" });
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ id: "", icon: "🏷" });
  const [selDate, setSelDate] = useState(DATES[0]);
  const touchStartX = useRef(null);

  const add = () => {
    if (!form.amount || isNaN(Number(form.amount))) return;
    const qty = Math.max(1, parseInt(form.qty) || 1);
    expOps.add({ ...form, amount: Number(form.amount) * qty, qty });
    setForm({ date: form.date, category: "食", description: "", amount: "", currency: "JPY", qty: "1" });
    setShowForm(false);
  };

  const addCat = () => {
    if (!catForm.id) return;
    const colors = ["#d84315", "#1b5e20", "#4527a0", "#0d47a1", "#bf360c", "#263238"];
    setCats((p) => [...p, { id: catForm.id, icon: catForm.icon, color: colors[p.length % colors.length] }]);
    setShowCatForm(false);
    setCatForm({ id: "", icon: "🏷" });
  };

  const remove = (id) => expOps.remove(id);

  const totalJPY = expenses.filter((e) => e.currency === "JPY").reduce((s, e) => s + e.amount, 0);
  const totalTWD = expenses.filter((e) => e.currency === "TWD").reduce((s, e) => s + e.amount, 0);
  const grand = totalTWD + Math.round(totalJPY * JPY_TO_TWD);

  const getCat = (id) => cats.find((c) => c.id === id) || cats[cats.length - 1] || { id: "?", icon: "❓", color: "#999" };

  // Daily totals
  const dayExpenses = expenses.filter((e) => e.date === selDate);
  const dayJPY = dayExpenses.filter((e) => e.currency === "JPY").reduce((s, e) => s + e.amount, 0);
  const dayTWD = dayExpenses.filter((e) => e.currency === "TWD").reduce((s, e) => s + e.amount, 0);

  const handleSwipe = (diff) => {
    if (Math.abs(diff) < 50) return;
    const idx = DATES.indexOf(selDate);
    if (diff < 0 && idx < DATES.length - 1) setSelDate(DATES[idx + 1]);
    if (diff > 0 && idx > 0) setSelDate(DATES[idx - 1]);
  };

  return (
    <div className="p-3 pb-20">
      {/* Total summary - gradient with bottom-right 20% yellow */}
      <div className="rounded-xl p-4 mb-3 relative overflow-hidden" style={{ background: "#e8909c", color: "white" }}>
        <div className="absolute bottom-0 right-0 w-2/5 h-2/5" style={{ background: "linear-gradient(135deg, transparent 30%, #f0d08040 60%, #f0d08080 100%)", borderTopLeftRadius: 80 }} />
        <p className="text-xs opacity-80">總支出（折合台幣）</p>
        <p className="text-3xl font-bold mt-1">NT${grand.toLocaleString()}</p>
        <div className="flex gap-4 mt-2 text-xs opacity-80">
          <span>¥{totalJPY.toLocaleString()} JPY</span>
          <span>NT${totalTWD.toLocaleString()} TWD</span>
        </div>
      </div>

      {/* Daily date strip */}
      <div className="rounded-xl border mb-3 overflow-hidden" style={{ borderColor: C.border }}>
        <div className="overflow-x-auto" onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { if (touchStartX.current === null) return; handleSwipe(e.changedTouches[0].clientX - touchStartX.current); touchStartX.current = null; }}>
          <div className="flex px-2 py-2 gap-1" style={{ minWidth: "max-content" }}>
            {DATES.map((d) => {
              const wd = getWD(d); const sel = selDate === d;
              const dayHasExp = expenses.some((e) => e.date === d);
              return (
                <button key={d} onClick={() => setSelDate(d)} className="flex flex-col items-center px-2 py-1 rounded-lg relative"
                  style={{ background: sel ? C.accent : "transparent", color: sel ? "white" : C.brown, minWidth: 38 }}>
                  <span style={{ fontSize: 10 }} className="font-medium">{wd}</span>
                  <span className="text-sm font-bold">{d.slice(8)}</span>
                  {dayHasExp && !sel && <span className="absolute bottom-0 w-1 h-1 rounded-full" style={{ background: C.accent }} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-3 py-2 border-t text-center" style={{ borderColor: C.borderLight, background: C.yellowLight }}>
          <p className="text-xs font-bold" style={{ color: C.accent }}>¥{dayJPY.toLocaleString()}</p>
          <p className="text-xs" style={{ color: C.accent2 }}>NT${(dayTWD + Math.round(dayJPY * JPY_TO_TWD)).toLocaleString()}</p>
        </div>
      </div>

      {/* Add button */}
      <button onClick={() => { setForm({ ...form, date: selDate }); setShowForm(true); }}
        className="w-full py-2.5 rounded-xl text-white font-bold text-sm mb-3" style={{ background: "#e8909c" }}>
        ＋ 記一筆
      </button>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl p-3 mb-3 border" style={{ borderColor: C.border, background: C.card }}>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full p-2 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-1 mb-2 flex-wrap items-center">
            {cats.map((c) => (
              <button key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                className="px-3 py-1.5 rounded-full text-xs border"
                style={{ borderColor: form.category === c.id ? c.color : "#ddd", background: form.category === c.id ? c.color + "15" : "white", color: form.category === c.id ? c.color : "#888", fontWeight: form.category === c.id ? "bold" : "normal" }}>
                {c.imgSrc ? <CatIcon src={c.imgSrc} /> : c.icon} {c.id}
              </button>
            ))}
            <button onClick={() => setShowCatForm(true)} className="w-8 h-8 rounded-full border-2 border-dashed flex items-center justify-center text-sm"
              style={{ borderColor: "#ccc", color: "#aaa" }}>＋</button>
          </div>
          {showCatForm && (
            <div className="flex gap-2 mb-2 p-2 rounded-lg" style={{ background: "#f9f5f0" }}>
              <input placeholder="分類名" value={catForm.id} onChange={(e) => setCatForm({ ...catForm, id: e.target.value })} className="flex-1 p-1.5 rounded-lg border text-xs" style={{ borderColor: C.border }} />
              <input placeholder="emoji" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="w-14 p-1.5 rounded-lg border text-xs text-center" style={{ borderColor: C.border }} />
              <button onClick={addCat} className="px-3 py-1 rounded-lg text-white text-xs font-bold" style={{ background: "#e8909c" }}>加</button>
            </div>
          )}
          <input placeholder="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-2 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-2 mb-2">
            <input placeholder="單價" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <input placeholder="數量" type="number" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} className="w-16 p-2 rounded-lg border text-sm text-center" style={{ borderColor: C.border }} />
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
              {["JPY", "TWD"].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, currency: c })} className="px-3 py-2 text-xs font-bold"
                  style={{ background: form.currency === c ? C.accent : "white", color: form.currency === c ? "white" : "#888" }}>
                  {c === "JPY" ? "¥" : "$"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
            <button onClick={add} className="flex-1 py-2 rounded-lg text-white text-sm font-bold" style={{ background: "#e8909c" }}>確認</button>
          </div>
        </div>
      )}

      {/* Expense list (filtered by selected date) */}
      {dayExpenses.length === 0 && !showForm && (
        <div className="text-center py-12 opacity-40">
          <img src={ICON_EXPENSE} alt="" style={{ width: 40, height: 40, margin: "0 auto 8px", opacity: 0.5 }} />
          <p className="text-sm">這天還沒有記帳紀錄</p>
        </div>
      )}
      {dayExpenses.map((exp) => {
        const cat = getCat(exp.category);
        return (
          <div key={exp.id} className="flex items-center gap-3 py-2.5 border-b" style={{ borderColor: C.borderLight }}>
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: cat.color + "15" }}>{cat.imgSrc ? <img src={cat.imgSrc} alt="" style={{ width: 20, height: 20 }} /> : cat.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: C.brown }}>{exp.description || exp.category}</div>
              <div className="text-xs opacity-50">{exp.date}{exp.qty > 1 ? ` × ${exp.qty}` : ""}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: C.accent }}>{exp.currency === "JPY" ? "¥" : "NT$"}{exp.amount.toLocaleString()}</div>
              {exp.currency === "JPY" && <div className="text-xs opacity-40">≈ NT${Math.round(exp.amount * JPY_TO_TWD).toLocaleString()}</div>}
            </div>
            <button onClick={() => remove(exp.id)} className="text-xs opacity-30 hover:opacity-80 ml-1">✕</button>
          </div>
        );
      })}
    </div>
  );
}


// ============================================================
// HomePage: 旅遊計畫列表
// ============================================================
const TRANSPORT_TYPES = ["✈ 飛機", "🚄 高鐵", "🚌 巴士", "🚗 自駕", "🚢 船"];

function HomePage({ trips, tripOps, onSelectTrip }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", startDate: DEFAULT_START, endDate: DEFAULT_END, transportType: "", transportNumber: "", depTime: "", depPlace: "", arrPlace: "", returnTransportType: "", returnTransportNumber: "", returnDepTime: "", returnDepPlace: "", returnArrPlace: "" });

  const resetForm = () => setForm({ name: "", startDate: DEFAULT_START, endDate: DEFAULT_END, transportType: "", transportNumber: "", depTime: "", depPlace: "", arrPlace: "", returnTransportType: "", returnTransportNumber: "", returnDepTime: "", returnDepPlace: "", returnArrPlace: "" });

  const openAdd = () => { resetForm(); setEditId(null); setShowForm(true); };
  const openEdit = (t) => {
    setForm({
      name: t.name, startDate: t.startDate, endDate: t.endDate,
      transportType: t.transport?.type || "", transportNumber: t.transport?.number || "",
      depTime: t.transport?.depTime || "", depPlace: t.transport?.depPlace || "", arrPlace: t.transport?.arrPlace || "",
      returnTransportType: t.returnTransport?.type || "", returnTransportNumber: t.returnTransport?.number || "",
      returnDepTime: t.returnTransport?.depTime || "", returnDepPlace: t.returnTransport?.depPlace || "", returnArrPlace: t.returnTransport?.arrPlace || "",
    });
    setEditId(t.id);
    setShowForm(true);
  };

  const save = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const tripData = {
      name: form.name, startDate: form.startDate, endDate: form.endDate,
      transport: form.transportType ? { type: form.transportType, number: form.transportNumber, depTime: form.depTime, depPlace: form.depPlace, arrPlace: form.arrPlace } : null,
      returnTransport: form.returnTransportType ? { type: form.returnTransportType, number: form.returnTransportNumber, depTime: form.returnDepTime, depPlace: form.returnDepPlace, arrPlace: form.returnArrPlace } : null,
    };
    if (editId) {
      tripOps.updateTrip(editId, tripData);
    } else {
      tripOps.addTrip(tripData);
    }
    setShowForm(false);
  };

  const removeTrip = (id) => tripOps.removeTrip(id);

  const calcDays = (s, e) => {
    const diff = (new Date(e) - new Date(s)) / 86400000;
    return Math.max(0, Math.round(diff) + 1);
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, maxWidth: 480, margin: "0 auto", fontFamily: "'Noto Sans TC', 'Hiragino Sans', sans-serif" }}>
      {/* Header */}
      <div className="relative overflow-hidden border-b-2 px-4 py-4 text-center" style={{ background: "linear-gradient(135deg, #fff0f3, #fdf6e3, #fff0f3)", borderColor: C.accent }}>
        <h1 className="text-xl font-bold" style={{ color: C.accentDark, fontFamily: "serif" }}>Joanna的療癒之旅</h1>
        <p className="text-xs mt-0.5" style={{ color: C.accent2 }}>為人生寫下充滿回憶的篇章</p>
      </div>

      <div className="p-4 pb-24">
        {/* Trip cards */}
        {trips.length === 0 && !showForm && (
          <div className="text-center py-16 opacity-40">
            <img src={ICON_ORIGAMI} alt="" style={{ width: 64, height: 64, margin: "0 auto 12px", opacity: 0.5 }} />
            <p className="text-sm">還沒有旅行計畫</p>
            <p className="text-xs mt-1">點擊下方按鈕新增一趟旅行吧！</p>
          </div>
        )}

        {trips.map((t) => {
          const days = calcDays(t.startDate, t.endDate);
          return (
            <div key={t.id} className="rounded-2xl mb-3 overflow-hidden border" style={{ background: C.card, borderColor: C.border }}>
              <div className="p-4 cursor-pointer" onClick={() => onSelectTrip(t)}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-bold" style={{ color: C.brown }}>{t.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: C.pink, color: C.accentDark }}>{days} 天</span>
                </div>
                <div className="text-xs mb-2" style={{ color: C.brownLight }}>
                  {t.startDate.replace(/-/g, "/")} → {t.endDate.replace(/-/g, "/")}
                </div>
                {t.transport && (
                  <div className="text-xs p-2 rounded-lg mb-1" style={{ background: C.pinkLight, color: C.brown }}>
                    <span className="font-medium">去程</span>　{t.transport.type}{t.transport.number ? ` ${t.transport.number}` : ""}{t.transport.depTime ? ` · ${t.transport.depTime}` : ""}{t.transport.depPlace && t.transport.arrPlace ? ` · ${t.transport.depPlace} → ${t.transport.arrPlace}` : ""}
                  </div>
                )}
                {t.returnTransport && (
                  <div className="text-xs p-2 rounded-lg" style={{ background: C.yellowLight, color: C.brown }}>
                    <span className="font-medium">回程</span>　{t.returnTransport.type}{t.returnTransport.number ? ` ${t.returnTransport.number}` : ""}{t.returnTransport.depTime ? ` · ${t.returnTransport.depTime}` : ""}{t.returnTransport.depPlace && t.returnTransport.arrPlace ? ` · ${t.returnTransport.depPlace} → ${t.returnTransport.arrPlace}` : ""}
                  </div>
                )}
              </div>
              <div className="flex border-t" style={{ borderColor: C.borderLight }}>
                <button onClick={() => openEdit(t)} className="flex-1 py-2 text-xs font-medium flex items-center justify-center gap-1" style={{ color: C.brownLight }}>
                  <img src={ICON_PEN} alt="" style={{ width: 12, height: 12 }} /> 編輯
                </button>
                <div style={{ width: 1, background: C.borderLight }} />
                <button onClick={() => removeTrip(t.id)} className="flex-1 py-2 text-xs font-medium" style={{ color: "#ccc" }}>刪除</button>
              </div>
            </div>
          );
        })}

        {/* Form */}
        {showForm && (
          <div className="rounded-2xl p-4 mb-3 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="text-sm font-bold mb-3" style={{ color: C.brown }}>{editId ? "編輯旅行" : "新增旅行"}</div>
            <input placeholder="旅行名稱（如：東京自由行 2026）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{ color: C.brownLight }}>出發日</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
              </div>
              <div className="text-sm pt-5" style={{ color: C.brownLight }}>→</div>
              <div className="flex-1">
                <label className="text-xs mb-1 block" style={{ color: C.brownLight }}>回程日</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
              </div>
            </div>
            {form.startDate && form.endDate && (
              <div className="text-xs text-center mb-3 py-1 rounded-full" style={{ background: C.pink, color: C.accentDark }}>
                共 {calcDays(form.startDate, form.endDate)} 天
              </div>
            )}

            {/* 去程交通 */}
            <div className="text-xs font-bold mb-2" style={{ color: C.brownLight }}>去程交通（選填）</div>
            <div className="flex gap-1 mb-2 flex-wrap">
              {TRANSPORT_TYPES.map((tt) => (
                <button key={tt} onClick={() => setForm({ ...form, transportType: form.transportType === tt ? "" : tt })}
                  className="px-2.5 py-1.5 rounded-full text-xs border"
                  style={{ borderColor: form.transportType === tt ? C.accent : "#ddd", background: form.transportType === tt ? C.pinkLight : "white", color: form.transportType === tt ? C.accentDark : "#888", fontWeight: form.transportType === tt ? "bold" : "normal" }}>
                  {tt}
                </button>
              ))}
            </div>
            {form.transportType && (
              <div className="space-y-2 mb-3 p-2.5 rounded-lg" style={{ background: C.pinkLight }}>
                <input placeholder="班次編號（如：CI-100）" value={form.transportNumber} onChange={(e) => setForm({ ...form, transportNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                <input placeholder="出發時間（如：08:30）" value={form.depTime} onChange={(e) => setForm({ ...form, depTime: e.target.value })}
                  className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                <div className="flex gap-2">
                  <input placeholder="出發地" value={form.depPlace} onChange={(e) => setForm({ ...form, depPlace: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                  <div className="text-sm pt-2" style={{ color: C.brownLight }}>→</div>
                  <input placeholder="到達地" value={form.arrPlace} onChange={(e) => setForm({ ...form, arrPlace: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                </div>
              </div>
            )}

            {/* 回程交通 */}
            <div className="text-xs font-bold mb-2" style={{ color: C.brownLight }}>回程交通（選填）</div>
            <div className="flex gap-1 mb-2 flex-wrap">
              {TRANSPORT_TYPES.map((tt) => (
                <button key={tt} onClick={() => setForm({ ...form, returnTransportType: form.returnTransportType === tt ? "" : tt })}
                  className="px-2.5 py-1.5 rounded-full text-xs border"
                  style={{ borderColor: form.returnTransportType === tt ? C.accent : "#ddd", background: form.returnTransportType === tt ? C.yellowLight : "white", color: form.returnTransportType === tt ? C.accentDark : "#888", fontWeight: form.returnTransportType === tt ? "bold" : "normal" }}>
                  {tt}
                </button>
              ))}
            </div>
            {form.returnTransportType && (
              <div className="space-y-2 mb-3 p-2.5 rounded-lg" style={{ background: C.yellowLight }}>
                <input placeholder="班次編號（如：CI-101）" value={form.returnTransportNumber} onChange={(e) => setForm({ ...form, returnTransportNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                <input placeholder="出發時間（如：18:00）" value={form.returnDepTime} onChange={(e) => setForm({ ...form, returnDepTime: e.target.value })}
                  className="w-full p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                <div className="flex gap-2">
                  <input placeholder="出發地" value={form.returnDepPlace} onChange={(e) => setForm({ ...form, returnDepPlace: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                  <div className="text-sm pt-2" style={{ color: C.brownLight }}>→</div>
                  <input placeholder="到達地" value={form.returnArrPlace} onChange={(e) => setForm({ ...form, returnArrPlace: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>
                {editId ? "儲存" : "建立旅行"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add button */}
      {!showForm && (
        <button onClick={openAdd}
          className="fixed flex items-center justify-center text-white text-2xl font-bold z-50"
          style={{ bottom: 24, right: "calc(50% - 220px)", width: 52, height: 52, borderRadius: "50%", background: "#e8909c", boxShadow: "0 2px 12px rgba(232,144,156,0.4)" }}>
          ＋
        </button>
      )}
    </div>
  );
}

// ============================================================
// TripView: 單一旅遊的四個 Tab 頁面
// ============================================================
function TripView({ trip, onBack }) {
  const [tab, setTab] = useState("wishtrip");
  const [wishes, wishOps] = useSupabaseTable("wishes", trip.id);
  const [events, eventOps] = useSupabaseTable("events", trip.id);
  const DATES = useMemo(() => makeDates(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, maxWidth: 480, margin: "0 auto", fontFamily: "'Noto Sans TC', 'Hiragino Sans', sans-serif" }}>
      {/* Trip Header with back button */}
      <div className="relative overflow-hidden border-b-2 px-4 py-3" style={{ background: "linear-gradient(135deg, #fff0f3, #fdf6e3, #fff0f3)", borderColor: C.accent }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(232,144,156,0.15)" }}>
            <img src={ICON_BACK} alt="" style={{ width: 18, height: 18 }} />
          </button>
          <div className="flex-1 text-center pr-8">
            <h1 className="text-lg font-bold" style={{ color: C.accentDark, fontFamily: "serif" }}>{trip.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: C.accent2 }}>{trip.startDate.replace(/-/g, "/")} → {trip.endDate.replace(/-/g, "/")}</p>
          </div>
        </div>
      </div>
      <div className="pb-16">
        {tab === "wishtrip" && <WishTripTab wishes={wishes} wishOps={wishOps} events={events} eventOps={eventOps} dates={DATES} />}
        {tab === "calendar" && <CalendarTab events={events} eventOps={eventOps} dates={DATES} />}
        {tab === "wishlist" && <WishlistTab tripId={trip.id} />}
        {tab === "expenses" && <ExpensesTab dates={DATES} tripId={trip.id} />}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function App() {
  const [trips, tripOps] = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(null);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || null;

  if (selectedTrip) {
    return <TripView trip={selectedTrip} onBack={() => setSelectedTripId(null)} />;
  }

  return <HomePage trips={trips} tripOps={tripOps} onSelectTrip={(t) => setSelectedTripId(t.id)} />;
}
