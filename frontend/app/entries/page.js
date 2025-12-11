"use client";

import Navbar from "../components/Navbar";

const dummyEntries = [
  {
    id: 1,
    date: "Dec 3, 2025",
    emotion: "Calm",
    sentiment: 0.72,
    preview:
      "Today felt lighter. I still have work stress, but I handled things better than yesterday...",
  },
  {
    id: 2,
    date: "Dec 2, 2025",
    emotion: "Stressed",
    sentiment: 0.34,
    preview:
      "Too many deadlines at once. I’m worried I won’t finish everything on time...",
  },
  {
    id: 3,
    date: "Dec 1, 2025",
    emotion: "Hopeful",
    sentiment: 0.81,
    preview:
      "Even though things are hard, I feel like I’m slowly moving in the right direction...",
  },
];

// Emotion color mapping
const emotionColorMap = {
  Calm: "#3b82f6",
  Stressed: "#ef4444",
  Happy: "#22c55e",
  Anxious: "#f59e0b",
  Hopeful: "#8b5cf6",
  Sad: "#6b7280",
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
        {value.toFixed(2)}
      </div>
    </div>
  );
}

export default function EntriesPage() {
  return (
    <>
      <Navbar />

      {/* 🎉 FIXED → Background now fully white */}
      <main
        style={{
          background: "#ffffff",
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
          </header>

          {/* Entries Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {dummyEntries.map((entry) => {
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
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: 12 }}>
                        {entry.date}
                      </p>

                      <h3
                        style={{
                          margin: "6px 0 0 0",
                          fontSize: 18,
                          color: "#111827",
                        }}
                      >
                        {entry.preview.slice(0, 48)}...
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
                        height: 28,
                      }}
                    >
                      {entry.emotion}
                    </div>
                  </div>

                  {/* Preview Text */}
                  <p style={{ color: "#374151", margin: 0, lineHeight: 1.45 }}>
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
                      Saved by AI • Demo
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
