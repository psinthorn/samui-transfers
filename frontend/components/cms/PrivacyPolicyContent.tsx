'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, Shield } from 'lucide-react'

export function PrivacyPolicyContent() {
  const { lang } = useLanguage()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<number[]>([0])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/content?slug=privacy-policy`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setContent(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  if (loading) {
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

  if (!content) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Error: Could not load content from database</p>
          </div>
        </div>
      </main>
    )
  }

  const title = lang === 'th' ? content.title_th : content.title_en
  const description = lang === 'th' ? content.description_th : content.description_en
  const contentHtml = lang === 'th' ? content.content_th : content.content_en

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full mb-4 border border-blue-200">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {lang === 'th' ? 'กฎหมาย' : 'Legal'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Content from Database */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-12">
          <div
            className="prose prose-sm max-w-none text-slate-700"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-3">
            {lang === 'th' ? 'มีคำถามเกี่ยวกับความเป็นส่วนตัว?' : 'Questions About Your Privacy?'}
          </h2>
          <p className="text-blue-100 mb-6">
            {lang === 'th' 
              ? 'ติดต่อทีมสนับสนุนของเราเพื่อได้รับความช่วยเหลือหรือคำชี้แจง'
              : 'Contact our support team for any clarifications or assistance'}
          </p>
          <a
            href="mailto:booking@samui-transfers.com"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            {lang === 'th' ? 'ส่งอีเมล' : 'Send Email'}
          </a>
        </div>
      </div>
    </main>
  )
}
