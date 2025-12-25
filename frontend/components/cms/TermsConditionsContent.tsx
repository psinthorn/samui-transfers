'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, FileText, CreditCard, XCircle, Clock, Users } from 'lucide-react'

export function TermsConditionsContent() {
  const { lang } = useLanguage()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<number[]>([0])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/content?slug=terms-conditions`, {
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

  // Parse HTML content into sections
  const parseContentToSections = (htmlContent: string) => {
    if (!htmlContent) return []
    const sections = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // Look for h3 headers first (most common), then fall back to h2
    let headers = doc.querySelectorAll('h3')
    let isH3 = true
    
    if (headers.length === 0) {
      headers = doc.querySelectorAll('h2')
      isH3 = false
    }
    
    headers.forEach((header, index) => {
      let content = ''
      let sibling = header.nextElementSibling
      const nextHeaderTag = isH3 ? 'H3' : 'H2'
      
      while (sibling && sibling.tagName !== nextHeaderTag) {
        content += sibling.outerHTML
        sibling = sibling.nextElementSibling
      }
      
      if (content.trim()) {
        sections.push({
          title: header.textContent || '',
          content: content || ''
        })
      }
    })
    
    return sections
  }

  const sectionIcons = [CreditCard, XCircle, Clock, Users]

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
  const sections = parseContentToSections(contentHtml)

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-full mb-4 border border-amber-200">
            <FileText className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
              {lang === 'th' ? 'กฎหมาย' : 'Legal'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Content Sections with Accordion */}
        <div className="space-y-4 mb-12">
          {sections.map((section, index) => {
            const Icon = sectionIcons[index % sectionIcons.length]
            const isExpanded = expandedSections.includes(index)

            return (
              <button
                key={index}
                onClick={() => toggleSection(index)}
                className="w-full text-left"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-amber-100 rounded-lg">
                        <Icon className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {/* Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div
                        className="prose prose-sm max-w-none text-slate-700"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Acceptance Notice */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex gap-4">
            <FileText className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">
                {lang === 'th' ? 'ยอมรับข้อตกลง' : 'Agreement Acknowledgment'}
              </h2>
              <p className="text-amber-50">
                {lang === 'th'
                  ? 'เมื่อทำการจอง ถือว่ายอมรับและเข้าใจข้อตกลงนี้ทั้งหมด หากมีคำถาม โปรดติดต่อฝ่ายสนับสนุนของเรา'
                  : 'By booking with us, you acknowledge and accept all terms and conditions outlined above. For any questions, please contact our support team.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
