"use client"

import React, { Suspense } from "react"
import { WhyChooseUsPage } from "@/components/cms/WhyChooseUsPage"

function PageFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-pulse space-y-4">
        <div className="h-12 w-96 bg-slate-300 rounded-lg mx-auto" />
        <div className="h-4 w-80 bg-slate-200 rounded mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  )
}

export default function WhyChooseUsPageRoute() {
  return (
    <Suspense fallback={<PageFallback />}>
      <WhyChooseUsPage />
    </Suspense>
  )
}
