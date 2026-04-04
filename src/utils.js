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
