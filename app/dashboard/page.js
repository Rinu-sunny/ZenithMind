"use client";

import Navbar from "../components/Navbar";

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

const moodTrendData = [
  { day: "Mon", score: 0.3 },
  { day: "Tue", score: 0.5 },
  { day: "Wed", score: 0.7 },
  { day: "Thu", score: 0.6 },
  { day: "Fri", score: 0.8 },
  { day: "Sat", score: 0.4 },
  { day: "Sun", score: 0.9 },
];

const emotionPieData = [
  { name: "Calm", value: 35 },
  { name: "Stressed", value: 20 },
  { name: "Happy", value: 25 },
  { name: "Anxious", value: 12 },
  { name: "Sad", value: 8 },
];

const emotionColors = ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#ef4444"];

export default function DashboardPage() {
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
                style={{ color: "#1e293b", fontSize: "15px" }}
              >
                Overview
              </p>

              <h1>Mood dashboard</h1>

              <p
                className="zm-dashboard-subtitle"
                style={{ color: "#374151", fontSize: "16px" }}
              >
                A quick snapshot of how you&apos;ve been feeling recently based on
                your journal entries.
              </p>
            </div>

            <div className="zm-dashboard-badge">
              <span className="zm-dot" />
              <span style={{ color: "#334155", fontSize: "14px" }}>
                Demo data — will be connected to Supabase later
              </span>
            </div>
          </header>

          {/* Top metrics */}
          <section className="zm-dashboard-grid">
            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#374151", fontSize: "16px" }}
              >
                Average sentiment
              </p>

              <p className="zm-card-value">0.64</p>

              <p
                className="zm-card-helper"
                style={{ color: "#4b5563", fontSize: "14px" }}
              >
                On a scale from 0 (very low) to 1 (very positive).
              </p>
            </div>

            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#374151", fontSize: "16px" }}
              >
                Dominant emotion
              </p>

              <p className="zm-card-value">Calm</p>

              <p
                className="zm-card-helper"
                style={{ color: "#4b5563", fontSize: "14px" }}
              >
                Most common feeling across your entries.
              </p>
            </div>

            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#374151", fontSize: "16px" }}
              >
                Entries this week
              </p>

              <p className="zm-card-value">5 / 7</p>

              <p
                className="zm-card-helper"
                style={{ color: "#4b5563", fontSize: "14px" }}
              >
                You&apos;re building a consistent habit.
              </p>
            </div>

            <div className="zm-dashboard-card">
              <p
                className="zm-card-label"
                style={{ color: "#374151", fontSize: "16px" }}
              >
                Current streak
              </p>

              <p className="zm-card-value">3 days</p>

              <p
                className="zm-card-helper"
                style={{ color: "#4b5563", fontSize: "14px" }}
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
                <h2 style={{ color: "#1f2937" }}>Weekly mood trend</h2>

                <p style={{ color: "#4b5563", fontSize: "15px" }}>
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
                      formatter={(value) => value.toFixed(2)}
                      labelStyle={{ fontSize: 12 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#22c55e"
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
                <h2 style={{ color: "#1f2937" }}>Emotion breakdown</h2>

                <p style={{ color: "#4b5563", fontSize: "15px" }}>
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
                          <Cell key={index} fill={emotionColors[index]} />
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
                        style={{ backgroundColor: emotionColors[index] }}
                      />

                      <span style={{ color: "#1f2937", fontSize: "15px" }}>
                        {item.name}
                      </span>

                      <span style={{ color: "#475569", fontSize: "15px" }}>
                        {item.value}%
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
              <h2 style={{ color: "#1f2937" }}>Weekly reflection insight</h2>

              <p style={{ color: "#374151", fontSize: "15px" }}>
                Your mood has been mostly <strong>calm to positive</strong>, with a
                small dip on Saturday.
              </p>

              <p style={{ color: "#374151", fontSize: "15px" }}>
                If you notice recurring patterns, you can plan your tasks better.
              </p>

              <p style={{ color: "#6b7280", fontSize: "15px" }}>
                Later this will use real AI analysis from Supabase.
              </p>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
