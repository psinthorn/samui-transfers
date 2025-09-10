import { digitsOnly, type Localized } from "./i18n/core"

export const company = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || "Samui Transfers",
  tagline: {
    en: process.env.NEXT_PUBLIC_COMPANY_TAGLINE_EN || "A Local Transfer Service",
    th: process.env.NEXT_PUBLIC_COMPANY_TAGLINE_TH || "บริการรถรับส่งท้องถิ่นบนเกาะสมุย",
  } as Localized<string>,
  address: {
    en:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS_EN ||
      "9/38 Moo 6, Bophut, Koh Samui, Surat Thani 84320, Thailand",
    th:
      process.env.NEXT_PUBLIC_COMPANY_ADDRESS_TH ||
      "9/38 หมู่ 6 ต.บ่อผุด อ.เกาะสมุย จ.สุราษฎร์ธานี 84320",
  } as Localized<string>,
  phone: process.env.NEXT_PUBLIC_PHONE || "(+66) 099 108 7999",
  whatsapp: digitsOnly(process.env.NEXT_PUBLIC_WHATSAPP || "66991087999"),
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@samui-transfers.com",
  facebook:
    process.env.NEXT_PUBLIC_FACEBOOK_URL ||
    "https://www.facebook.com/profile.php?id=61578880422159",
  managedBy: {
    name: process.env.NEXT_PUBLIC_MANAGED_BY_NAME || "F2 Co., Ltd.",
    website: process.env.NEXT_PUBLIC_MANAGED_BY_WEBSITE || "https://www.f2.co.th",
    taxId: process.env.NEXT_PUBLIC_MANAGED_BY_TAX_ID || "",
  },
}

export const companyLinks = {
  whatsappHref: `https://wa.me/${company.whatsapp}`,
  emailHref: `mailto:${company.email}`,
  phoneHref: `tel:${digitsOnly(company.phone)}`,
  facebook: company.facebook,
}