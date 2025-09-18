"use client";

import { useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Lang } from "@/data/i18n/core";

export default function LanguageBootstrap({ initial }: { initial?: Lang }) {
  const { lang, setLang } = useLanguage();
  useEffect(() => {
    if (!initial) return;
    if (initial !== lang) setLang(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);
  return null;
}
