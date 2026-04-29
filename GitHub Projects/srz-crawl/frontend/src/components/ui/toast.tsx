// src/components/ui/toast.tsx
"use client";
import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: Array<(toast: Toast) => void> = [];

export function showToast(message: string, type: ToastType = "info") {
  const toast: Toast = { id: Date.now().toString(), message, type };
  toastListeners.forEach((fn) => fn(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => { toastListeners = toastListeners.filter((l) => l !== listener); };
  }, []);

  const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
  const COLORS = {
    success: "border-green-500/30 bg-green-500/10 text-green-300",
    error: "border-red-500/30 bg-red-500/10 text-red-300",
    info: "border-white/20 bg-white/10 text-white/80",
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg animate-fade-in pointer-events-auto max-w-sm ${COLORS[toast.type]}`}
          >
            <Icon size={16} className="flex-shrink-0" />
            <span className="text-sm">{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))} className="ml-auto opacity-50 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
