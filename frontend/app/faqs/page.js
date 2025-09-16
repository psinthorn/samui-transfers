"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { LANG, pick } from "@/data/i18n/core";
import { faqs } from "@/data/content/faqs";

const LABELS = {
  en: {
    kicker: "Support",
    title: "Frequently Asked Questions",
    subtitle: "Quick answers about transfers, pricing, and booking.",
    language: "Language",
    searchPlaceholder: "Search questions...",
    noResults: "No results. Try a different keyword.",
    emailSupport: "Email support",
  },
  th: {
    kicker: "การสนับสนุน",
    title: "คำถามที่พบบ่อย",
    subtitle: "คำตอบรวดเร็วเกี่ยวกับการรับส่ง ราคา และการจอง",
    language: "ภาษา",
    searchPlaceholder: "ค้นหาคำถาม...",
    noResults: "ไม่พบผลลัพธ์ ลองคำค้นอื่น",
    emailSupport: "อีเมลฝ่ายสนับสนุน",
  },
};

export default function FAQPage() {
  const [query, setQuery] = useState("");
  const [localLang, setLocalLang] = useState("en");
  const effectiveLang = localLang === "th" ? "th" : "en";
  const L = LABELS[effectiveLang];

  // Initialize from ?lang or browser language; keep URL in sync without reload
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const q = (url.searchParams?.get("lang") || "").toLowerCase();
    if (q === "en" || q === "th") {
      setLocalLang(q);
    } else {
      const nav = navigator.language?.toLowerCase() || "";
      setLocalLang(nav.startsWith("th") ? "th" : "en");
    }
  }, []);

  const onChangeLang = (value) => {
    const lang = value === "th" ? "th" : "en";
    setLocalLang(lang);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Build localized view of FAQs
  const localized = useMemo(() => {
    return (faqs || []).map((sec, idx) => ({
      id: `sec-${idx}`,
      category: pick(effectiveLang, sec.category),
      questions: sec.items.map((it, i) => ({
        id: `q-${idx}-${i}`,
        question: pick(effectiveLang, it.q),
        answer: pick(effectiveLang, it.a),
      })),
    }));
  }, [effectiveLang]);

  // Filter by query against localized strings
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return localized;
    return localized
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (f) =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.questions.length > 0);
  }, [localized, query]);

  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@samui-transfers.com";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {L.kicker}
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">
                {L.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{L.subtitle}</p>
            </div>
            <div className="shrink-0">
              <label className="sr-only" htmlFor="lang">
                {L.language}
              </label>
              <select
                id="lang"
                value={effectiveLang}
                onChange={(e) => onChangeLang(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-primary/30"
              >
                <option value="en">English</option>
                <option value="th">ไทย</option>
              </select>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="mb-6">
          <label htmlFor="faq-search" className="sr-only">
            {L.searchPlaceholder}
          </label>
          <input
            id="faq-search"
            type="search"
            placeholder={L.searchPlaceholder}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Sections as cards (match Privacy page card style) */}
        {filtered.map((section) => (
          <section
            key={section.id}
            className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200 mb-4"
          >
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
              {section.category}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {section.questions.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`${section.id}-${faq.id}`}
                  className="border-b border-slate-200"
                >
                  <AccordionTrigger className="py-3 text-left text-sm sm:text-base font-medium hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm sm:text-base text-slate-700">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-slate-500">{L.noResults}</p>
        )}

        <div className="text-center mt-8">
          <a
            href={`mailto:${supportEmail}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white text-sm"
          >
            {L.emailSupport}
          </a>
        </div>
      </div>
    </main>
  );
}
