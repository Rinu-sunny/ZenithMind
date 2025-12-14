"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../../supabaseClient";

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [pastEntries, setPastEntries] = useState([]);
  const maxChars = 1000;
  const remaining = maxChars - entry.length;

  // 🔹 Save entry to Supabase
  const saveEntry = async (e) => {
    e.preventDefault();

    if (!entry.trim()) {
      alert("Please write something before submitting.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      return;
    }

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      content: entry,
      date: new Date().toISOString(),
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Entry saved successfully!");
      setEntry(""); // clear textarea after saving
      fetchEntries(); // refresh past entries
    }
  };

  // 🔹 Fetch past entries from Supabase
  const fetchEntries = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const res = await fetch(`/api/getEntries?user_id=${user.id}`);
    const result = await res.json();

    if (result.entries) {
      setPastEntries(result.entries);
    }
  };

  // 🔹 Fetch entries on page load
  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <>
      <Navbar />

      <main className="zm-journal-page">
        <div className="zm-journal-layout">
          {/* Left: writing area */}
          <section className="zm-journal-main">
            <header className="zm-journal-header">
              <p className="zm-journal-kicker">Today's Reflection</p>
              <h1>How are you feeling today?</h1>
              <p className="zm-journal-subtitle">
                Take a slow breath and write a few lines about what's on your
                mind. AI will gently reflect your mood, not judge it.
              </p>
            </header>

            <form className="zm-journal-form" onSubmit={saveEntry}>
              <textarea
                className="zm-journal-textarea"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="For example: “I’ve been feeling anxious about exams, but talking to my friends helped a bit…”"
                rows={8}
              />

              <div className="zm-journal-footer-row">
                <span className="zm-char-count">{remaining} characters left</span>

                <button
                  type="submit"
                  className="zm-primary-btn zm-journal-submit-btn"
                  disabled={!entry.trim()}
                >
                  Complete Entry ✨
                </button>
              </div>

              <p className="zm-journal-hint">
                This is a private space. Only you (and your database) can see what
                you write.
              </p>
            </form>

            {/* 🔹 Past Journal Entries */}
            <section className="zm-past-entries">
              <h2>Past Journal Entries</h2>
              {pastEntries.length === 0 ? (
                <p>No past entries yet.</p>
              ) : (
                pastEntries.map((entry) => (
                  <div key={entry.id} className="zm-entry-card">
                    <p>{entry.content}</p>
                    <small>{new Date(entry.date).toLocaleString()}</small>
                  </div>
                ))
              )}
            </section>
          </section>

          {/* Right: AI snapshot */}
          <aside className="zm-journal-side">
            <div className="zm-journal-side-card">
              <h2>Today's emotional snapshot</h2>
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
