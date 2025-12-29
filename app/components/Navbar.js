"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#0c1222",
        color: "white",
        padding: "18px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left side - Logo */}
      <Link 
        href="/dashboard" 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          textDecoration: "none",
          color: "white",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            background: "#4fc3a1",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            color: "#0c1222",
          }}
        >
          ZM
        </div>
        <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          ZenithMind
        </span>
      </Link>

      {/* Right side - Navigation links and logout */}
      <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
        <Link 
          href="/journal"
          style={{ 
            color: "white", 
            textDecoration: "none",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => e.target.style.color = "#4fc3a1"}
          onMouseLeave={(e) => e.target.style.color = "white"}
        >
          Journal
        </Link>
        <Link 
          href="/dashboard"
          style={{ 
            color: "white", 
            textDecoration: "none",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => e.target.style.color = "#4fc3a1"}
          onMouseLeave={(e) => e.target.style.color = "white"}
        >
          Dashboard
        </Link>
        <Link 
          href="/entries"
          style={{ 
            color: "white", 
            textDecoration: "none",
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => e.target.style.color = "#4fc3a1"}
          onMouseLeave={(e) => e.target.style.color = "white"}
        >
          Entries
        </Link>

        {!loading && user && (
          <button
            onClick={handleLogout}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => e.target.style.background = "#dc2626"}
            onMouseLeave={(e) => e.target.style.background = "#ef4444"}
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
