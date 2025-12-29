"use client";

import { useState } from "react";
import { useToast, ToastContainer } from "./components/Toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const { toasts, showToast, removeToast } = useToast();

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
          router.push("/journal");
        }
      } else {
        // Pre-check: prevent duplicate signup by querying server-side Admin API
        try {
          const res = await fetch('/api/checkUserExists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          if (res.ok) {
            const json = await res.json();
            if (json.exists) {
              showToast('Account already exists — please login.', 'warning');
              setMode('login');
              setLoading(false);
              return;
            }
          }
        } catch (_) {
          // If check fails, proceed to normal signup but still handle duplication via error below
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          const msg = signUpError.message || "Signup failed";
          // Supabase returns an error if the email is already registered
          if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("registered") || msg.toLowerCase().includes("exists")) {
            showToast("Account already exists — please login.", "warning");
            setMode("login");
          } else {
            setError("Signup failed: " + msg);
            showToast("Signup failed: " + msg, "error");
          }
        } else {
          setError("");
          showToast("Signup successful! Check your email to confirm.", "success");
          setMode("login");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setForgotMessage("");

    if (!forgotEmail) {
      setForgotMessage("Please enter your email address.");
      return;
    }

    setForgotLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        setForgotMessage("Error: " + resetError.message);
      } else {
        setForgotMessage("success");
        setForgotEmail("");
        setTimeout(() => {
          setShowForgotModal(false);
          setForgotMessage("");
        }, 2000);
      }
    } catch (err) {
      setForgotMessage("An unexpected error occurred.");
    } finally {
      setForgotLoading(false);
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="zm-input-field"
              disabled={loading}
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "18px",
                padding: "0 12px",
                opacity: loading ? 0.5 : 0.7,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = 1)}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = 0.7)}
            >
              {showPassword ? "👁️" : "👁‍🗨"}
            </button>
          </div>

          <div className="zm-login-row">
            <span />
            <button 
              type="button" 
              className="zm-link-btn" 
              disabled={loading}
              onClick={(e) => {
                e.preventDefault();
                setShowForgotModal(true);
              }}
            >
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

    {/* Forgot Password Modal */}
    {showForgotModal && (
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
        onClick={() => !forgotLoading && setShowForgotModal(false)}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 18,
            padding: 30,
            maxWidth: 400,
            width: "90%",
            border: "1px solid rgba(180, 190, 180, 0.35)",
            boxShadow: "0 12px 32px rgba(90, 100, 90, 0.12)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {forgotMessage === "success" ? (
            <>
              <div style={{ textAlign: "center", paddingTop: 20 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                <h2 style={{ margin: "0 0 12px 0", fontSize: 22, color: "#2d3a2d", letterSpacing: "0.01em" }}>
                  Check your email
                </h2>
                <p style={{ margin: 0, color: "#6a766a", lineHeight: 1.55 }}>
                  We've sent a password reset link to your email. Follow the link to create a new password.
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 style={{ margin: "0 0 8px 0", fontSize: 22, color: "#2d3a2d", letterSpacing: "0.01em" }}>
                Reset your password
              </h2>
              <p style={{ margin: "0 0 20px 0", color: "#6a766a", lineHeight: 1.55, fontSize: 14 }}>
                Enter your email and we'll send you a link to reset your password.
              </p>

              {forgotMessage && forgotMessage !== "success" && (
                <div style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  border: "1px solid #fca5a5",
                }}>
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleForgotPassword} style={{ marginBottom: 20 }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  border: "1px solid #d8dcd8",
                  borderRadius: 10,
                  background: "#fafbfa",
                  marginBottom: 16,
                }}>
                  <span style={{ fontSize: 18 }}>✉</span>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: 14,
                      color: "#2d3a2d",
                      fontFamily: "Cambria, 'Times New Roman', serif",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    disabled={forgotLoading}
                    style={{
                      padding: "10px 18px",
                      background: "#f0f4f0",
                      border: "1px solid rgba(124, 184, 124, 0.35)",
                      borderRadius: 10,
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#5a6a5a",
                      opacity: forgotLoading ? 0.65 : 1,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      padding: "10px 18px",
                      background: "#7cb87c",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 10,
                      cursor: forgotLoading ? "not-allowed" : "pointer",
                      fontSize: 14,
                      fontWeight: 700,
                      opacity: forgotLoading ? 0.65 : 1,
                      boxShadow: "0 8px 16px rgba(110, 130, 110, 0.22)",
                    }}
                  >
                    {forgotLoading ? "Sending..." : "Send reset link"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    )}
    </>
  );
}
