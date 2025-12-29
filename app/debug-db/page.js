"use client";

import { useState } from "react";
import { supabase } from "@/supabaseClient";

export default function DebugDB() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      setResult({ user, userError });
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const checkAllEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .order("date", { ascending: false });
      setResult({ allEntries: data, error });
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const checkMyEntries = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResult({ error: "Not logged in" });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      
      setResult({ myEntries: data, myUserId: user.id, error });
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  const checkAPIRoute = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setResult({ error: "Not logged in" });
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/getEntries?user_id=${user.id}`);
      const data = await res.json();
      setResult({ apiResponse: data, apiStatus: res.status, myUserId: user.id });
    } catch (err) {
      setResult({ error: err.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Database Debug Panel</h1>
      
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={checkUser} disabled={loading} style={btnStyle}>
          Check Current User
        </button>
        <button onClick={checkAllEntries} disabled={loading} style={btnStyle}>
          Check All Entries (No Filter)
        </button>
        <button onClick={checkMyEntries} disabled={loading} style={btnStyle}>
          Check My Entries (Filtered)
        </button>
        <button onClick={checkAPIRoute} disabled={loading} style={btnStyle}>
          Test API Route
        </button>
      </div>

      {result && (
        <pre style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          padding: 16,
          borderRadius: 8,
          fontSize: 13,
          overflowX: "auto",
          maxHeight: 600,
          overflowY: "auto",
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "10px 16px",
  background: "#4fc3a1",
  color: "white",
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 14,
};
