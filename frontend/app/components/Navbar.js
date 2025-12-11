"use client";

import Link from "next/link";

export default function Navbar() {
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
      {/* Left side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          }}
        >
          ZM
        </div>
        <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          ZenithMind
        </span>
      </div>

      {/* Right side links */}
      <div style={{ display: "flex", gap: "30px" }}>
        <Link href="/journal">Journal</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/entries">Entries</Link>
      </div>
    </div>
  );
}
