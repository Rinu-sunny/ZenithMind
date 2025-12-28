"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "@/supabaseClient";

// Emotion color mapping
const emotionColorMap = {
  Calm: "#3b82f6",
  Stressed: "#ef4444",
  Happy: "#22c55e",
  Anxious: "#f59e0b",
  Hopeful: "#8b5cf6",
  Sad: "#6b7280",
  Unknown: "#6b7280",
};

// Sentiment bar component
function SentimentBar({ value }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div style={{ width: 120 }}>
      <div
        style={{
          height: 6,
          background: "#e5e7eb",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 6,
            background:
              pct > 66
                ? "#22c55e"
                : pct > 33
                ? "#f59e0b"
                : "#ef4444",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginTop: 4,
          textAlign: "right",
        }}
      >
        {(value || 0).toFixed(2)}
      </div>
    </div>
  );
}

export default function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to view your entries");
        setLoading(false);
        return;
      }

      // Query Supabase directly instead of using API route to avoid RLS issues
      const { data, error: supabaseError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        setEntries([]);
      } else if (data && data.length > 0) {
        // Format entries for display
        const formattedEntries = data.map((entry) => {
          const contentText = entry.content || "";
          return {
            id: entry.id,
            date: new Date(entry.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            emotion: entry.emotion || "Unknown",
            sentiment: typeof entry.sentiment === "number" ? entry.sentiment : 0.5,
            preview: contentText.length > 0 ? contentText.slice(0, 150) : "No content",
            fullContent: contentText,
          };
        });
        setEntries(formattedEntries);
      } else {
        setEntries([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load entries");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main
        style={{
          background: "#e5e7eb",
          minHeight: "100vh",
          padding: "40px 28px",
          color: "#111827",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header Section */}
          <header style={{ marginBottom: 30 }}>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>
              History
            </p>

            <h1 style={{ margin: "6px 0 0 0", fontSize: 28 }}>
              Your Journal Entries
            </h1>

            <p style={{ marginTop: 8, color: "#6b7280", maxWidth: 700 }}>
              Review your past entries, track progress, and notice patterns in
              your emotions over time.
            </p>

            {/* Refresh button */}
            <button
              onClick={fetchEntries}
              disabled={loading}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                background: "#4fc3a1",
                color: "white",
                border: "none",
                borderRadius: 6,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </header>

          {/* Error State */}
          {error && (
            <div style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}>
              Error: {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#6b7280" }}>Loading your entries...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && entries.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ color: "#6b7280", fontSize: 16 }}>
                No entries yet. Start journaling to see them here!
              </p>
            </div>
          )}

          {/* Entries Grid */}
          {!loading && entries.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 20,
              }}
            >
              {entries.map((entry) => {
                const color = emotionColorMap[entry.emotion] || "#6b7280";

                return (
                  <article
                    key={entry.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 14,
                      padding: 18,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                          {entry.date}
                        </p>

                        <h3
                          style={{
                            margin: "6px 0 0 0",
                            fontSize: 18,
                            color: "#111827",
                            wordBreak: "break-word",
                          }}
                        >
                          {entry.preview.slice(0, 48)}{entry.preview.length > 48 ? "..." : ""}
                        </h3>
                      </div>

                      {/* Emotion Pill */}
                      <div
                        style={{
                          padding: "6px 10px",
                          background: `${color}22`,
                          color,
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          height: "fit-content",
                          whiteSpace: "nowrap",
                          minWidth: "80px",
                          textAlign: "center",
                        }}
                      >
                        {entry.emotion}
                      </div>
                    </div>

                    {/* Preview Text */}
                    <p style={{ color: "#374151", margin: 0, lineHeight: 1.45, minHeight: 60 }}>
                      {entry.preview}
                    </p>

                    {/* Sentiment Bar */}
                    <SentimentBar value={entry.sentiment} />

                    {/* Footer Buttons */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => alert("Full entry viewer coming soon")}
                        style={{
                          padding: "8px 12px",
                          background: "white",
                          border: "1px solid #d1d5db",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>

                      <span style={{ fontSize: 12, color: "#9ca3af" }}>
                        {entry.sentiment ? "AI Analysis" : "Pending"}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
