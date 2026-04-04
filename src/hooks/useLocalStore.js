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
