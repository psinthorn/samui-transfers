"use client"
import React from 'react'
import AboutUs from '@/components/Home/AboutUs'
import { useLanguage } from "@/context/LanguageContext"

const Page = () => {
  const { lang } = useLanguage()
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <AboutUs lang={lang as any} showLanguageSelector={false} />
      </div>
    </main>
  )
}

export default Page