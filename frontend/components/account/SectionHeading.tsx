"use client";

import { useLanguage } from "@/context/LanguageContext";
import { pick } from "@/data/i18n/core";

export default function SectionHeading({ title }: { title: { en: string; th: string } }) {
  const { lang } = useLanguage();
  return <h2 className="text-xl font-semibold">{pick(lang, title)}</h2>;
}
