import { useState } from "react";
import { C } from "../theme";
import { JPY_TO_TWD, HOURS } from "../utils";
import { ICON_PEN, ICON_STOPWATCH } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import Modal from "./Modal";

const FOOD_CATS = [
  { id: "正餐", color: "#e65100" },
  { id: "甜點", color: "#d4a05a" },
  { id: "咖啡廳", color: "#5a9e4b" },
];

export default function FoodListTab({ tripId, events, eventOps, dates }) {
  const [foods, foodOps] = useSupabaseTable("food_wishes", tripId);
  const DATES = dates;
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "正餐", price: "", currency: "JPY", business_hours: "", nearest_station: "", url: "", reservation_url: "" });
  const [addToCalId, setAddToCalId] = useState(null);
  const [calForm, setCalForm] = useState({ date: DATES[0], start_h: 11, end_h: 13 });

  const openNew = () => { setForm({ name: "", category: "正餐", price: "", currency: "JPY", business_hours: "", nearest_station: "", url: "", reservation_url: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (f) => { setForm({ name: f.name, category: f.category, price: String(f.price), currency: f.currency, business_hours: f.business_hours || "", nearest_station: f.nearest_station || "", url: f.url || "", reservation_url: f.reservation_url || "" }); setEditId(f.id); setShowForm(true); };

  const save = () => {
    if (!form.name) return;
    if (editId) {
      foodOps.update(editId, { ...form, price: Number(form.price) || 0 });
    } else {
      foodOps.add({ ...form, price: Number(form.price) || 0, visited: false, booked: false });
    }
    setShowForm(false);
  };

  const remove = (id) => { if (confirm("刪除此餐廳？")) foodOps.remove(id); };
  const toggleVisited = (id) => { const f = foods.find(x => x.id === id); if (f) foodOps.update(id, { visited: !f.visited }); };
  const toggleBooked = (id) => { const f = foods.find(x => x.id === id); if (f) foodOps.update(id, { booked: !f.booked }); };

  const addToCal = () => {
    const food = foods.find((f) => f.id === addToCalId);
    if (!food) return;
    eventOps.add({ title: food.name, date: calForm.date, start_h: calForm.start_h, end_h: calForm.end_h, location: food.nearest_station, price: food.price, currency: food.currency, wish_id: null });
    setAddToCalId(null);
  };

  const getCatColor = (catId) => FOOD_CATS.find(c => c.id === catId)?.color || "#546e7a";

  // 依分類分組
  const grouped = FOOD_CATS.map(cat => ({
    ...cat,
    items: foods.filter(f => f.category === cat.id),
  })).filter(g => g.items.length > 0);

  // 未分類的
  const uncategorized = foods.filter(f => !FOOD_CATS.some(c => c.id === f.category));
  if (uncategorized.length > 0) grouped.push({ id: "其他", color: "#546e7a", items: uncategorized });

  return (
    <div className="p-3 pb-20">
      {grouped.map((group) => (
        <div key={group.id} className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: group.color }} />
            <h3 className="text-sm font-bold" style={{ color: C.brown }}>{group.id}</h3>
            <span className="text-xs opacity-40">({group.items.length})</span>
          </div>
          {group.items.map((f) => (
            <div key={f.id} className="rounded-xl border mb-3 overflow-hidden" style={{ borderColor: C.border, background: C.card }}>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm" style={{ color: C.brown }}>{f.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(f)} className="w-5 h-5"><img src={ICON_PEN} alt="edit" className="w-full h-full" /></button>
                    <button onClick={() => remove(f.id)} className="text-xs px-1 py-0.5 opacity-40 hover:opacity-80">✕</button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: getCatColor(f.category) + "15", color: getCatColor(f.category) }}>{f.category}</span>
                  {f.price > 0 ? (
                    <span className="text-sm font-bold" style={{ color: C.accent }}>{f.currency === "JPY" ? "¥" : "NT$"}{f.price.toLocaleString()}</span>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: C.green }}>價格未定</span>
                  )}
                  {f.price > 0 && f.currency === "JPY" && (
                    <span className="text-xs opacity-40">≈ NT${Math.round(f.price * JPY_TO_TWD).toLocaleString()}</span>
                  )}
                </div>
                {f.nearest_station && <p className="text-xs mt-1.5 opacity-60">🚉 {f.nearest_station}</p>}
                {f.business_hours && (
                  <p className="text-xs mt-1" style={{ color: C.accent2 }}>
                    <img src={ICON_STOPWATCH} alt="" style={{ width: 14, height: 14, display: "inline", verticalAlign: "middle", marginRight: 3 }} />
                    {f.business_hours}
                  </p>
                )}
                {f.url && <a href={f.url} target="_blank" rel="noreferrer" className="inline-block text-xs mt-1 underline" style={{ color: "#1565c0" }}>🔗 店家資訊</a>}
                {f.reservation_url && <a href={f.reservation_url} target="_blank" rel="noreferrer" className="inline-block text-xs mt-1 ml-3 underline" style={{ color: "#c62828" }}>📋 預約網站</a>}
                <div className="flex items-center gap-3 mt-3 pt-2 border-t" style={{ borderColor: C.borderLight }}>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: f.booked ? C.green : "#888" }}>
                    <input type="checkbox" checked={f.booked || false} onChange={() => toggleBooked(f.id)} className="accent-green-600" /> 已預約
                  </label>
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: f.visited ? C.green : "#888" }}>
                    <input type="checkbox" checked={f.visited || false} onChange={() => toggleVisited(f.id)} className="accent-green-600" /> 已造訪
                  </label>
                  <div className="flex-1" />
                  <button onClick={() => { setAddToCalId(f.id); setCalForm({ date: DATES[0], start_h: 11, end_h: 13 }); }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-bold"
                    style={{ background: "#e8909c", color: "white" }}>
                    ＋ 加入行程
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* 沒有分組時顯示全部 */}
      {grouped.length === 0 && foods.map((f) => (
        <div key={f.id} className="rounded-xl border mb-3 overflow-hidden" style={{ borderColor: C.border, background: C.card }}>
          <div className="p-3">
            <h3 className="font-bold text-sm" style={{ color: C.brown }}>{f.name}</h3>
          </div>
        </div>
      ))}

      <button onClick={openNew} className="w-full py-4 rounded-xl border-dashed border-2 text-sm font-bold flex items-center justify-center gap-1"
        style={{ borderColor: C.accent, color: C.accent }}>
        ＋ 新增許願餐廳
      </button>

      {/* 新增/編輯表單 */}
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="font-bold text-base mb-3" style={{ color: C.brown }}>{editId ? "編輯餐廳" : "新增許願餐廳"}</h3>
          <input placeholder="餐廳名稱 *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />

          {/* 分類選擇 */}
          <div className="flex gap-1.5 mb-3">
            {FOOD_CATS.map((cat) => (
              <button key={cat.id} onClick={() => setForm({ ...form, category: cat.id })}
                className="flex-1 py-2 rounded-lg text-xs font-bold border"
                style={{ borderColor: form.category === cat.id ? cat.color : "#ddd", background: form.category === cat.id ? cat.color + "15" : "white", color: form.category === cat.id ? cat.color : "#888" }}>
                {cat.id}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <input placeholder="預估價格（每人）" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="flex-1 p-2.5 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
              {["JPY", "TWD"].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, currency: c })} className="px-3 py-2 text-xs font-bold"
                  style={{ background: form.currency === c ? C.accent : "white", color: form.currency === c ? "white" : "#888" }}>
                  {c === "JPY" ? "¥ 日圓" : "$ 台幣"}
                </button>
              ))}
            </div>
          </div>
          <input placeholder="營業時間（如：11:00~21:00、週二休）" value={form.business_hours} onChange={(e) => setForm({ ...form, business_hours: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="最近車站（如：渋谷站步行 5 分鐘）" value={form.nearest_station} onChange={(e) => setForm({ ...form, nearest_station: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="店家網站 / Google Maps 連結" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="預約網站連結（如：Tabelog、Hot Pepper）" value={form.reservation_url} onChange={(e) => setForm({ ...form, reservation_url: e.target.value })} className="w-full p-2.5 mb-3 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
            <button onClick={save} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>儲存</button>
          </div>
        </Modal>
      )}

      {/* 加入行程 Modal */}
      {addToCalId && (
        <Modal onClose={() => setAddToCalId(null)}>
          <h3 className="font-bold text-base mb-1" style={{ color: C.brown }}>加入行程</h3>
          <p className="text-xs mb-3 opacity-60">{foods.find((f) => f.id === addToCalId)?.name}</p>
          <label className="text-xs font-bold mb-1 block" style={{ color: C.brownLight }}>選擇日期</label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {DATES.map((d) => (
              <button key={d} onClick={() => setCalForm({ ...calForm, date: d })}
                className="px-2 py-1.5 rounded-lg text-xs border font-medium"
                style={{ borderColor: calForm.date === d ? C.accent : "#eee", background: calForm.date === d ? C.pinkLight : "white", color: calForm.date === d ? C.accentDark : C.brown }}>
                {d.slice(5).replace("-", "/")}
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
