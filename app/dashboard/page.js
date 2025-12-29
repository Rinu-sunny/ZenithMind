"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { supabase } from "../../supabaseClient";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [avgSentiment, setAvgSentiment] = useState(null);
  const [dominantEmotion, setDominantEmotion] = useState(null);
  const [entriesThisWeek, setEntriesThisWeek] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [trend, setTrend] = useState([]);
  const [emotionBreakdown, setEmotionBreakdown] = useState([]);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [needsAnalysis, setNeedsAnalysis] = useState(false);

  const analyzeAllEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await fetch('/api/analyzeEntries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, force_reanalyze: true }),
      });
    } catch (err) {
      console.error('Analysis failed:', err.message);
    }
  };

  useEffect(() => {
    analyzeAllEntries();
  }, []);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      try {
        const res = await fetch(`/api/getInsights?user_id=${user.id}`);
        const json = await res.json();
        if (json.avgSentiment != null) setAvgSentiment(json.avgSentiment);
        if (json.dominantEmotion) setDominantEmotion(json.dominantEmotion);
        if (json.entriesThisWeek != null) setEntriesThisWeek(json.entriesThisWeek);
        if (json.currentStreak != null) setCurrentStreak(json.currentStreak);
        if (json.trend) setTrend(json.trend);
        if (json.emotionBreakdown) setEmotionBreakdown(json.emotionBreakdown);
        
        // Check if we have entries but no sentiment data
        if (json.entriesThisWeek > 0 && json.avgSentiment == null) {
          setNeedsAnalysis(true);
        }
      } catch (e) {
        console.warn('Failed to load insights', e);
      }

      // Load AI insight
      setLoadingInsight(true);
      try {
        const insightRes = await fetch(`/api/generateInsights?user_id=${user.id}`);
        const insightJson = await insightRes.json();
        if (insightJson.insight) setAiInsight(insightJson.insight);
      } catch (e) {
        console.warn('Failed to load AI insight', e);
      } finally {
        setLoadingInsight(false);
      }
    };

    load();
  }, []);

  const moodTrendData = trend.length ? trend : [
    { day: 'Mon', score: 0.3 },
    { day: 'Tue', score: 0.5 },
    { day: 'Wed', score: 0.7 },
    { day: 'Thu', score: 0.6 },
    { day: 'Fri', score: 0.8 },
    { day: 'Sat', score: 0.4 },
    { day: 'Sun', score: 0.9 },
  ];

  const emotionPieData = emotionBreakdown.length ? emotionBreakdown : [
    { name: "Calm", value: 35 },
    { name: "Stressed", value: 20 },
    { name: "Happy", value: 25 },
    { name: "Anxious", value: 12 },
    { name: "Sad", value: 8 },
  ];

  const emotionColors = ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#ef4444", "#94a3b8"];

  return (
    <>
      <Navbar />

      <main className="zm-dashboard-page">
        <div className="zm-dashboard-layout">

          {/* Header */}
          <header className="zm-dashboard-header">
            <div>
              <p
                className="zm-kicker"
                style={{ color: "#7cb87c", fontSize: "13px" }}
              >
                Overview
              </p>

              <h1>Mood dashboard</h1>

              <p
                className="zm-dashboard-subtitle"
                style={{ color: "#6a766a", fontSize: "15px" }}
              >
                A quick snapshot of how you&apos;ve been feeling recently based on
                your journal entries.
              </p>
            </div>

            <div className="zm-dashboard-badge">
              <span className="zm-dot" />
              <span style={{ color: "#3a4a3a", fontSize: "14px" }}>
                Connected to Supabase
              </span>
            </div>
          </header>

          {/* AI Insight Card */}
          {aiInsight && (
            <section style={{
              background: "#e8f5e8",
              borderRadius: 18,
              padding: 24,
              marginBottom: 28,
              color: "#2d3a2d",
              border: "1px solid rgba(124, 184, 124, 0.35)",
              boxShadow: "0 8px 20px rgba(124, 184, 124, 0.2)",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>✎</span>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "0.01em" }}>Insight</h2>
              </div>
              <p style={{
                margin: 0,
                lineHeight: 1.6,
                fontSize: 15,
                opacity: 0.98
              }}>
                {loadingInsight ? "Collecting notes..." : aiInsight}
              </p>
            </section>
          )}

          {/* Top metrics */}
          <section className="zm-dashboard-grid">
            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#374151", fontSize: "16px" }}
              >
                Average sentiment
              </p>

              <p className="zm-card-value">{avgSentiment != null ? avgSentiment.toFixed(2) : '—'}</p>

              <p
                className="zm-card-helper"
                style={{ color: "#6a766a", fontSize: "14px" }}
              >
                On a scale from 0 (very low) to 1 (very positive).
              </p>
            </div>

            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#6a766a", fontSize: "16px" }}
              >
                Dominant emotion
              </p>

              <p className="zm-card-value">{dominantEmotion || '—'}</p>

              <p
                className="zm-card-helper"
                style={{ color: "#6a766a", fontSize: "14px" }}
              >
                Most common feeling across your entries.
              </p>
            </div>

            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#6a766a", fontSize: "16px" }}
              >
                Entries this week
              </p>

              <p className="zm-card-value">{entriesThisWeek} / 7</p>

              <p
                className="zm-card-helper"
                style={{ color: "#6a766a", fontSize: "14px" }}
              >
                You&apos;re building a consistent habit.
              </p>
            </div>

            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#6a766a", fontSize: "16px" }}
              >
                Current streak
              </p>

              <p className="zm-card-value">{currentStreak} days</p>

              <p
                className="zm-card-helper"
                style={{ color: "#6a766a", fontSize: "14px" }}
              >
                Best streak: 7 days.
              </p>
            </div>
          </section>

          {/* Charts row */}
          <section className="zm-dashboard-charts">

            {/* Line chart */}
            <div className="zm-dashboard-chart-card">
              <div className="zm-chart-header">
                <h2 style={{ color: "#2d3a2d" }}>Weekly mood trend</h2>

                <p style={{ color: "#6a766a", fontSize: "15px" }}>
                  Each point represents the AI sentiment score for that day.
                </p>
              </div>

              <div className="zm-chart-wrapper">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={moodTrendData}>
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#4b5563", fontSize: 14 }}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#4b5563", fontSize: 14 }}
                      tickFormatter={(v) => v.toFixed(1)}
                    />
                    <Tooltip
                      formatter={(value) => Number(value).toFixed(2)}
                      labelStyle={{ fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#7cb87c"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie chart */}
            <div className="zm-dashboard-chart-card">
              <div className="zm-chart-header">
                <h2 style={{ color: "#2d3a2d" }}>Emotion breakdown</h2>

                <p style={{ color: "#6a766a", fontSize: "15px" }}>
                  Proportion of emotions detected in your recent entries.
                </p>
              </div>

              <div className="zm-chart-wrapper zm-chart-wrapper--row">
                <div className="zm-pie-wrapper">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={emotionPieData}
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {emotionPieData.map((entry, index) => (
                          <Cell key={index} fill={emotionColors[index % emotionColors.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="zm-legend-list">
                  {emotionPieData.map((item, index) => (
                    <li key={index} className="zm-legend-item">
                      <span
                        className="zm-legend-color"
                        style={{ backgroundColor: emotionColors[index % emotionColors.length] }}
                      />

                      <span style={{ color: "#2d3a2d", fontSize: "15px" }}>
                        {item.name}
                      </span>

                      <span style={{ color: "#6a766a", fontSize: "15px" }}>
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Insights */}
          <section className="zm-dashboard-insights">
            <div className="zm-dashboard-card zm-insight-card">
              <h2 style={{ color: "#2d3a2d" }}>Weekly reflection insight</h2>

              <p style={{ color: "#3a4a3a", fontSize: "15px" }}>
                {avgSentiment != null ? (
                  <>Your mood is averaging <strong>{avgSentiment.toFixed(2)}</strong> this week.</>
                ) : (
                  "No AI insights yet — write some journal entries to generate insights."
                )}
              </p>

              <p style={{ color: "#3a4a3a", fontSize: "15px" }}>
                {dominantEmotion ? `Most common feeling: ${dominantEmotion}.` : ''}
              </p>

              <p style={{ color: "#6a766a", fontSize: "15px" }}>
                This uses AI analysis from Supabase.
              </p>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
