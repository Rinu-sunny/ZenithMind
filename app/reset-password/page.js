"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!password || !confirmPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError("Error: " + updateError.message);
      } else {
        setMessage("success");
        setPassword("");
        setConfirmPassword("");

        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        background: "linear-gradient(to bottom, #f8faf8 0%, #ffffff 50%, #f4f6f4 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "Cambria, 'Times New Roman', serif",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 18,
          padding: 40,
          maxWidth: 420,
          width: "100%",
          border: "1px solid rgba(180, 190, 180, 0.35)",
          boxShadow: "0 12px 32px rgba(90, 100, 90, 0.12)",
        }}
      >
        {message === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h1
              style={{
                margin: "0 0 12px 0",
                fontSize: 26,
                color: "#2d3a2d",
                letterSpacing: "0.01em",
              }}
            >
              Password reset successful
            </h1>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#6a766a",
                lineHeight: 1.55,
              }}
            >
              Your password has been updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <header style={{ marginBottom: 28, textAlign: "center" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "#7cb87c",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 24,
                }}
              >
                🔐
              </div>
              <h1
                style={{
                  margin: "0 0 8px 0",
                  fontSize: 26,
                  color: "#2d3a2d",
                  letterSpacing: "0.01em",
                }}
              >
                Create new password
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "#6a766a",
                  fontSize: 14,
                  lineHeight: 1.55,
                }}
              >
                Enter a strong password for your account
              </p>
            </header>

            {error && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "13px",
                  border: "1px solid #fca5a5",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  border: "1px solid #d8dcd8",
                  borderRadius: 10,
                  background: "#fafbfa",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 18 }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
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
                    padding: "0 8px",
                    opacity: loading ? 0.5 : 0.7,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.opacity = 1)}
                  onMouseLeave={(e) => !loading && (e.target.style.opacity = 0.7)}
                >
                  {showPassword ? "👁️" : "👁‍🗨"}
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  border: "1px solid #d8dcd8",
                  borderRadius: 10,
                  background: "#fafbfa",
                  marginBottom: 24,
                }}
              >
                <span style={{ fontSize: 18 }}>🔒</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
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
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  disabled={loading}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "18px",
                    padding: "0 8px",
                    opacity: loading ? 0.5 : 0.7,
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => !loading && (e.target.style.opacity = 1)}
                  onMouseLeave={(e) => !loading && (e.target.style.opacity = 0.7)}
                >
                  {showConfirmPassword ? "👁️" : "👁‍🗨"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#7cb87c",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 10,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: 14,
                  fontWeight: 700,
                  opacity: loading ? 0.65 : 1,
                  boxShadow: "0 8px 16px rgba(110, 130, 110, 0.22)",
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Updating..." : "Update password"}
              </button>

              <p
                style={{
                  margin: "16px 0 0 0",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#6a766a",
                }}
              >
                Password must be at least 6 characters
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
