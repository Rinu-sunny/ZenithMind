"use client";

import { useState } from "react";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Mock ${mode.toUpperCase()} for ${email}`);
  }

  return (
    <main className="zm-login-page">
      <div className="zm-login-card">
        <header className="zm-login-header">
          <div className="zm-logo-circle">
            <span className="zm-logo-icon">✦</span>
          </div>
          <h1 className="zm-login-title">ZenithMind</h1>
          <p className="zm-login-subtitle">Welcome back to your mindful journey</p>
        </header>

        <div className="zm-login-tabs">
          <button
            type="button"
            className={mode === "login" ? "zm-login-tab zm-login-tab--active" : "zm-login-tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "zm-login-tab zm-login-tab--active" : "zm-login-tab"}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form className="zm-login-form" onSubmit={handleSubmit}>
          <div className="zm-input-group">
            <span className="zm-input-icon">✉</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="zm-input-field"
            />
          </div>

          <div className="zm-input-group">
            <span className="zm-input-icon">🔒</span>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="zm-input-field"
            />
            <span className="zm-input-eye">👁</span>
          </div>

          <div className="zm-login-row">
            <span />
            <button type="button" className="zm-link-btn">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="zm-primary-btn">
            {mode === "login" ? "Continue Your Journey ✨" : "Create Your Account ✨"}
          </button>
        </form>

        <section className="zm-discover">
          <div className="zm-discover-divider" />
          <span className="zm-discover-label">Discover what awaits</span>

          <div className="zm-feature-row">
            <div className="zm-feature-chip">
              <div className="zm-feature-icon">🧠</div>
              <p className="zm-feature-title">AI-Powered Insights</p>
            </div>
            <div className="zm-feature-chip">
              <div className="zm-feature-icon">💚</div>
              <p className="zm-feature-title">Emotion Tracking</p>
            </div>
            <div className="zm-feature-chip">
              <div className="zm-feature-icon">📈</div>
              <p className="zm-feature-title">Mood Analytics</p>
            </div>
          </div>
        </section>

        <p className="zm-terms-text">
          By continuing, you agree to our <span className="zm-link-underline">Terms</span> and{" "}
          <span className="zm-link-underline">Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}
