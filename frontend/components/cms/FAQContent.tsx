'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, HelpCircle, Zap } from 'lucide-react'

interface FAQItem {
  q: { en: string; th: string }
  a: { en: string; th: string }
}

interface FAQSection {
  category: { en: string; th: string }
  items: FAQItem[]
}

export function FAQContent() {
  const { lang } = useLanguage()
  const [faqData, setFaqData] = useState<FAQSection[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>(['0-0'])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        setLoading(true)
        // For now, we'll use static data. In future, fetch from CMS
        const staticFAQ: FAQSection[] = [
          {
            category: { en: 'Booking & Payment', th: 'การจองและการชำระเงิน' },
            items: [
              {
                q: { en: 'How do I book an airport transfer?', th: 'จองบริการรับส่งสนามบินได้อย่างไร?' },
                a: { en: 'Book on our website, call us, or WhatsApp.', th: 'จองผ่านเว็บไซต์ โทร หรือ WhatsApp' },
              },
              {
                q: { en: 'What payment methods do you accept?', th: 'รับชำระเงินช่องทางใดบ้าง?' },
                a: { en: 'Cash, QR (PromptPay), PayPal, bank transfer.', th: 'เงินสด พร้อมเพย์ เพย์พาล โอนธนาคาร' },
              },
              {
                q: { en: 'Can I modify or cancel my booking?', th: 'สามารถแก้ไข/ยกเลิกการจองได้ไหม?' },
                a: { en: 'Modify up to 24h before transfer; fees may apply.', th: 'แก้ไขได้ถึง 24 ชม.ก่อนรับส่ง อาจมีค่าธรรมเนียม' },
              },
            ],
          },
          {
            category: { en: 'Airport Pick-up & Drop-off', th: 'การรับ‑ส่งสนามบิน' },
            items: [
              {
                q: { en: 'Where will I meet my driver?', th: 'นัดเจอคนขับตรงไหน?' },
                a: { en: 'Arrivals area with your name sign.', th: 'บริเวณผู้โดยสารขาเข้าพร้อมป้ายชื่อของคุณ' },
              },
              {
                q: { en: 'What if my flight is delayed?', th: 'ถ้าเที่ยวบินล่าช้าจะทำอย่างไร?' },
                a: { en: 'We track flights and adjust pickup.', th: 'เราติดตามเที่ยวบินและปรับเวลารับ' },
              },
            ],
          },
          {
            category: { en: 'Vehicles & Services', th: 'รถและการให้บริการ' },
            items: [
              {
                q: { en: 'What vehicles do you offer?', th: 'มีรถประเภทใดให้บริการ?' },
                a: { en: 'Private car, minivan, SUV.', th: 'รถเก๋ง มินิแวน เอสยูวี' },
              },
              {
                q: { en: 'Do you offer shared transfers?', th: 'มีบริการแบบแชร์หรือไม่?' },
                a: { en: 'Private only.', th: 'บริการเฉพาะส่วนตัว' },
              },
            ],
          },
        ]
        setFaqData(staticFAQ)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQ()
  }, [])

  const toggleExpand = (sectionIdx: number, itemIdx: number) => {
    const key = `${sectionIdx}-${itemIdx}`
    setExpandedItems(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const filteredFAQ = faqData.map(section => ({
    ...section,
    items: section.items.filter(item => {
      const question = lang === 'th' ? item.q.th : item.q.en
      const answer = lang === 'th' ? item.a.th : item.a.en
      return question.toLowerCase().includes(searchTerm.toLowerCase()) ||
             answer.toLowerCase().includes(searchTerm.toLowerCase())
    })
  })).filter(section => section.items.length > 0)

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-12 w-96 bg-slate-300 rounded-lg" />
          <div className="h-4 w-80 bg-slate-200 rounded" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-full mb-4 border border-purple-200">
            <HelpCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">
              {lang === 'th' ? 'คำถามทั่วไป' : 'FAQ'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            {lang === 'th' ? 'คำถามที่พบบ่อย' : 'Frequently Asked Questions'}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {lang === 'th'
              ? 'ค้นหาคำตอบสำหรับคำถามทั่วไปเกี่ยวกับบริการของเรา'
              : 'Find answers to common questions about our services'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder={lang === 'th' ? 'ค้นหาคำถาม...' : 'Search questions...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-slate-700"
            />
            <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* FAQ Sections */}
        {filteredFAQ.length > 0 ? (
          <div className="space-y-8">
            {filteredFAQ.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                {/* Category Title */}
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                  <span className="h-1 w-8 bg-purple-600 rounded-full" />
                  {lang === 'th' ? section.category.th : section.category.en}
                </h2>

                {/* FAQ Items */}
                <div className="space-y-3">
                  {section.items.map((item, itemIdx) => {
                    const key = `${sectionIdx}-${itemIdx}`
                    const isExpanded = expandedItems.includes(key)
                    const question = lang === 'th' ? item.q.th : item.q.en
                    const answer = lang === 'th' ? item.a.th : item.a.en

                    return (
                      <button
                        key={itemIdx}
                        onClick={() => toggleExpand(sectionIdx, itemIdx)}
                        className="w-full text-left"
                      >
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 overflow-hidden">
                          {/* Question */}
                          <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="p-2 bg-purple-100 rounded-lg mt-1 flex-shrink-0">
                                <HelpCircle className="w-5 h-5 text-purple-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-slate-900">{question}</h3>
                            </div>
                            <ChevronDown
                              className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>

                          {/* Answer */}
                          {isExpanded && (
                            <div className="px-6 pb-6 border-t border-slate-100 ml-16">
                              <p className="text-slate-700 leading-relaxed">{answer}</p>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {lang === 'th' ? 'ไม่พบคำถามที่ตรงกับการค้นหา' : 'No questions match your search'}
            </p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-center text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-3">
            {lang === 'th' ? 'ยังไม่พบคำตอบที่คุณต้องการ?' : "Didn't Find Your Answer?"}
          </h2>
          <p className="text-purple-100 mb-6">
            {lang === 'th'
              ? 'ติดต่อทีมสนับสนุนของเรา เรายินดีที่จะช่วยเหลือ'
              : 'Contact our support team - we are here to help!'}
          </p>
          <a
            href="mailto:booking@samui-transfers.com"
            className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
          >
            {lang === 'th' ? 'ติดต่อเรา' : 'Contact Us'}
          </a>
        </div>
      </div>
    </main>
  )
}
