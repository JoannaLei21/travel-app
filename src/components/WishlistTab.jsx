import { useState } from "react";
import { C } from "../theme";
import { JPY_TO_TWD, uid } from "../utils";
import { ICON_PEN, ICON_TEMPLE, ICON_SUCCESS } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import { useLocalStore } from "../hooks/useLocalStore";
import Modal from "./Modal";

export default function WishlistTab({ tripId }) {
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

  // 依商店分組
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
