import { useState } from "react";
import { C } from "../theme";
import { getWD, isWkend, JPY_TO_TWD, HOURS } from "../utils";
import { ICON_PEN, ICON_STOPWATCH, ICON_TICKET, ICON_TVSCREEN } from "../constants";
import Modal from "./Modal";

export default function WishTripTab({ wishes, wishOps, events, eventOps, dates }) {
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
            {w.address && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(w.address)}`} target="_blank" rel="noreferrer"
                className="text-xs mt-1 inline-block hover:underline" style={{ color: "#1565c0" }}>📍 {w.address}</a>
            )}
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
