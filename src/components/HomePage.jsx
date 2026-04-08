import { useState } from "react";
import { C } from "../theme";
import { ICON_PEN, ICON_ORIGAMI } from "../constants";
import { DEFAULT_START, DEFAULT_END, TRANSPORT_TYPES } from "../constants";

const calcDays = (s, e) => {
  const diff = (new Date(e) - new Date(s)) / 86400000;
  return Math.max(0, Math.round(diff) + 1);
};

export default function HomePage({ trips, tripOps, onSelectTrip }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", startDate: DEFAULT_START, endDate: DEFAULT_END, transportType: "", transportNumber: "", depTime: "", arrTime: "", depPlace: "", arrPlace: "", returnTransportType: "", returnTransportNumber: "", returnDepTime: "", returnArrTime: "", returnDepPlace: "", returnArrPlace: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const resetForm = () => setForm({ name: "", startDate: DEFAULT_START, endDate: DEFAULT_END, transportType: "", transportNumber: "", depTime: "", arrTime: "", depPlace: "", arrPlace: "", returnTransportType: "", returnTransportNumber: "", returnDepTime: "", returnArrTime: "", returnDepPlace: "", returnArrPlace: "" });

  const openAdd = () => { resetForm(); setEditId(null); setShowForm(true); };
  const openEdit = (t) => {
    setForm({
      name: t.name, startDate: t.startDate, endDate: t.endDate,
      transportType: t.transport?.type || "", transportNumber: t.transport?.number || "",
      depTime: t.transport?.depTime || "", arrTime: t.transport?.arrTime || "", depPlace: t.transport?.depPlace || "", arrPlace: t.transport?.arrPlace || "",
      returnTransportType: t.returnTransport?.type || "", returnTransportNumber: t.returnTransport?.number || "",
      returnDepTime: t.returnTransport?.depTime || "", returnArrTime: t.returnTransport?.arrTime || "", returnDepPlace: t.returnTransport?.depPlace || "", returnArrPlace: t.returnTransport?.arrPlace || "",
    });
    setEditId(t.id);
    setShowForm(true);
  };

  const save = () => {
    if (!form.name || !form.startDate || !form.endDate) return;
    const tripData = {
      name: form.name, startDate: form.startDate, endDate: form.endDate,
      transport: form.transportType ? { type: form.transportType, number: form.transportNumber, depTime: form.depTime, arrTime: form.arrTime, depPlace: form.depPlace, arrPlace: form.arrPlace } : null,
      returnTransport: form.returnTransportType ? { type: form.returnTransportType, number: form.returnTransportNumber, depTime: form.returnDepTime, arrTime: form.returnArrTime, depPlace: form.returnDepPlace, arrPlace: form.returnArrPlace } : null,
    };
    if (editId) {
      tripOps.updateTrip(editId, tripData);
    } else {
      tripOps.addTrip(tripData);
    }
    setShowForm(false);
  };

  const removeTrip = (id) => {
    setDeleteConfirm(id);
  };
  const confirmDelete = () => {
    if (deleteConfirm) tripOps.removeTrip(deleteConfirm);
    setDeleteConfirm(null);
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, maxWidth: 480, margin: "0 auto", fontFamily: "'Noto Sans TC', 'Hiragino Sans', sans-serif" }}>
      {/* Header */}
      <div className="relative overflow-hidden border-b-2 px-4 py-4 text-center" style={{ background: "linear-gradient(135deg, #fff0f3, #fdf6e3, #fff0f3)", borderColor: C.accent }}>
        <h1 className="text-xl font-bold" style={{ color: C.accentDark, fontFamily: "serif" }}>Joanna的療癒之旅</h1>
        <p className="text-xs mt-0.5" style={{ color: C.accent2 }}>為人生寫下充滿回憶的篇章</p>
      </div>

      <div className="p-4 pb-24">
        {/* 空狀態 */}
        {trips.length === 0 && !showForm && (
          <div className="text-center py-16 opacity-40">
            <img src={ICON_ORIGAMI} alt="" style={{ width: 64, height: 64, margin: "0 auto 12px", opacity: 0.5 }} />
            <p className="text-sm">還沒有旅行計畫</p>
            <p className="text-xs mt-1">點擊下方按鈕新增一趟旅行吧！</p>
          </div>
        )}

        {/* 旅程卡片列表 */}
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
                    <div><span className="font-medium">去程</span>　{t.transport.type}{t.transport.number ? ` ${t.transport.number}` : ""}</div>
                    {(t.transport.depTime || t.transport.arrTime) && (
                      <div className="mt-1 opacity-70">
                        {t.transport.depTime && <span>出發 {t.transport.depTime}</span>}
                        {t.transport.depTime && t.transport.arrTime && <span> → </span>}
                        {t.transport.arrTime && <span>抵達 {t.transport.arrTime}</span>}
                      </div>
                    )}
                    {t.transport.depPlace && t.transport.arrPlace && (
                      <div className="mt-0.5 opacity-70">{t.transport.depPlace} → {t.transport.arrPlace}</div>
                    )}
                  </div>
                )}
                {t.returnTransport && (
                  <div className="text-xs p-2 rounded-lg" style={{ background: C.yellowLight, color: C.brown }}>
                    <div><span className="font-medium">回程</span>　{t.returnTransport.type}{t.returnTransport.number ? ` ${t.returnTransport.number}` : ""}</div>
                    {(t.returnTransport.depTime || t.returnTransport.arrTime) && (
                      <div className="mt-1 opacity-70">
                        {t.returnTransport.depTime && <span>出發 {t.returnTransport.depTime}</span>}
                        {t.returnTransport.depTime && t.returnTransport.arrTime && <span> → </span>}
                        {t.returnTransport.arrTime && <span>抵達 {t.returnTransport.arrTime}</span>}
                      </div>
                    )}
                    {t.returnTransport.depPlace && t.returnTransport.arrPlace && (
                      <div className="mt-0.5 opacity-70">{t.returnTransport.depPlace} → {t.returnTransport.arrPlace}</div>
                    )}
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

        {/* 新增/編輯表單 */}
        {showForm && (
          <div className="rounded-2xl p-5 mb-4 border" style={{ background: C.card, borderColor: C.border }}>
            <div className="text-sm font-bold mb-4" style={{ color: C.brown }}>{editId ? "編輯旅行" : "新增旅行"}</div>
            <input placeholder="旅行名稱（如：東京自由行 2026）" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 mb-3 rounded-lg border text-sm" style={{ borderColor: C.border }} />
            <div className="flex gap-3 mb-4">
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
            <div className="text-xs font-bold mb-2 mt-4" style={{ color: C.brownLight }}>去程交通（選填）</div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
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
                <div className="flex gap-2">
                  <input placeholder="出發時間（如：08:30）" value={form.depTime} onChange={(e) => setForm({ ...form, depTime: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                  <input placeholder="抵達時間（如：12:30）" value={form.arrTime} onChange={(e) => setForm({ ...form, arrTime: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                </div>
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
            <div className="text-xs font-bold mb-2 mt-4" style={{ color: C.brownLight }}>回程交通（選填）</div>
            <div className="flex gap-1.5 mb-3 flex-wrap">
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
                <div className="flex gap-2">
                  <input placeholder="出發時間（如：18:00）" value={form.returnDepTime} onChange={(e) => setForm({ ...form, returnDepTime: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                  <input placeholder="抵達時間（如：22:00）" value={form.returnArrTime} onChange={(e) => setForm({ ...form, returnArrTime: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                </div>
                <div className="flex gap-2">
                  <input placeholder="出發地" value={form.returnDepPlace} onChange={(e) => setForm({ ...form, returnDepPlace: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                  <div className="text-sm pt-2" style={{ color: C.brownLight }}>→</div>
                  <input placeholder="到達地" value={form.returnArrPlace} onChange={(e) => setForm({ ...form, returnArrPlace: e.target.value })}
                    className="flex-1 p-2 rounded-lg border text-sm" style={{ borderColor: C.border, background: "white" }} />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
              <button onClick={save} className="flex-1 py-3 rounded-xl text-white text-sm font-bold" style={{ background: "#e8909c" }}>
                {editId ? "儲存" : "建立旅行"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 新增按鈕 */}
      {!showForm && (
        <button onClick={openAdd}
          className="fixed flex items-center justify-center text-white text-2xl font-bold z-50"
          style={{ bottom: 24, left: "50%", transform: "translateX(-50%)", width: 52, height: 52, borderRadius: "50%", background: "#e8909c", boxShadow: "0 2px 12px rgba(232,144,156,0.4)" }}>
          ＋
        </button>
      )}

      {/* 刪除確認 toast */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-center mb-1" style={{ color: C.brown }}>確定要刪除這個旅行嗎？</p>
            <p className="text-xs text-center mb-4 opacity-50">相關的行程、許願清單、記帳資料都會一起刪除</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border text-sm" style={{ borderColor: "#ddd", color: "#888" }}>取消</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: "#d96b6b" }}>確定刪除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
