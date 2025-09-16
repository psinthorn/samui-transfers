"use client"
import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { company, companyLinks } from '@/data/company'

const ContactBanner = () => {
  const { lang } = useLanguage()
  const emailLabel = company.email
  const whatsappLabel = lang === 'th' ? 'แชท WhatsApp' : 'WhatsApp'
  return (
     
    <div className="flex flex-row flex-nowrap items-center justify-center gap-6 bg-primary text-white font-thin rounded-lg shadow-md mx-4 overflow-x-auto whitespace-nowrap">
      <div className="flex items-center gap-2">
        <span role="img" aria-label="Email">📧</span>
        <a href={companyLinks.emailHref} className="text-sm hover:text-light-gray transition break-all">
          {emailLabel}
        </a>
      </div>

      <div className="flex items-center gap-2">
        <span role="img" aria-label="WhatsApp">💬</span>
        <a href={companyLinks.whatsappHref} target="_blank" rel="noopener noreferrer" className="text-sm hover:text-light-gray transition">
          {whatsappLabel}
        </a>
      </div>
    </div>
  )
}

export default ContactBanner