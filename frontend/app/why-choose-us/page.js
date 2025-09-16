"use client"

import React from 'react'
import WhyChooseUs from '@/components/Home/WhyChooseUs'
import { useLanguage } from '@/context/LanguageContext'

const Page = () => {
  const { lang } = useLanguage()
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <WhyChooseUs lang={lang} />
      </div>
    </main>
  )
}

export default Page