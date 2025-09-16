"use client";
import React from 'react'
import ContactUs from '@/components/Home/ContactUs'
import { useLanguage } from "@/context/LanguageContext"

export default function Page() {
  const { lang } = useLanguage();
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <ContactUs lang={lang} showLanguageSelector={false} />
      </div>
    </main>
  )
}