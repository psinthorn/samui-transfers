const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'th'],
    defaultLocale: 'en',
  },
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  env: {
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME,
    NEXT_PUBLIC_COMPANY_TAGLINE_EN: process.env.NEXT_PUBLIC_COMPANY_TAGLINE_EN,
    NEXT_PUBLIC_COMPANY_TAGLINE_TH: process.env.NEXT_PUBLIC_COMPANY_TAGLINE_TH,
    NEXT_PUBLIC_COMPANY_ADDRESS_EN: process.env.NEXT_PUBLIC_COMPANY_ADDRESS_EN,
    NEXT_PUBLIC_COMPANY_ADDRESS_TH: process.env.NEXT_PUBLIC_COMPANY_ADDRESS_TH,
    NEXT_PUBLIC_PHONE: process.env.NEXT_PUBLIC_PHONE,
    NEXT_PUBLIC_WHATSAPP: process.env.NEXT_PUBLIC_WHATSAPP,
    NEXT_PUBLIC_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    NEXT_PUBLIC_FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    NEXT_PUBLIC_MANAGED_BY_NAME: process.env.NEXT_PUBLIC_MANAGED_BY_NAME,
    NEXT_PUBLIC_MANAGED_BY_WEBSITE: process.env.NEXT_PUBLIC_MANAGED_BY_WEBSITE,
    NEXT_PUBLIC_MANAGED_BY_TAX_ID: process.env.NEXT_PUBLIC_MANAGED_BY_TAX_ID,
  },
}

module.exports = nextConfig;