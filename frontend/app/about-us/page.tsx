"use client"

import React, { Suspense } from "react"
import { PageContent } from "@/components/cms/PageContent"

function AboutUsContent() {
  return <PageContent slug="about-us" />
}

function PageFallback() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-24 bg-slate-200 rounded" />
          <div className="h-6 w-64 bg-slate-200 rounded" />
          <div className="h-4 w-80 bg-slate-200 rounded" />
        </div>
      </div>
    </main>
  )
}

export default function AboutPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <AboutUsContent />
    </Suspense>
  )
}