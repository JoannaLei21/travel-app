import { useState, useMemo } from "react";
import { C } from "../theme";
import { makeDates } from "../utils";
import { ICON_BACK } from "../constants";
import { useSupabaseTable } from "../hooks/useSupabase";
import TabBar from "./TabBar";
import WishTripTab from "./WishTripTab";
import CalendarTab from "./CalendarTab";
import FoodListTab from "./FoodListTab";
import WishlistTab from "./WishlistTab";
import ExpensesTab from "./ExpensesTab";

export default function TripView({ trip, onBack }) {
  const [tab, setTab] = useState("calendar");
  const [wishes, wishOps] = useSupabaseTable("wishes", trip.id);
  const [events, eventOps] = useSupabaseTable("events", trip.id);
  const DATES = useMemo(() => makeDates(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, maxWidth: 480, margin: "0 auto", fontFamily: "'Noto Sans TC', 'Hiragino Sans', sans-serif" }}>
      {/* 旅程 Header */}
      <div className="relative overflow-hidden border-b-2 px-4 py-3" style={{ background: "linear-gradient(135deg, #fff0f3, #fdf6e3, #fff0f3)", borderColor: C.accent }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: "rgba(232,144,156,0.15)" }}>
            <img src={ICON_BACK} alt="" style={{ width: 18, height: 18 }} />
          </button>
          <div className="flex-1 text-center pr-8">
            <h1 className="text-lg font-bold" style={{ color: C.accentDark, fontFamily: "serif" }}>{trip.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: C.accent2 }}>{trip.startDate.replace(/-/g, "/")} → {trip.endDate.replace(/-/g, "/")}</p>
          </div>
        </div>
      </div>
      <div className="pb-16">
        {tab === "calendar" && <CalendarTab events={events} eventOps={eventOps} dates={DATES} />}
        {tab === "wishtrip" && <WishTripTab wishes={wishes} wishOps={wishOps} events={events} eventOps={eventOps} dates={DATES} />}
        {tab === "foodlist" && <FoodListTab tripId={trip.id} events={events} eventOps={eventOps} dates={DATES} />}
        {tab === "wishlist" && <WishlistTab tripId={trip.id} />}
        {tab === "expenses" && <ExpensesTab dates={DATES} tripId={trip.id} />}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
