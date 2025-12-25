'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { Skeleton } from '@/components/ui/Skeleton'

interface AboutPageProps {
  className?: string
}

const CONTENT = {
  en: {
    kicker: 'About Us',
    title: 'Meet Samui Transfers',
    subtitle: 'Your trusted transportation partner in Koh Samui since day one',
    sections: [
      {
        title: 'Our Mission',
        description: 'To provide safe, comfortable, and reliable transportation services to all our customers, ensuring every journey is memorable and stress-free.',
        icon: '🎯',
      },
      {
        title: 'Professional Team',
        description: 'Our experienced drivers know every corner of Koh Samui. Professional, friendly, and dedicated to your comfort.',
        icon: '👥',
      },
      {
        title: 'Modern Fleet',
        description: 'Well-maintained vehicles including private cars, minivans, and SUVs. All equipped with air conditioning and modern amenities.',
        icon: '🚗',
      },
      {
        title: '24/7 Support',
        description: 'Round-the-clock customer support in both English and Thai. We\'re always here when you need us.',
        icon: '📞',
      },
    ],
    whyChoose: {
      title: 'Why Choose Samui Transfers?',
      points: [
        { title: 'Local Expertise', desc: 'Drivers with deep knowledge of Koh Samui and surrounding areas' },
        { title: 'Competitive Rates', desc: 'Best prices without compromising on quality and service' },
        { title: 'Reliable Service', desc: 'On-time pickups with flight tracking and flexible scheduling' },
        { title: 'Multiple Payment', desc: 'Cash, PayPal, bank transfer, and Thai QR payment accepted' },
        { title: 'Bilingual Support', desc: 'English and Thai speaking staff for your convenience' },
        { title: 'Safety First', desc: 'Well-maintained vehicles and professional, licensed drivers' },
      ],
    },
  },
  th: {
    kicker: 'เกี่ยวกับเรา',
    title: 'เรารู้จัก Samui Transfers',
    subtitle: 'พาร์ทเนอร์การขนส่งที่เชื่อถือได้ของคุณในเกาะสมุย',
    sections: [
      {
        title: 'วิสัยทัศน์ของเรา',
        description: 'เพื่อให้บริการขนส่งที่ปลอดภัย สบาย และเชื่อถือได้แก่ลูกค้าทั้งหมด เพื่อให้ทุกการเดินทางเป็นที่ประทับใจและไม่เครียด',
        icon: '🎯',
      },
      {
        title: 'ทีมมืออาชีพ',
        description: 'คนขับประสบการณ์ของเรารู้ทุกมุมของเกาะสมุย มืออาชีพ เป็นมิตร และอุทิศให้กับความสะดวกสบายของคุณ',
        icon: '👥',
      },
      {
        title: 'รถยนตร์สมัยใหม่',
        description: 'รถดำเนินงานที่ดีรวมถึงรถเก๋ง มินิแวน และเอสยูวี ติดตั้งแอร์และสิ่งอำนวยความสะดวกสมัยใหม่ทั้งหมด',
        icon: '🚗',
      },
      {
        title: 'สนับสนุน 24/7',
        description: 'บริการลูกค้าตลอด 24 ชั่วโมงในภาษาอังกฤษและไทย เรายังคงมีอยู่เมื่อคุณต้องการ',
        icon: '📞',
      },
    ],
    whyChoose: {
      title: 'ทำไมต้องเลือก Samui Transfers?',
      points: [
        { title: 'ความรู้ท้องถิ่น', desc: 'คนขับรู้เกี่ยวกับเกาะสมุยและพื้นที่โดยรอบ' },
        { title: 'ราคาแข่งขันได้', desc: 'ราคาที่ดีที่สุดโดยไม่ประนีประนอมคุณภาพและบริการ' },
        { title: 'บริการเชื่อถือได้', desc: 'การรับขึ้นเวลาพร้อมการติดตามเที่ยวบิน' },
        { title: 'หลายวิธีการชำระเงิน', desc: 'เงินสด PayPal โอนธนาคาร และ QR ไทยยอมรับ' },
        { title: 'บริการสองภาษา', desc: 'บุคลากรที่พูดภาษาอังกฤษและไทย' },
        { title: 'ความปลอดภัยเป็นอันดับแรก', desc: 'รถดำเนินงานดีและคนขับมืออาชีพ' },
      ],
    },
  },
}

export function AboutPageContent({ className = '' }: AboutPageProps) {
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
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            {/* Left Content */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {content.kicker}
              </p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
                {content.title}
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed">
                {content.subtitle}
              </p>
              <p className="mt-6 text-slate-700 leading-relaxed">
                Since our inception, we've been committed to providing the highest standard of transportation
                services. Our team of experienced professionals is dedicated to making every journey comfortable,
                safe, and memorable for our valued customers.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/contact"
                  className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
                >
                  Get in Touch
                  <span className="ml-2">→</span>
                </a>
                <a
                  href="/services"
                  className="inline-flex items-center rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
                >
                  Our Services
                </a>
              </div>
            </div>

            {/* Right Image/Stats */}
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 border border-primary/20">
                  <div className="text-4xl font-bold text-primary">10+</div>
                  <p className="mt-2 text-sm text-slate-600">Years Experience</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 border border-primary/20">
                  <div className="text-4xl font-bold text-primary">5k+</div>
                  <p className="mt-2 text-sm text-slate-600">Happy Customers</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 border border-primary/20">
                  <div className="text-4xl font-bold text-primary">50+</div>
                  <p className="mt-2 text-sm text-slate-600">Professional Drivers</p>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-8 border border-primary/20">
                  <div className="text-4xl font-bold text-primary">24/7</div>
                  <p className="mt-2 text-sm text-slate-600">Customer Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <header className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Our Values
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
              What We Stand For
            </h2>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {content.sections.map((section, idx) => (
              <div
                key={idx}
                className="group rounded-lg border border-slate-200 p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  {section.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {section.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4">
          <header className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Our Promise
            </p>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
              {content.whyChoose.title}
            </h2>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {content.whyChoose.points.map((point, idx) => (
              <div
                key={idx}
                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                    ✓
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Book Your Transfer?
          </h2>
          <p className="mt-6 text-lg text-white/90">
            Experience professional, reliable, and affordable transportation across Koh Samui
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/booking"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 font-semibold text-primary hover:bg-slate-50 transition"
            >
              Book Now
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-white px-8 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
