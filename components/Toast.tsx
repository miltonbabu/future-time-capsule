"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300);
      }
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      borderColor: "#2d5a27",
      bgColor: "rgba(45, 90, 39, 0.1)",
      icon: "✓",
    },
    error: {
      borderColor: "#781e1e",
      bgColor: "rgba(120, 30, 30, 0.1)",
      icon: "✕",
    },
    info: {
      borderColor: "#1c2660",
      bgColor: "rgba(28, 38, 96, 0.1)",
      icon: "✦",
    },
    warning: {
      borderColor: "#98601a",
      bgColor: "rgba(152, 96, 26, 0.1)",
      icon: "⚠",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-toast transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 shadow-lg"
        style={{
          border: `2px solid ${style.borderColor}`,
          backgroundColor: style.bgColor,
          color: "#1c1612",
          fontFamily: "var(--font-body)",
        }}
      >
        <span
          className="text-xl font-bold"
          style={{ color: style.borderColor }}
        >
          {style.icon}
        </span>
        <span className="text-sm">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) {
              setTimeout(onClose, 300);
            }
          }}
          className="ml-2 text-xs uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>
    </div>
  );
}

interface ToastContainerProps {
  toasts: { id: string; message: string; type?: ToastType; duration?: number }[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-2 z-toast">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}