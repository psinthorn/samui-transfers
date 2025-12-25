'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Skeleton } from '@/components/ui/Skeleton'

interface ContactPageProps {
  className?: string
}

const CONTENT = {
  en: {
    kicker: 'Get In Touch',
    title: 'Contact Samui Transfers',
    subtitle: 'Have questions? We\'re here to help and ready to assist you 24/7',
    intro: 'Whether you need to book a transfer, have questions about our services, or need special arrangements, our friendly team is ready to help.',
    contactMethods: [
      {
        icon: '📧',
        title: 'Email',
        description: 'Send us an email and we\'ll respond within 1 hour',
        value: 'booking@samui-transfers.com',
        href: 'mailto:booking@samui-transfers.com',
      },
      {
        icon: '📱',
        title: 'WhatsApp',
        description: 'Quick messages and instant replies',
        value: '+66 (XX) XXX-XXXX',
        href: '#',
      },
      {
        icon: '☎️',
        title: 'Phone Call',
        description: 'Speak directly with our team',
        value: '+66 (XX) XXX-XXXX',
        href: 'tel:+66XXXXXXXXX',
      },
      {
        icon: '🕐',
        title: 'Hours',
        description: '24/7 for bookings and emergencies',
        value: 'Always Open',
        href: '#',
      },
    ],
    bookingMethods: {
      title: 'Booking Methods',
      description: 'Choose the most convenient way to book your transfer',
      methods: [
        { icon: '🌐', title: 'Online Form', desc: 'Book directly on our website' },
        { icon: '📞', title: 'Phone', desc: 'Call our reservation team' },
        { icon: '💬', title: 'WhatsApp', desc: 'Message us for quick booking' },
        { icon: '✉️', title: 'Email', desc: 'Send booking details via email' },
      ],
    },
    faq: {
      title: 'Frequently Asked Questions',
      description: 'Find quick answers to common questions',
      link: '/faq',
    },
  },
  th: {
    kicker: 'ติดต่อเรา',
    title: 'ติดต่อ Samui Transfers',
    subtitle: 'มีคำถาม? เรามีความพร้อมที่จะช่วยเหลือและให้บริการ 24/7',
    intro: 'ไม่ว่าคุณต้องการจองบริการรับส่ง มีคำถามเกี่ยวกับบริการของเรา หรือต้องการการจัดการพิเศษ ทีมของเราพร้อมที่จะช่วยเหลือ',
    contactMethods: [
      {
        icon: '📧',
        title: 'อีเมล',
        description: 'ส่งอีเมลให้เรา และเราจะตอบกลับภายใน 1 ชั่วโมง',
        value: 'booking@samui-transfers.com',
        href: 'mailto:booking@samui-transfers.com',
      },
      {
        icon: '📱',
        title: 'WhatsApp',
        description: 'ข้อความด่วนและการตอบกลับทันที',
        value: '+66 (XX) XXX-XXXX',
        href: '#',
      },
      {
        icon: '☎️',
        title: 'โทรศัพท์',
        description: 'พูดคุยโดยตรงกับทีมของเรา',
        value: '+66 (XX) XXX-XXXX',
        href: 'tel:+66XXXXXXXXX',
      },
      {
        icon: '🕐',
        title: 'เวลาทำการ',
        description: '24/7 สำหรับการจองและจำเป็นเร่งด่วน',
        value: 'เปิดตลอด',
        href: '#',
      },
    ],
    bookingMethods: {
      title: 'วิธีการจอง',
      description: 'เลือกวิธีที่สะดวกที่สุดในการจองบริการรับส่งของคุณ',
      methods: [
        { icon: '🌐', title: 'แบบฟอร์มออนไลน์', desc: 'จองโดยตรงบนเว็บไซต์ของเรา' },
        { icon: '📞', title: 'โทรศัพท์', desc: 'โทรไปยังทีมการจองของเรา' },
        { icon: '💬', title: 'WhatsApp', desc: 'ส่งข้อความให้เราเพื่อจองด่วน' },
        { icon: '✉️', title: 'อีเมล', desc: 'ส่งรายละเอียดการจองทางอีเมล' },
      ],
    },
    faq: {
      title: 'คำถามที่พบบ่อย',
      description: 'หาคำตอบอย่างรวดเร็วสำหรับคำถามทั่วไป',
      link: '/faq',
    },
  },
}

export function ContactPageContent({ className = '' }: ContactPageProps) {
  const { lang } = useLanguage()
  const [loading, setLoading] = useState(true)
  const content = CONTENT[lang === 'th' ? 'th' : 'en']

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <main className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${className}`}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-10 w-64 bg-slate-200 rounded" />
            <div className="h-4 w-80 bg-slate-200 rounded mt-4" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`min-h-screen bg-gradient-to-b from-slate-50 to-white ${className}`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {content.kicker}
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              {content.title}
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              {content.subtitle}
            </p>
            <p className="mt-6 text-slate-700 leading-relaxed max-w-2xl mx-auto">
              {content.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {content.contactMethods.map((method, idx) => (
              <a
                key={idx}
                href={method.href}
                className="group rounded-lg border border-slate-200 bg-white p-8 hover:shadow-lg hover:border-primary/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  {method.description}
                </p>
                <p className="text-sm font-semibold text-primary group-hover:text-primary/80 transition">
                  {method.value}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Methods Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4">
          <header className="mb-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              {content.bookingMethods.title}
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {content.bookingMethods.description}
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {content.bookingMethods.methods.map((method, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 bg-white p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-5xl mb-4">
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {method.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {method.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Response Time Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 p-8 sm:p-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                We Respond Fast
              </h2>
              <div className="grid gap-6 sm:grid-cols-3 mt-8">
                <div>
                  <div className="text-3xl font-bold text-primary">1 hour</div>
                  <p className="text-sm text-slate-600 mt-2">Email Response</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">5 min</div>
                  <p className="text-sm text-slate-600 mt-2">WhatsApp Reply</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">24/7</div>
                  <p className="text-sm text-slate-600 mt-2">Always Available</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Link Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {content.faq.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            {content.faq.description}
          </p>
          <a
            href={content.faq.link}
            className="mt-8 inline-flex items-center rounded-lg bg-primary px-8 py-3 font-semibold text-white hover:bg-primary/90 transition"
          >
            Browse FAQs
            <span className="ml-2">→</span>
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Book?
          </h2>
          <p className="mt-6 text-lg text-white/90">
            Start your journey with us today. Professional, reliable, and affordable transfers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/booking"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold text-primary hover:bg-slate-50 transition"
            >
              Book Now
            </a>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
