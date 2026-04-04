import { useState } from "react";
import { useTrips } from "./hooks/useSupabase";
import HomePage from "./components/HomePage";
import TripView from "./components/TripView";

export default function App() {
  const [trips, tripOps] = useTrips();
  const [selectedTripId, setSelectedTripId] = useState(null);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || null;

  if (selectedTrip) {
    return <TripView trip={selectedTrip} onBack={() => setSelectedTripId(null)} />;
  }

  return <HomePage trips={trips} tripOps={tripOps} onSelectTrip={(t) => setSelectedTripId(t.id)} />;
}
