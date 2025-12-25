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
        const response = await fetch(`/api/admin/content?slug=terms-conditions`)
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

  const sections = [
    {
      title_en: 'Booking & Payments',
      title_th: 'การจองและการชำระเงิน',
      icon: CreditCard,
      items_en: [
        'Payment: 100% deposit required to confirm your booking.',
        'Pricing: All prices in THB; taxes/fees included unless stated otherwise.'
      ],
      items_th: [
        'ต้องชำระเงินมัดจำ 100% เพื่อยืนยันการจอง',
        'ราคาแสดงเป็น THB รวมภาษี/ค่าธรรมเนียม เว้นแต่ระบุ'
      ]
    },
    {
      title_en: 'Cancellations & Changes',
      title_th: 'การยกเลิกและการเปลี่ยนแปลง',
      icon: XCircle,
      items_en: [
        'Cancellation: ≥ 72 hours before pickup — full refund of deposit.',
        'Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days.',
        'Cancellation: < 24 hours or no‑show — non‑refundable.',
        'Changes: One free change up to 24 hours before pickup (subject to availability)'
      ],
      items_th: [
        'ยกเลิก ≥ 72 ชม. คืนมัดจำเต็มจำนวน',
        'ยกเลิก 24–72 ชม. คืน 70% ภายใน 5–7 วันทำการ',
        'น้อยกว่า 24 ชม./ไม่มาใช้บริการ: ไม่คืนเงิน',
        'เปลี่ยนแปลงฟรี 1 ครั้งภายใน 24 ชม.ก่อนรับ (ขึ้นกับความพร้อม)'
      ]
    },
    {
      title_en: 'Pickup, Waiting & Delays',
      title_th: 'การรับ‑ส่ง เวลารอ และความล่าช้า',
      icon: Clock,
      items_en: [
        'Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free.',
        'Delays: We monitor flight delays and adjust when possible.',
        'Force majeure: Not liable for events beyond our control.'
      ],
      items_th: [
        'เวลารอ: สนามบินฟรี 60 นาที; จุดรับอื่น ๆ ฟรี 15 นาที',
        'ความล่าช้า: ติดตามเที่ยวบินและปรับเวลารับ',
        'เหตุสุดวิสัย: ไม่รับผิดชอบเหตุการณ์นอกเหนือการควบคุม'
      ]
    },
    {
      title_en: 'Passengers, Luggage & Safety',
      title_th: 'ผู้โดยสาร สัมภาระ และความปลอดภัย',
      icon: Users,
      items_en: [
        'Passenger count must match the booking; oversized luggage may require a larger vehicle.',
        'Child seats: on request; confirm availability.',
        'No smoking/open alcohol; seat belts required.'
      ],
      items_th: [
        'จำนวนผู้โดยสารต้องตรงการจอง; สัมภาระใหญ่อาจต้องใช้รถใหญ่ขึ้น',
        'ที่นั่งเด็ก: มีตามคำขอ โปรดยืนยันความพร้อม',
        'ห้ามสูบบุหรี่/ดื่มแอลกอฮอล์ ต้องคาดเข็มขัดนิรภัย'
      ]
    }
  ]

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

  const title = lang === 'th' ? 'ข้อตกลงและเงื่อนไข' : 'Terms & Conditions'
  const description = lang === 'th' ? 'โปรดอ่านก่อนทำการจอง' : 'Please review before booking'

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

        {/* Content Sections */}
        <div className="space-y-4 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(index)
            const sectionTitle = lang === 'th' ? section.title_th : section.title_en
            const items = lang === 'th' ? section.items_th : section.items_en

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
                      <h3 className="text-lg font-semibold text-slate-900">{sectionTitle}</h3>
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
                      <ul className="space-y-3">
                        {items.map((item: string, idx: number) => (
                          <li key={idx} className="flex gap-3">
                            <span className="text-amber-600 font-bold mt-1 flex-shrink-0">•</span>
                            <span className="text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
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
