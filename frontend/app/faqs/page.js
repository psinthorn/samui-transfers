"use client";

import React, { useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { faqData } from "@/data/FaqListData";

export default function FAQPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqData || [];
    return (faqData || [])
      .map((section) => ({
        ...section,
        questions: section.questions.filter(
          (f) =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.questions.length > 0);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-slate-800">
      <header className="text-center mb-6 sm:mb-8">
        <h1 className="font-semibold text-lg sm:text-3xl md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Quick answers about transfers, pricing, and booking.
        </p>
      </header>

      <div className="mb-6">
        <label htmlFor="faq-search" className="sr-only">
          Search FAQs
        </label>
        <input
          id="faq-search"
          type="search"
          placeholder="Search questions..."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.map((section) => (
        <Card
          key={section.id}
          className="mb-4 border border-slate-200 shadow-sm bg-white"
        >
          <CardContent className="px-4 sm:px-6 py-4">
            <h2 className="text-base sm:text-lg font-semibold text-slate-700 mb-2">
              {section.category}
            </h2>

            <Accordion type="single" collapsible className="w-full">
              {section.questions.map((faq) => (
                <AccordionItem
                  key={faq.id}
                  value={`faq-${section.id}-${faq.id}`}
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
          </CardContent>
        </Card>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-slate-500">
          No results. Try a different keyword.
        </p>
      )}

      <div className="text-center mt-8">
        <a
          href="mailto:info@samui-transfers.com"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-white text-sm"
        >
          Email support
        </a>
      </div>
    </div>
  );
}
