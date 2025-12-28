"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../../supabaseClient";

function UserAnalyzeControl({ isAnalyzing, onAnalyze, disabled }) {
  return (
    <div>
      <button
        className="zm-primary-btn"
        onClick={onAnalyze}
        disabled={disabled || isAnalyzing}
        style={{ marginRight: 8 }}
      >
        {isAnalyzing ? "Analyzing…" : "Analyze now"}
      </button>
    </div>
  );
}

export default function JournalPage() {
  const [entry, setEntry] = useState("");
  const [pastEntries, setPastEntries] = useState([]);
  const [insight, setInsight] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState(null);
  const maxChars = 1000;
  const remaining = maxChars - entry.length;

  const COOLDOWN_MS = 30 * 1000; // 30s cooldown

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
      
      // Automatically analyze the entry with AI
      try {
        const res = await fetch('/api/analyzeEntries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id }),
        });
        const result = await res.json();
        if (result.error) {
          console.warn('Analysis failed:', result.error);
        }
      } catch (e) {
        console.warn('AI analysis failed', e);
      }
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

  // check AI availability on mount
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/aiStatus');
        const json = await res.json();
        setAiAvailable(Boolean(json?.available));
      } catch (e) {
        setAiAvailable(false);
      }
    };

    check();
  }, []);

  const analyzeNow = async (userId) => {
    if (isAnalyzing) return;
    const now = Date.now();
    if (lastAnalyzedAt && now - lastAnalyzedAt < COOLDOWN_MS) {
      setAnalysisError('Please wait before analyzing again.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analyzeRes = await fetch('/api/analyzeEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const analyzeJson = await analyzeRes.json();
      if (analyzeJson.insight) {
        setInsight(analyzeJson.insight);
        setLastAnalyzedAt(Date.now());
      } else if (analyzeJson.notice) {
        setAnalysisError(analyzeJson.notice);
      } else if (analyzeJson.error) {
        setAnalysisError(analyzeJson.error);
      }
    } catch (e) {
      setAnalysisError('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
                {insight ? (
                  <>
                    <p className="zm-journal-side-text">Dominant emotion: <strong>{insight.dominant_emotion || '—'}</strong></p>
                    <p className="zm-journal-side-text">Sentiment score: <strong>{insight.sentiment_score ?? '—'}</strong></p>
                    <p className="zm-journal-side-text">Question: <em>{insight.reflective_question || insight.raw}</em></p>
                    <p className="zm-journal-side-text">Action: <em>{insight.suggested_action || '—'}</em></p>
                  </>
                ) : (
                  <>
                    <p className="zm-journal-side-text">Once AI is connected, this panel will show:</p>
                    <ul className="zm-journal-list">
                      <li>💚 Dominant emotion</li>
                      <li>📊 Sentiment score 0–1</li>
                      <li>💬 One reflective question</li>
                    </ul>
                  </>
                )}
                <div style={{ marginTop: 12 }}>
                  {aiAvailable ? (
                    <UserAnalyzeControl
                      isAnalyzing={isAnalyzing}
                      onAnalyze={async () => {
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();
                        if (!user) {
                          setAnalysisError('Please login to analyze entries.');
                          return;
                        }
                        analyzeNow(user.id);
                      }}
                      disabled={!aiAvailable}
                    />
                  ) : (
                    <p style={{ color: '#6b7280' }}>AI not configured — enable OPENAI_API_KEY to generate insights.</p>
                  )}
                  {analysisError && <p style={{ color: 'crimson' }}>{analysisError}</p>}
                </div>
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
