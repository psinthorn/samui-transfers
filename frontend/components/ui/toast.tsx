"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Toast = { id: number; type: "success" | "error" | "info"; message: string };
type ToastContextValue = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push: ToastContextValue["push"] = (t) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, ...t }]);
    // Auto-remove after 4s
    setTimeout(() => remove(id), 4000);
  };
  const remove: ToastContextValue["remove"] = (id) => setToasts((prev) => prev.filter((x) => x.id !== id));
  const value = useMemo(() => ({ toasts, push, remove }), [toasts]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-3 right-3 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md px-4 py-2 text-sm shadow-md border ${
              t.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : t.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
