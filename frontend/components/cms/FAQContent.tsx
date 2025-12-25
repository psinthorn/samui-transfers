'use client'

import { useEffect, useState, useMemo } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, HelpCircle, Search } from 'lucide-react'

export function FAQContent() {
  const { lang } = useLanguage()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIndex, setExpandedIndex] = useState<number>(0)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/content?slug=faq`, {
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

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index)
  }

  // Parse HTML content to extract Q&A pairs
  const parseFAQContent = (htmlContent: string) => {
    if (!htmlContent) return []
    const faqs = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // Look for h3 (questions) followed by content (answers)
    const h3s = doc.querySelectorAll('h3')
    h3s.forEach((h3, index) => {
      let answer = ''
      let sibling = h3.nextElementSibling
      
      // Collect content until next h3
      while (sibling && sibling.tagName !== 'H3') {
        if (sibling.tagName === 'P' || sibling.tagName === 'UL' || sibling.tagName === 'OL') {
          answer += sibling.outerHTML
        }
        sibling = sibling.nextElementSibling
      }
      
      faqs.push({
        question: h3.textContent || '',
        answer: answer || '',
        id: index
      })
    })
    
    return faqs
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-12 w-96 bg-slate-300 rounded-lg" />
          <div className="h-10 w-full bg-slate-200 rounded-lg" />
          <div className="space-y-3 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-lg" />
            ))}
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
  const allFAQs = parseFAQContent(contentHtml)

  // Filter FAQs based on search query
  const filteredFAQs = useMemo(() => {
    if (!searchQuery) return allFAQs
    return allFAQs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, allFAQs])

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full mb-4 border border-purple-200">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              {lang === 'th' ? 'คำถามที่พบบ่อย' : 'FAQ'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{title}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{description}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={lang === 'th' ? 'ค้นหาคำถาม...' : 'Search questions...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setExpandedIndex(-1)
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <button
                key={faq.id}
                onClick={() => toggleItem(index)}
                className="w-full text-left"
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 overflow-hidden">
                  {/* Question Header */}
                  <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-purple-50">
                    <h3 className="text-lg font-semibold text-slate-900 flex-1">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-4 ${
                        expandedIndex === index ? 'rotate-180' : ''
                      }`}
                    />
                  </div>

                  {/* Answer */}
                  {expandedIndex === index && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div
                        className="prose prose-sm max-w-none text-slate-700"
                        dangerouslySetInnerHTML={{ __html: faq.answer }}
                      />
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500">
                {lang === 'th' ? 'ไม่พบผลการค้นหา' : 'No results found'}
              </p>
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex gap-4">
            <HelpCircle className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold mb-3">
                {lang === 'th' ? 'ยังมีคำถาม?' : 'Still have questions?'}
              </h2>
              <p className="text-purple-50 mb-4">
                {lang === 'th'
                  ? 'ติดต่อฝ่ายสนับสนุนของเรา หรือเยี่ยมชมหน้าติดต่อสำหรับข้อมูลเพิ่มเติม'
                  : 'Contact our support team or visit our contact page for more information.'}
              </p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors">
                {lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
