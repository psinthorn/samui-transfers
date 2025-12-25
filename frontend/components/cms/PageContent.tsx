'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Skeleton } from '@/components/ui/Skeleton'

interface PageContentProps {
  slug: string
  showHeader?: boolean
  className?: string
}

export function PageContent({ slug, showHeader = true, className = '' }: PageContentProps) {
  const { lang } = useLanguage()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/content?slug=${slug}`)
        if (!response.ok) {
          throw new Error('Failed to fetch content')
        }
        const data = await response.json()
        setContent(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setContent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [slug])

  if (loading) {
    return (
      <main className={`min-h-screen bg-slate-50 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-6 w-64 bg-slate-200 rounded" />
            <div className="space-y-3 mt-8">
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="h-4 w-4/5 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !content) {
    return (
      <main className={`min-h-screen bg-slate-50 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-red-800">Error loading content: {error}</p>
          </div>
        </div>
      </main>
    )
  }

  const title = lang === 'th' ? content.title_th : content.title_en
  const contentHtml = lang === 'th' ? content.content_th : content.content_en
  const description = lang === 'th' ? content.description_th : content.description_en

  return (
    <main className={`min-h-screen bg-slate-50 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {showHeader && (
          <header className="mb-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {content.contentType}
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">
                  {title}
                </h1>
                {description && (
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                )}
              </div>
            </div>
          </header>
        )}

        <section className="rounded-xl bg-white p-5 sm:p-6 shadow-sm border border-slate-200">
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </section>
      </div>
    </main>
  )
}
