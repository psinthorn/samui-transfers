'use client'

import { useLanguage } from '@/context/LanguageContext'
import {
  Shield,
  Clock,
  DollarSign,
  Users,
  MapPin,
  Smartphone,
  Award,
  Heart,
} from 'lucide-react'

export function WhyChooseUsPage() {
  const { lang } = useLanguage()

  const reasons = [
    {
      icon: Award,
      title_en: 'Professional Drivers',
      title_th: 'คนขับมืออาชีพ',
      description_en: 'Experienced, courteous, and well-trained drivers with deep local knowledge of Koh Samui.',
      description_th: 'คนขับที่มีประสบการณ์ สุภาพ และฝึกอบรมดีพร้อมความรู้เชิงลึกของเกาะสมุย',
      color: 'blue',
    },
    {
      icon: Clock,
      title_en: '24/7 Availability',
      title_th: 'พร้อมใช้งาน 24/7',
      description_en: 'We are always available for bookings and emergencies, day or night.',
      description_th: 'เรามีความพร้อมสำหรับการจองและจำเป็นเร่งด่วนตลอดเวลา กลางวันหรือกลางคืน',
      color: 'purple',
    },
    {
      icon: DollarSign,
      title_en: 'Competitive Pricing',
      title_th: 'ราคาที่แข่งขันได้',
      description_en: 'Best rates in the market with transparent pricing. No hidden fees or surprises.',
      description_th: 'อัตราราคาที่ดีที่สุดในตลาดพร้อมราคาที่โปร่งใส ไม่มีค่าธรรมเนียมที่ซ่อนอยู่',
      color: 'green',
    },
    {
      icon: Shield,
      title_en: 'Safe & Comfortable',
      title_th: 'ปลอดภัยและสบาย',
      description_en: 'Modern, well-maintained vehicles with safety features and air conditioning.',
      description_th: 'ยานพาหนะสมัยใหม่ สภาพดี มีคุณสมบัติด้านความปลอดภัยและเครื่องปรับอากาศ',
      color: 'red',
    },
    {
      icon: Smartphone,
      title_en: 'Easy Booking',
      title_th: 'การจองง่าย',
      description_en: 'Simple online booking, phone, or WhatsApp. Confirmation within minutes.',
      description_th: 'การจองออนไลน์ที่ง่าย โทรศัพท์ หรือ WhatsApp ยืนยันภายในไม่กี่นาที',
      color: 'yellow',
    },
    {
      icon: Users,
      title_en: 'Friendly Support',
      title_th: 'การสนับสนุนที่เป็นมิตร',
      description_en: 'Bilingual support team ready to help with any questions or concerns.',
      description_th: 'ทีมสนับสนุนสองภาษาพร้อมช่วยเหลือกับคำถามหรือความกังวลใดๆ',
      color: 'pink',
    },
    {
      icon: MapPin,
      title_en: 'Local Expertise',
      title_th: 'ความเชี่ยวชาญท้องถิ่น',
      description_en: 'Know the best routes, latest traffic updates, and hidden gems in Koh Samui.',
      description_th: 'รู้เส้นทางที่ดีที่สุด การอัปเดตการจราจรล่าสุด และสถานที่ที่มีเสน่ห์ในเกาะสมุย',
      color: 'teal',
    },
    {
      icon: Heart,
      title_en: 'Customer Focused',
      title_th: 'มุ่งเน้นลูกค้า',
      description_en: "Your satisfaction is our priority. We go the extra mile for your comfort.",
      description_th: 'ความพึงพอใจของคุณคือลำดับความสำคัญของเรา เรามีความพร้อมทำเพิ่มเติมเพื่อความสบาย',
      color: 'indigo',
    },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    pink: 'bg-pink-100 text-pink-600',
    teal: 'bg-teal-100 text-teal-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  }

  const colorBorders: Record<string, string> = {
    blue: 'border-blue-200 group-hover:border-blue-300',
    purple: 'border-purple-200 group-hover:border-purple-300',
    green: 'border-green-200 group-hover:border-green-300',
    red: 'border-red-200 group-hover:border-red-300',
    yellow: 'border-yellow-200 group-hover:border-yellow-300',
    pink: 'border-pink-200 group-hover:border-pink-300',
    teal: 'border-teal-200 group-hover:border-teal-300',
    indigo: 'border-indigo-200 group-hover:border-indigo-300',
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50/30 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full mb-4 border border-blue-200">
            <Heart className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {lang === 'th' ? 'ทำไมต้องเลือกเรา' : 'Why Choose Us'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6">
            {lang === 'th' ? 'ทำไมลูกค้าเลือก Samui Transfers' : 'Why Choose Samui Transfers'}
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {lang === 'th'
              ? 'เรามุ่งมั่นให้บริการที่ดีที่สุดในอุตสาหกรรมการขนส่งของเกาะสมุย พร้อมเจ้าหน้าที่มืออาชีพและการดูแลลูกค้าที่ยอดเยี่ยม'
              : "We're committed to delivering the best transportation service in Koh Samui with professional staff and exceptional customer care."}
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {reasons.map((reason, index) => {
            const Icon = reason.icon
            const bgColor = colorClasses[reason.color]
            const borderColor = colorBorders[reason.color]
            const title = lang === 'th' ? reason.title_th : reason.title_en
            const description = lang === 'th' ? reason.description_th : reason.description_en

            return (
              <div
                key={index}
                className="group"
              >
                <div className={`h-full bg-white rounded-xl p-8 border-2 ${borderColor} shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px]`}>
                  {/* Icon */}
                  <div className={`${bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 mb-16 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <p className="text-blue-100">
                {lang === 'th' ? 'ลูกค้าที่พึงพอใจ' : 'Happy Customers'}
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <p className="text-blue-100">
                {lang === 'th' ? 'ปีของประสบการณ์' : 'Years of Experience'}
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-blue-100">
                {lang === 'th' ? 'บริการตลอดเวลา' : 'Round-the-Clock Service'}
              </p>
            </div>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            {lang === 'th' ? 'สิ่งที่ลูกค้าพูดเกี่ยวกับเรา' : "What Our Customers Say"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: lang === 'th' ? 'สมพร' : 'John',
                role: lang === 'th' ? 'ผู้เดินทาง' : 'Traveler',
                quote: lang === 'th' 
                  ? 'บริการที่ยอดเยี่ยม! คนขับมีความเป็นมิตรและรู้เส้นทางดี ฉันจะแนะนำให้เพื่อน'
                  : 'Excellent service! The driver was friendly and knowledgeable. I will recommend to friends!',
              },
              {
                name: lang === 'th' ? 'มาเรีย' : 'Maria',
                role: lang === 'th' ? 'นักท่องเที่ยว' : 'Tourist',
                quote: lang === 'th'
                  ? 'ราคาที่ยุติธรรมและการจองง่าย การรับส่งสนามบินปลอดภัยและตรงเวลา ยอดเยี่ยม!'
                  : "Fair pricing and easy booking. Safe and on-time airport transfer. Highly recommended!",
              },
              {
                name: lang === 'th' ? 'ปีเตอร์' : 'Peter',
                role: lang === 'th' ? 'ผู้บริหาร' : 'Executive',
                quote: lang === 'th'
                  ? 'ทำงานด้วย Samui Transfers มากมายครั้ง คุณภาพสม่ำเสมออย่างน่าตกใจ ถือเป็นเลือกที่ดีที่สุด'
                  : "Used Samui Transfers many times. Consistently high quality. Best choice for business travel.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t border-slate-200 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {lang === 'th' ? 'พร้อมจองการขนส่งของคุณ?' : 'Ready to Book Your Transfer?'}
          </h2>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            {lang === 'th'
              ? 'ประสบการณ์ความสะดวกสบายและความเชื่อถือได้ของ Samui Transfers วันนี้'
              : "Experience the convenience and reliability of Samui Transfers today."}
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:translate-y-[-2px]">
            {lang === 'th' ? 'จองตอนนี้' : 'Book Now'}
          </button>
        </div>
      </div>
    </main>
  )
}
