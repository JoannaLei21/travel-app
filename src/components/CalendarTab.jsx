import { useState, useRef } from "react";
import { C } from "../theme";
import { getWD, isWkend, HOURS, JPY_TO_TWD } from "../utils";
import { ICON_CAT_SHINKANSEN } from "../constants";
import Modal from "./Modal";

export default function CalendarTab({ events, eventOps, dates }) {
  const DATES = dates;
  const [selDate, setSelDate] = useState(DATES[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", start_h: 9, end_h: 10, location: "", price: "", currency: "JPY" });
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
    eventOps.add({ title: form.title, date: selDate, start_h: form.start_h, end_h: form.end_h, location: form.location, price: Number(form.price) || 0, currency: form.currency });
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
                style={{ background: sel ? C.accent : wk ? "#fff5f5" : "transparent", color: sel ? "white" : wk ? C.red : C.brown, minWidth: 44 }}>
                <span style={{ fontSize: 10 }} className="font-medium">{wd}</span>
                <span className="text-sm font-bold">{d.slice(8)}</span>
                {hasEvents && !sel && <span className="absolute bottom-0.5 w-1 h-1 rounded-full" style={{ background: C.accent }} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mx-3 mt-2" style={{ height: totalHeight }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseUp={onMouseUp}>
        {HOURS.map((h) => (
          <div key={h} className="absolute left-0 right-0 flex items-start" style={{ top: timeToTop(h) }}>
            <span className="w-10 text-xs text-right pr-2 -mt-2 select-none" style={{ color: "#bbb" }}>{String(h).padStart(2, "0")}:00</span>
            <div className="flex-1 border-t" style={{ borderColor: C.borderLight }} />
          </div>
        ))}

        {dayEvents.map((ev) => {
          const top = timeToTop(ev.start_h);
          const height = (ev.end_h - ev.start_h) * 56;
          return (
            <div key={ev.id} className="absolute left-12 right-2 rounded-xl p-2 border overflow-hidden"
              style={{ top, height, minHeight: 56, background: ev.wish_id ? C.pinkLight : C.yellowLight, borderColor: ev.wish_id ? C.accent : C.accent2, zIndex: 2 }}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold" style={{ color: C.brown }}>{ev.title}</p>
                  <p className="text-xs opacity-40 mt-0.5">{String(ev.start_h).padStart(2, "0")}:00 ~ {String(ev.end_h).padStart(2, "0")}:00</p>
                  {ev.location && <p className="text-xs opacity-50 mt-0.5"><img src={ICON_CAT_SHINKANSEN} alt="" style={{ width: 13, height: 13, display: "inline", verticalAlign: "middle", marginRight: 3 }} />{ev.location}</p>}
                  {ev.price > 0 && (
                    <p className="text-xs font-bold mt-0.5" style={{ color: C.accent }}>
                      {ev.currency === "JPY" ? "¥" : "NT$"}{ev.price.toLocaleString()}
                      {ev.currency === "JPY" && <span className="font-normal opacity-40"> ≈ NT${Math.round(ev.price * JPY_TO_TWD).toLocaleString()}</span>}
                    </p>
                  )}
                </div>
                <button onClick={() => removeEvent(ev.id)} className="text-xs opacity-30 hover:opacity-80">✕</button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={() => { setForm({ title: "", start_h: 9, end_h: 10, location: "", price: "", currency: "JPY" }); setShowForm(true); }}
        className="fixed z-40 flex items-center justify-center text-white text-xl font-bold shadow-lg"
        style={{ width: 48, height: 48, borderRadius: "50%", background: "#e8909c", bottom: 80, left: "50%", transform: "translateX(-50%)" }}>
        ＋
      </button>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="font-bold text-base mb-3" style={{ color: C.brown }}>新增行程 — {selDate.slice(5).replace("-", "/")}</h3>
          <input placeholder="行程名稱 *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <input placeholder="地點（選填）" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full p-2.5 mb-2 rounded-lg border text-sm" style={{ borderColor: C.border }} />
          <div className="flex gap-2 mb-2">
            <input placeholder="預估費用" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="flex-1 p-2.5 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: C.border }}>
              {["JPY", "TWD"].map((c) => (
                <button key={c} onClick={() => setForm({ ...form, currency: c })} className="px-3 py-2 text-xs font-bold"
                  style={{ background: form.currency === c ? C.accent : "white", color: form.currency === c ? "white" : "#888" }}>
                  {c === "JPY" ? "¥ 日圓" : "$ 台幣"}
                </button>
              ))}
            </div>
          </div>
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
