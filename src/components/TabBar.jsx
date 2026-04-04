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
