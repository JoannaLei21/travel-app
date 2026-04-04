import { useState, useRef } from "react";
import { C } from "../theme";
import { getWD, JPY_TO_TWD } from "../utils";
import { ICON_EXPENSE } from "../constants";
import { DEFAULT_CATS } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import { useLocalStore } from "../hooks/useLocalStore";
import CatIcon from "./CatIcon";

export default function ExpensesTab({ dates, tripId }) {
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

  // 當日統計
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
      {/* 總支出 */}
      <div className="rounded-xl p-4 mb-3 relative overflow-hidden" style={{ background: "#e8909c", color: "white" }}>
        <div className="absolute bottom-0 right-0 w-2/5 h-2/5" style={{ background: "linear-gradient(135deg, transparent 30%, #f0d08040 60%, #f0d08080 100%)", borderTopLeftRadius: 80 }} />
        <p className="text-xs opacity-80">總支出（折合台幣）</p>
        <p className="text-3xl font-bold mt-1">NT${grand.toLocaleString()}</p>
        <div className="flex gap-4 mt-2 text-xs opacity-80">
          <span>¥{totalJPY.toLocaleString()} JPY</span>
          <span>NT${totalTWD.toLocaleString()} TWD</span>
        </div>
      </div>

      {/* 日期選擇列 */}
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

      {/* 記帳按鈕 */}
      <button onClick={() => { setForm({ ...form, date: selDate }); setShowForm(true); }}
        className="w-full py-2.5 rounded-xl text-white font-bold text-sm mb-3" style={{ background: "#e8909c" }}>
        ＋ 記一筆
      </button>

      {/* 表單 */}
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

      {/* 當日消費列表 */}
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
              <div className="text-xs opacity-50">
                {exp.qty > 1
                  ? `${exp.currency === "JPY" ? "¥" : "NT$"}${Math.round(exp.amount / exp.qty).toLocaleString()} × ${exp.qty}`
                  : exp.date}
              </div>
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
