import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

/**
 * Hook for fetching and mutating a Supabase table filtered by trip_id.
 * Returns [rows, { add, update, remove, setRows }]
 */
export function useSupabaseTable(table, tripId, defaultRows = []) {
  const [rows, setRows] = useState(defaultRows);
  const [loaded, setLoaded] = useState(false);

  // Fetch rows on mount / tripId change
  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("trip_id", tripId)
        .order("created_at", { ascending: true });
      if (!cancelled && !error) {
        setRows(data || []);
        setLoaded(true);
      }
    })();
    return () => { cancelled = true; };
  }, [table, tripId]);

  const add = useCallback(async (row) => {
    const payload = { ...row, trip_id: tripId };
    delete payload.id; // let Supabase generate id
    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (!error && data) setRows((prev) => [...prev, data]);
    return data;
  }, [table, tripId]);

  const update = useCallback(async (id, changes) => {
    const { error } = await supabase.from(table).update(changes).eq("id", id);
    if (!error) setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  }, [table]);

  const remove = useCallback(async (id) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) setRows((prev) => prev.filter((r) => r.id !== id));
  }, [table]);

  return [rows, { add, update, remove, setRows, loaded }];
}

/**
 * Hook for the trips table (no trip_id filter, top-level).
 */
export function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: true });
      if (!error) {
        setTrips(data || []);
        setLoaded(true);
      }
    })();
  }, []);

  const addTrip = useCallback(async (trip) => {
    const { data, error } = await supabase.from("trips").insert(trip).select().single();
    if (!error && data) setTrips((prev) => [...prev, data]);
    return data;
  }, []);

  const updateTrip = useCallback(async (id, changes) => {
    const { error } = await supabase.from("trips").update(changes).eq("id", id);
    if (!error) setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
  }, []);

  const removeTrip = useCallback(async (id) => {
    // Also delete related data
    await Promise.all([
      supabase.from("wishes").delete().eq("trip_id", id),
      supabase.from("events").delete().eq("trip_id", id),
      supabase.from("expenses").delete().eq("trip_id", id),
      supabase.from("shopwish").delete().eq("trip_id", id),
    ]);
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (!error) setTrips((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return [trips, { addTrip, updateTrip, removeTrip, loaded }];
}
