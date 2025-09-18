"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Lang } from "@/data/i18n/core";

export type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLang(fallback?: Lang): Lang {
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
  if (fallback === "en" || fallback === "th") return fallback;
  const nav = (typeof navigator !== "undefined" ? navigator.language : "").toLowerCase();
  return nav.startsWith("th") ? "th" : "en";
}

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang }) {
  // Initialize with server-provided language (if any) to avoid hydration mismatch,
  // then on mount prefer URL/localStorage overrides.
  const [lang, setLangState] = useState<Lang>(initialLang ?? "en");

  useEffect(() => {
    const preferred = getInitialLang(initialLang);
    if (preferred !== lang) setLangState(preferred);
  }, []);

  const setLang = (value: Lang) => {
    setLangState(value);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lang", value);
        // Persist as a cookie so server can read initial language in layout
        document.cookie = `lang=${value}; path=/; max-age=31536000; samesite=lax`;
        const url = new URL(window.location.href);
        url.searchParams.set("lang", value);
        window.history.replaceState({}, "", url.toString());
      } catch {}
    }
  };

  const toggle = () => {
    const value: Lang = lang === "en" ? "th" : "en";
    // Persist new lang and hard-reload so Google Maps/Places script is reloaded with new locale
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lang", value);
        document.cookie = `lang=${value}; path=/; max-age=31536000; samesite=lax`;
        const url = new URL(window.location.href);
        url.searchParams.set("lang", value);
        // Use location.replace to reload and avoid adding a new history entry
        window.location.replace(url.toString());
        return; // stop here; page will reload
      } catch {
        // Fallback: trigger a hard reload
        window.location.reload();
        return;
      }
    }
    // SSR fallback (shouldn't normally happen here)
    setLangState(value);
  };

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
