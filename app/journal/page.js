"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import { supabase } from "../../supabaseClient";

export default function JournalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [entry, setEntry] = useState("");
  const [reflection, setReflection] = useState("");
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const maxChars = 5000;
  const remaining = maxChars - entry.length;

  // Load entry from URL params if continuing an existing entry
  useEffect(() => {
    const entryId = searchParams.get("entryId");
    const reflectionParam = searchParams.get("reflection");

    if (entryId && reflectionParam) {
      setEditingEntryId(entryId);
      setReflection(decodeURIComponent(reflectionParam));
      
      // Fetch the entry content from Supabase
      const fetchEntry = async () => {
        try {
          const { data, error } = await supabase
            .from("journal_entries")
            .select("content")
            .eq("id", entryId)
            .single();
          
          if (error) throw error;
          if (data) setEntry(data.content);
        } catch (err) {
          console.error("Error fetching entry:", err);
        }
      };
      fetchEntry();
    }
  }, [searchParams]);

  // 🔹 Save entry to Supabase (insert new or update existing)
  const saveEntry = async (e) => {
    e.preventDefault();

    if (!entry.trim()) {
      alert("Please write something before submitting.");
      return;
    }

    setIsSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first");
      setIsSaving(false);
      return;
    }

    try {
      let error;
      let newEntryId = editingEntryId;

      if (editingEntryId) {
        // Update existing entry
        const { error: updateError } = await supabase
          .from("journal_entries")
          .update({
            content: entry,
            ai_reflection: reflection,
          })
          .eq("id", editingEntryId);
        
        error = updateError;
      } else {
        // Insert new entry
        const { error: insertError, data } = await supabase
          .from("journal_entries")
          .insert({
            user_id: user.id,
            content: entry,
            date: new Date().toISOString(),
          })
          .select()
          .single();
        
        error = insertError;
        if (data) newEntryId = data.id;
      }

      if (error) {
        alert(error.message);
      } else {
        alert(editingEntryId ? "Entry updated successfully!" : "Entry saved successfully!");
        setEntry("");
        setReflection("");
        setEditingEntryId(null);
        
        // Automatically analyze the entry with AI
        try {
          await fetch('/api/analyzeEntries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, force_reanalyze: true }),
          });
        } catch (e) {
          console.warn('AI analysis failed', e);
        }

        // Redirect to entries page
        router.push("/entries");
      }
    } catch (err) {
      alert("An error occurred: " + err.message);
    } finally {
      setIsSaving(false);
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
              <p className="zm-journal-kicker">
                {editingEntryId ? "Continue this page" : "Dear Diary"}
              </p>
              <h1>Write what the day felt like</h1>
              <p className="zm-journal-subtitle">
                {editingEntryId
                  ? "Pick up where you left off and keep the flow going."
                  : "Slow down, centre yourself, and let the page hold what you're feeling."}
              </p>
            </header>

            <form className="zm-journal-form" onSubmit={saveEntry}>
              <textarea
                className="zm-journal-textarea"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="Rain on the window, coffee on the desk, and I'm thinking about..."
                rows={10}
              />

              {/* Display reflection if continuing an entry */}
              {reflection && (
                <div style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: "#fef3c7",
                  borderLeft: "4px solid #d97706",
                  borderRadius: 4,
                }}>
                  <p style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#92400e",
                    margin: "0 0 6px 0",
                  }}>
                    ✨ AI Reflection
                  </p>
                  <p style={{
                    fontSize: 14,
                    color: "#78350f",
                    margin: 0,
                    lineHeight: "1.4",
                  }}>
                    {reflection}
                  </p>
                </div>
              )}

              <div className="zm-journal-footer-row">
                <span className="zm-char-count">{remaining} characters left</span>

                <button
                  type="submit"
                  className="zm-primary-btn zm-journal-submit-btn"
                  disabled={!entry.trim() || isSaving}
                >
                  {isSaving ? "Saving…" : editingEntryId ? "Save this page" : "Close this page"}
                </button>
              </div>

              <p className="zm-journal-hint">
                This is a private space. Only you (and your database) can see what
                you write.
              </p>
            </form>

            {/* Link to view all entries */}
            <div style={{ marginTop: 24, textAlign: "center" }}>
              <a
                href="/entries"
                style={{
                  color: "#3b3a37",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 500,
                  borderBottom: "1px solid #c2b59b",
                }}
              >
                Flip back to earlier pages →
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
