"use client"

import React, { Suspense } from "react"
import { TermsConditionsContent } from "@/components/cms/TermsConditionsContent"

function PageFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl animate-pulse space-y-4">
        <div className="h-12 w-96 bg-slate-300 rounded-lg" />
        <div className="h-4 w-80 bg-slate-200 rounded" />
        <div className="space-y-3 mt-8">
          <div className="h-16 bg-slate-200 rounded-lg" />
          <div className="h-16 bg-slate-200 rounded-lg" />
        </div>
      </div>
    </main>
  )
}

export default function TermsPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <TermsConditionsContent />
    </Suspense>
  )
}