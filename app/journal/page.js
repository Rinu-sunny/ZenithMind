"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const maxChars = 1000;
  const remaining = maxChars - entry.length;

  function handleSubmit(e) {
    e.preventDefault();
    if (!entry.trim()) {
      alert("Please write something before submitting.");
      return;
    }
    alert("Demo only – will send to AI + Supabase later.");
  }

  return (
    <>
      <Navbar />

      <main className="zm-journal-page">
        <div className="zm-journal-layout">
          {/* Left: writing area */}
          <section className="zm-journal-main">
            <header className="zm-journal-header">
              <p className="zm-journal-kicker">Today&apos;s Reflection</p>
              <h1>How are you feeling today?</h1>
              <p className="zm-journal-subtitle">
                Take a slow breath and write a few lines about what&apos;s on
                your mind. AI will gently reflect your mood, not judge it.
              </p>
            </header>

            <form className="zm-journal-form" onSubmit={handleSubmit}>
              <textarea
                className="zm-journal-textarea"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="For example: “I’ve been feeling anxious about exams, but talking to my friends helped a bit…”"
                rows={8}
              />

              <div className="zm-journal-footer-row">
                <span className="zm-char-count">
                  {remaining} characters left
                </span>

                {/* 🔹 BUTTON TEXT CHANGED HERE */}
                <button
                  type="submit"
                  className="zm-primary-btn zm-journal-submit-btn"
                  disabled={!entry.trim()}
                >
                  Complete Entry ✨
                </button>
              </div>

              <p className="zm-journal-hint">
                This is a private space. Only you (and your database) can see
                what you write.
              </p>
            </form>
          </section>

          {/* Right: AI snapshot */}
          <aside className="zm-journal-side">
            <div className="zm-journal-side-card">
              <h2>Today&apos;s emotional snapshot</h2>
              <p className="zm-journal-side-text">
                Once AI is connected, this panel will show:
              </p>
              <ul className="zm-journal-list">
                <li>💚 Dominant emotion</li>
                <li>📊 Sentiment score 0–1</li>
                <li>💬 One reflective question</li>
              </ul>
              <div className="zm-journal-tags">
                <span className="zm-tag">Daily streak: 0 days</span>
                <span className="zm-tag">Best streak: 0 days</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
