'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { ChevronDown, Shield, Lock, Eye, Users, Trash2, FileText } from 'lucide-react'

export function PrivacyPolicyContent() {
  const { lang } = useLanguage()
  const [content, setContent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<number[]>([0])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/content?slug=privacy-policy`)
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
      title_en: 'Information We Collect',
      title_th: 'ข้อมูลที่เราเก็บรวบรวม',
      icon: Eye,
      content_en: 'Contact details: name, email, phone number. Trip details: pickup/drop‑off, dates/times, passengers, notes. Technical: IP, device, and usage analytics (cookies).',
      content_th: 'ข้อมูลติดต่อ: ชื่อ อีเมล เบอร์โทร รายละเอียดการเดินทาง: จุดรับ‑ส่ง วันที่/เวลา ผู้โดยสาร หมายเหตุ ข้อมูลทางเทคนิค: IP อุปกรณ์ และคุกกี้'
    },
    {
      title_en: 'How We Use Your Data',
      title_th: 'วิธีที่เราใช้ข้อมูลของคุณ',
      icon: Lock,
      content_en: 'Provide and manage bookings and customer support. Send confirmations, updates, and service messages. Improve services, security, and site performance.',
      content_th: 'ให้บริการและจัดการการจอง/สนับสนุน ส่งการยืนยัน อัปเดต และข้อความบริการ พัฒนาบริการ ความปลอดภัย และประสิทธิภาพเว็บไซต์'
    },
    {
      title_en: 'Data Retention & Legal Basis',
      title_th: 'ฐานกฎหมายและการเก็บรักษา',
      icon: FileText,
      content_en: 'Contract performance; legitimate interests; consent where required. We keep data only as long as necessary or to comply with law.',
      content_th: 'การปฏิบัติตามสัญญา; ผลประโยชน์โดยชอบ; ความยินยอมเมื่อจำเป็น เก็บข้อมูลเท่าที่จำเป็นหรือเพื่อปฏิบัติตามกฎหมาย'
    },
    {
      title_en: 'Sharing & Third Parties',
      title_th: 'การเปิดเผยข้อมูลและบุคคลที่สาม',
      icon: Users,
      content_en: 'Trusted providers under data protection agreements. Authorities where required by law. We do not sell personal data.',
      content_th: 'ผู้ให้บริการที่เชื่อถือได้ภายใต้ข้อตกลงคุ้มครองข้อมูล หน่วยงานของรัฐเมื่อกฎหมายกำหนด ไม่ขายข้อมูลส่วนบุคคล'
    },
    {
      title_en: 'Your Rights',
      title_th: 'สิทธิของคุณ',
      icon: Shield,
      content_en: 'Access, correct, delete, export. Object/restrict processing; withdraw consent. Contact us to exercise rights or make a complaint.',
      content_th: 'ขอเข้าถึง แก้ไข ลบ ส่งออก คัดค้าน/จำกัดการประมวลผล; ถอนความยินยอม ติดต่อเราเพื่อใช้สิทธิหรือร้องเรียน'
    },
    {
      title_en: 'Contact & Complaints',
      title_th: 'ติดต่อและร้องเรียน',
      icon: Trash2,
      content_en: 'For privacy requests or complaints: booking@samui-transfers.com',
      content_th: 'สำหรับคำขอด้านความเป็นส่วนตัวหรือการร้องเรียน: booking@samui-transfers.com'
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

  const title = lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'
  const description = lang === 'th' ? 'ความเป็นส่วนตัวและการคุ้มครองข้อมูลของคุณ' : 'Your privacy and data protection'

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

        {/* Content Sections */}
        <div className="space-y-4 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(index)
            const sectionTitle = lang === 'th' ? section.title_th : section.title_en
            const sectionContent = lang === 'th' ? section.content_th : section.content_en

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
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
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
                      <p className="text-slate-700 leading-relaxed">{sectionContent}</p>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
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
