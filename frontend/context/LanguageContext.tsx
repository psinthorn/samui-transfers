"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/data/i18n/core";

export type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const url = new URL(window.location.href);
    const q = (url.searchParams.get("lang") || "").toLowerCase();
    if (q === "en" || q === "th") return q as Lang;
  } catch {}
  try {
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "th") return stored as Lang;
  } catch {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "").toLowerCase();
  return nav.startsWith("th") ? "th" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // To avoid hydration mismatch, render EN on server and on the initial client render,
  // then sync to the preferred language after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const preferred = getInitialLang();
    if (preferred !== lang) setLangState(preferred);
  }, []);

  const setLang = (value: Lang) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lang", value);
        const url = new URL(window.location.href);
        url.searchParams.set("lang", value);
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }
  };

  const toggle = () => setLang(lang === "en" ? "th" : "en");

  // Sync when back/forward changes the URL
  useEffect(() => {
    const onPopState = () => {
      try {
        const url = new URL(window.location.href);
        const q = (url.searchParams.get("lang") || "").toLowerCase();
        if (q === "en" || q === "th") setLangState(q as Lang);
      } catch {}
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({ lang, setLang, toggle }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
