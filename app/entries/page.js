"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "@/supabaseClient";

// Emotion color mapping
const emotionColorMap = {
  Calm: "#6c8a8a",
  Stressed: "#c7746a",
  Happy: "#b28a3c",
  Anxious: "#c59b5c",
  Hopeful: "#7c91a1",
  Sad: "#8a7f73",
  Unknown: "#7d7468",
};

// Sentiment bar component
function SentimentBar({ value }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;

  return (
    <div style={{ width: 120 }}>
      <div
        style={{
          height: 6,
          background: "#e8f5e8",
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
                ? "#7cb87c"
                : pct > 33
                ? "#9bc49b"
                : "#c7746a",
            transition: "width 0.3s ease",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#6a766a",
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
  const [responseModal, setResponseModal] = useState(null); // { entryId, reflection, fullContent } or null
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
            reflection: entry.ai_reflection || "No AI reflection yet.",
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

  // Handle opening response modal
  const openResponseModal = (entryId, reflection, fullContent) => {
    // Embed the reflection prompt into the entry content as Q&A format
    const contentWithPrompt = reflection
      ? `${fullContent}\n\nQ: ${reflection}\nA: `
      : fullContent;
    
    setResponseModal({ entryId, reflection, fullContent });
    setEditContent(contentWithPrompt);
  };

  // Handle closing response modal
  const closeResponseModal = () => {
    setResponseModal(null);
    setEditContent("");
  };

  // Handle saving edited entry
  const saveResponse = async () => {
    if (!editContent.trim()) {
      alert("Please write something");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("journal_entries")
        .update({ content: editContent })
        .eq("id", responseModal.entryId);

      if (error) {
        alert("Failed to save: " + error.message);
      } else {
        alert("Entry updated!");
        closeResponseModal();
        fetchEntries(); // Refresh list
      }
    } catch (err) {
      alert("Error saving: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting an entry
  const deleteEntry = async (entryId) => {
    if (!confirm("Are you sure you want to delete this entry? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", entryId);

      if (error) {
        alert("Failed to delete: " + error.message);
      } else {
        alert("Entry deleted!");
        fetchEntries(); // Refresh list
      }
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  return (
    <>
      <Navbar />

      {/* Response Modal Overlay */}
      {responseModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(38,34,30,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeResponseModal}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 18,
              padding: 30,
              maxWidth: 720,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              border: "1px solid rgba(180, 190, 180, 0.35)",
              boxShadow: "0 12px 32px rgba(90, 100, 90, 0.12)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: "0 0 8px 0", fontSize: 22, color: "#2d3a2d", letterSpacing: "0.01em" }}>
              Continue this page
            </h2>

            {/* Reflection context in different color - only show if reflection exists */}
            {responseModal.reflection && (
              <div
                style={{
                  background: "#e8f5e8",
                  border: "1px solid rgba(124, 184, 124, 0.35)",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 20,
                }}
              >
                <p style={{ margin: 0, color: "#3a6a3a", fontWeight: 700, fontSize: 13, letterSpacing: "0.01em" }}>
                  Reflection
                </p>
                <p style={{ margin: "6px 0 0 0", color: "#3a4a3a", lineHeight: 1.55, fontStyle: "italic" }}>
                  {responseModal.reflection}
                </p>
              </div>
            )}

            {/* Original entry content to edit */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Your journal entry…"
              style={{
                width: "100%",
                height: 260,
                border: "1px solid #d8dcd8",
                borderRadius: 10,
                padding: 14,
                fontSize: 14,
                fontFamily: "Cambria, 'Times New Roman', serif",
                marginBottom: 16,
                boxSizing: "border-box",
                background: "#fafbfa",
                color: "#2d3a2d",
                lineHeight: 1.55,
              }}
            />

            {/* Action buttons */}
            <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
            >
              <button
                onClick={closeResponseModal}
                style={{
                  padding: "9px 16px",
                  background: "#f0f4f0",
                  border: "1px solid rgba(124, 184, 124, 0.35)",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#5a6a5a",
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveResponse}
                disabled={isSaving || !editContent.trim()}
                style={{
                  padding: "9px 16px",
                  background: "#7cb87c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  cursor: isSaving ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: isSaving ? 0.65 : 1,
                  boxShadow: "0 8px 16px rgba(110, 130, 110, 0.22)",
                }}
              >
                {isSaving ? "Saving…" : "Save page"}
              </button>
            </div>
          </div>
        </div>
      )}

      <main
        style={{
          background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #f4f6f4 100%)",
          minHeight: "100vh",
          padding: "48px 18px",
          color: "#2d3a2d",
          fontFamily: "Cambria, 'Times New Roman', serif",
        }}
      >
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          {/* Header Section */}
          <header style={{ marginBottom: 26, textAlign: "center" }}>
            <p style={{ margin: 0, color: "#7cb87c", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Notebook
            </p>

            <h1 style={{ margin: "8px 0 6px", fontSize: 30, letterSpacing: "0.01em" }}>
              Pages from your journal
            </h1>

            <p style={{ marginTop: 6, color: "#6a766a", maxWidth: 620, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              Leaf through previous pages, notice the tone of each day, and continue where you paused.
            </p>

            {/* Refresh button */}
            <button
              onClick={fetchEntries}
              disabled={loading}
              style={{
                marginTop: 16,
                padding: "10px 18px",
                background: "#7cb87c",
                color: "#ffffff",
                border: "none",
                borderRadius: 10,
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: "0 8px 16px rgba(110, 130, 110, 0.22)",
                opacity: loading ? 0.65 : 1,
              }}
            >
              {loading ? "Loading pages..." : "Refresh pages"}
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
                gap: 18,
              }}
            >
              {entries.map((entry) => {
                const color = emotionColorMap[entry.emotion] || "#6b7280";

                return (
                  <article
                    key={entry.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: 18,
                      padding: 18,
                      border: "1px solid rgba(180, 190, 180, 0.35)",
                      boxShadow: "0 12px 32px rgba(90, 100, 90, 0.12)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                      position: "relative",
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, color: "#8a968a", fontSize: 12 }}>
                          {entry.date}
                        </p>

                        <h3
                          style={{
                            margin: "6px 0 0 0",
                            fontSize: 18,
                            color: "#2d3a2d",
                            wordBreak: "break-word",
                            letterSpacing: "0.01em",
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
                          fontWeight: 700,
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
                    <p style={{ color: "#3a4a3a", margin: 0, lineHeight: 1.55, minHeight: 60 }}>
                      {entry.preview}
                    </p>

                    {/* Sentiment Bar */}
                    <SentimentBar value={entry.sentiment} />

                    {/* AI reflection / guidance */}
                    <div
                      style={{
                        background: "#e8f5e8",
                        border: "1px solid rgba(124, 184, 124, 0.35)",
                        borderRadius: 12,
                        padding: "10px 12px",
                      }}
                    >
                      <p style={{ margin: 0, color: "#3a6a3a", fontWeight: 700, fontSize: 13, letterSpacing: "0.01em" }}>
                        Reflection
                      </p>
                      <p style={{ margin: "6px 0 0 0", color: "#3a4a3a", lineHeight: 1.55, fontSize: 14, fontStyle: "italic" }}>
                        {entry.reflection}
                      </p>
                    </div>

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "space-between",
                  }}
                    >
                      <a
                        href={`/journal?entryId=${entry.id}&reflection=${encodeURIComponent(entry.reflection)}`}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          background: "#7cb87c",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: 10,
                          cursor: "pointer",
                          textDecoration: "none",
                          textAlign: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          boxShadow: "0 8px 16px rgba(110, 130, 110, 0.22)",
                        }}
                      >
                        Continue this page →
                      </a>

                      <button
                        onClick={() => deleteEntry(entry.id)}
                        style={{
                          padding: "9px 12px",
                          background: "#f0f4f0",
                          color: "#5a6a5a",
                          border: "1px solid rgba(124, 184, 124, 0.35)",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        Delete
                      </button>
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
