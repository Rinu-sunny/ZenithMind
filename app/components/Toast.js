import { useState, useEffect } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info", duration = 4000) => {
    const id = Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, showToast, removeToast };
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 380,
      }}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: {
      bg: "#d4edda",
      border: "#c3e6cb",
      text: "#155724",
      icon: "✓",
    },
    error: {
      bg: "#f8d7da",
      border: "#f5c6cb",
      text: "#721c24",
      icon: "✕",
    },
    warning: {
      bg: "#fff3cd",
      border: "#ffeaa7",
      text: "#856404",
      icon: "⚠",
    },
    info: {
      bg: "#d1ecf1",
      border: "#bee5eb",
      text: "#0c5460",
      icon: "ℹ",
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
        animation: "slideIn 0.3s ease-out",
        fontFamily: "Cambria, 'Times New Roman', serif",
      }}
    >
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: style.text,
          flexShrink: 0,
        }}
      >
        {style.icon}
      </span>
      <div style={{ flex: 1 }}>
        <p
          style={{
            margin: 0,
            color: style.text,
            fontSize: 14,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: style.text,
          fontSize: 18,
          cursor: "pointer",
          padding: 0,
          flexShrink: 0,
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.opacity = 1)}
        onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
      >
        ✕
      </button>
    </div>
  );
}

// Global styles for animation
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
