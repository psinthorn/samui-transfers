"use client";
import Link from "next/link";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Image from 'next/image';
import StLogoLong from '@/public/ci/ST_Branding_V1-03.png' // Assuming you have a logo image
import { company, companyLinks } from "@/data/company";
import { useLanguage } from "@/context/LanguageContext";

const LABELS = {
  en: {
    resources: "Resources",
    aboutUs: "About Us",
    whyChooseUs: "Why Choose Us",
    faqs: "FAQ(s)",
    contact: "Contact Us",
    followUs: "Follow us",
    facebook: "Facebook",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    rights: (year) => `© ${year} samui-transfers.com™. All Rights Reserved.`,
    tagline1: "A Local Transfer Service",
    tagline2: "Koh Samui, Thailand",
  },
  th: {
    resources: "ข้อมูล",
    aboutUs: "เกี่ยวกับเรา",
    whyChooseUs: "ทำไมต้องเลือกเรา",
    faqs: "คำถามที่พบบ่อย",
    contact: "ติดต่อเรา",
    followUs: "ติดตามเรา",
    facebook: "เฟซบุ๊ก",
    legal: "ข้อมูลทางกฎหมาย",
    privacy: "นโยบายความเป็นส่วนตัว",
    terms: "ข้อกำหนดและเงื่อนไข",
    rights: (year) => `© ${year} samui-transfers.com™ สงวนลิขสิทธิ์`,
    tagline1: "บริการรับส่งท้องถิ่น",
    tagline2: "เกาะสมุย ประเทศไทย",
  },
};

export default function Footer() {
  const year = new Date().getFullYear();
  const { lang, toggle } = useLanguage();
  const t = LABELS[lang];

  // Public company info from NEXT_PUBLIC_* only to keep SSR/CSR consistent
  const managed = {
    name: company.managedBy.name,
    website: company.managedBy.website,
    email: company.email,
    phone: company.phone,
    reg: company.managedBy.taxId,
  };

  const dev = {
    name: company.managedBy.name,
    website: company.managedBy.website,
    email: company.email,
    phone: company.phone,
    reg: company.managedBy.taxId,
  };

  // Public contact links
  const whatsapp = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, "");
  const whatsappHref = `https://wa.me/${whatsapp}`;
  const supportPhone = (company.phone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || "66991087999").replace(/[^\d+]/g, "");
  const supportEmail = company.email || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "bookings@samui-transfers.com";

  return (
    <footer className="relative bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95 pt-12 pb-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Conversion band */}
        <div className="bg-white/5 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
          <div>
            <p className="text-white font-medium">{lang === 'en' ? 'Need a ride in Koh Samui?' : 'ต้องการรถรับส่งในเกาะสมุย?'}</p>
            <p className="text-white/80 text-sm">{lang === 'en' ? 'Local • Reliable • Affordable' : 'ท้องถิ่น • เชื่อถือได้ • ราคาคุ้มค่า'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/booking" className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary hover:bg-white/95">
              {lang === 'en' ? 'Book Now' : 'จองเลย'}
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="inline-flex text-white h-9 w-9 items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600"
            >
              <FaWhatsapp className="h-4 w-4" />
            </a>
            {/* Phone quick action (text link) */}
            {/* <a
              href={`tel:${supportPhone}`}
              className="hidden sm:inline-flex items-center text-sm text-white/85 hover:text-white"
              aria-label="Call us"
            >
              {supportPhone.startsWith("+") ? supportPhone : `+${supportPhone}`}
            </a> */}
          </div>
        </div>
        <div className=" md:flex md:justify-between">
          <div className="hidden lg:block  md:mb-0 justify-center text-center  items-center mt-10">
            <Link href="/" className="flex justify-center text-center  items-center">
              <Image src={StLogoLong} alt="Samui Transfers Logo" width={254} />
            </Link>
            <p className='text-white hover:text-gray-200 dark:hover:text-gray-200 text-sm'>{t.tagline1}</p>
            <p className='text-white hover:text-gray-200 dark:hover:text-gray-200 text-sm'>{t.tagline2}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-4">
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/70">{t.resources}</h2>
              <ul className="text-white/85 font-medium gap-4">
                <li className="mb-4">
                  <Link href="/about-us" className="transition-colors hover:text-white">{t.aboutUs}</Link>
                </li>
                <li className="mb-4">
                  <Link href="/why-choose-us" className="transition-colors hover:text-white">{t.whyChooseUs}</Link>
                </li>
                <li className="mb-4">
                  <Link href="/faqs" className="transition-colors hover:text-white">{t.faqs}</Link>
                </li>
                <li className="mb-4">
                  <Link href="/contact" className="transition-colors hover:text-white">{t.contact}</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/70">{t.followUs}</h2>
              <ul className="text-white/85 font-medium">
                <li className="mb-4">
                  <Link href="https://www.facebook.com/profile.php?id=61578880422159" className="transition-colors hover:text-white ">{t.facebook}</Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-white/70">{t.legal}</h2>
              <ul className="text-white/85 font-medium">
                <li className="mb-4">
                  <Link href="/privacy" className="transition-colors hover:text-white">{t.privacy}</Link>
                </li>
                <li>
                  <Link href="/terms" className="transition-colors hover:text-white">{t.terms}</Link>
                </li>
                {/* Language toggle moved to bottom bar for consistency with header */}
              </ul>
            </div>
          </div>
        </div>

        <div className="h-px w-full bg-white/10 my-6" />

        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-white/80 sm:text-center">
            {t.rights(year)}
          </span>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Link href="https://www.facebook.com/profile.php?id=61578880422159" className="text-white/85 hover:text-white" target='_blank' aria-label="Facebook">
              <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 8 19">
                <path fillRule="evenodd" d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z" clipRule="evenodd"/>
              </svg>
              <span className="sr-only">Facebook page</span>
            </Link>
            {/* Phone icon button */}
            <a
              href={`tel:${supportPhone}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 text-white/90"
              aria-label="Call us"
              title={supportPhone}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2A1.5 1.5 0 0 1 7 3.5v2A1.5 1.5 0 0 1 5.5 7h-.764a13.5 13.5 0 0 0 6.764 6.764V13.5A1.5 1.5 0 0 1 13 12h2a1.5 1.5 0 0 1 1.5 1.5v2A1.5 1.5 0 0 1 15 17h-1a16 16 0 0 1-12-12v-1Z" />
              </svg>
            </a>
            {/* Email icon button */}
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/10 hover:bg-white/15 text-white/90"
              aria-label="Email us"
              title={supportEmail}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M2.25 6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25v10.5A2.25 2.25 0 0 1 19.5 19.5h-15A2.25 2.25 0 0 1 2.25 17.25V6.75Zm2.284-.75a.75.75 0 0 0-.534 1.28l6.75 6.75a.75.75 0 0 0 1.06 0l6.75-6.75a.75.75 0 1 0-1.06-1.06L12 11.689 5.56 5.22a.75.75 0 0 0-.526-.22Z" />
              </svg>
            </a>
            <button
              onClick={toggle}
              className="inline-flex items-center text-white rounded-md px-2.5 py-1.5 text-xs bg-white/10 hover:bg-white/15"
              aria-label="Toggle language"
            >
              EN/TH
            </button>
          </div>
        </div>

        {/* Managed by / Developed by */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/70">
          <p>
            Managed by{" "}
            {managed.website ? (
              <Link href={managed.website} target="_blank" className="underline underline-offset-2 hover:text-white">
                {managed.name}
              </Link>
            ) : (
              managed.name
            )}
            {managed.reg ? <span className="ml-1">• TAX ID: {managed.reg}</span> : null}
            {managed.phone ? <span className="ml-1">• Tel: {managed.phone}</span> : null}
            {managed.email ? (
              <>
                {" "}&bull;{" "}
                <Link href={`mailto:${managed.email}`} className="underline underline-offset-2 hover:text-white">
                  {managed.email}
                </Link>
              </>
            ) : null}
          </p>

          <p className="sm:text-right">
            Developed by{" "}
            {dev.website ? (
              <Link href={dev.website} target="_blank" className="underline underline-offset-2 hover:text-white">
                {dev.name}
              </Link>
            ) : (
              dev.name
            )}
            {dev.email ? (
              <>
                {" "}&bull;{" "}
                <Link href={`mailto:${dev.email}`} className="underline underline-offset-2 hover:text-white">
                  {dev.email}
                </Link>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </footer>
  );
}