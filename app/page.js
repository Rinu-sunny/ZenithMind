"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password!");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError("Login failed: " + signInError.message);
        } else {
          setError("");
          router.push("/dashboard");
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError("Signup failed: " + signUpError.message);
        } else {
          setError("");
          alert("Signup successful! Check your email to confirm.");
          setMode("login");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
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

        {error && (
          <div style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}>
            {error}
          </div>
        )}

        <form className="zm-login-form" onSubmit={handleSubmit}>
          <div className="zm-input-group">
            <span className="zm-input-icon">✉</span>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="zm-input-field"
              disabled={loading}
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
              disabled={loading}
            />
            <span className="zm-input-eye">👁</span>
          </div>

          <div className="zm-login-row">
            <span />
            <button type="button" className="zm-link-btn" disabled={loading}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="zm-primary-btn"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? "Loading..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
      </div>
    </main>
  );
}
