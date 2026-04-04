import {
  ICON_CAT_RAMEN, ICON_CAT_DANGO, ICON_CAT_SHINKANSEN,
  ICON_CAT_TICKET, ICON_CAT_BUY, ICON_CAT_GIFT_BOX,
  ICON_CAT_COIN, ICON_CAT_JAPANESE, ICON_CAT_MOTIVATION,
} from "./icons";

export const DEFAULT_START = "2026-08-20";
export const DEFAULT_END = "2026-09-10";

export const TRANSPORT_TYPES = ["✈ 飛機", "🚄 高鐵", "🚌 巴士", "🚗 自駕", "🚢 船"];

export const DEFAULT_CATS = [
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
