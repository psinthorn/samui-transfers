import { LANG, type Lang, pick } from "../i18n/core"
import { company, companyLinks } from "../company"
import { hero } from "./hero"
import { rates } from "./rates"
import { whyChooseUs } from "./whyChooseUs"
import { vehicles } from "./vehicles"
import { services } from "./services"
import { paymentMethods } from "./paymentMethods"
import { faqs } from "./faqs"
import { terms } from "../legal/terms"
import { privacy } from "../legal/privacy"

export function getContent(lang: Lang = LANG.EN) {
  return {
    company: {
      name: company.name,
      tagline: pick(lang, company.tagline),
      address: pick(lang, company.address),
      phone: company.phone,
      whatsapp: company.whatsapp,
      email: company.email,
      facebook: company.facebook,
      managedBy: company.managedBy,
    },
    links: companyLinks,
    hero: {
      welcome: pick(lang, hero.welcome),
      mission: pick(lang, hero.mission),
    },
    rates: rates.map((x) => pick(lang, x)),
    whyChooseUs: whyChooseUs.map((x) => ({ title: pick(lang, x.title), desc: pick(lang, x.desc) })),
    vehicles: vehicles.map((v) => ({
      type: pick(lang, v.type),
      seats: v.seats,
      luggage: pick(lang, v.luggage),
      desc: pick(lang, v.desc),
    })),
    services: services.map((s) => pick(lang, s)),
    paymentMethods: paymentMethods.map((m) => pick(lang, m)),
    faqs: faqs.map((sec) => ({
      category: pick(lang, sec.category),
      items: sec.items.map((it) => ({ q: pick(lang, it.q), a: pick(lang, it.a) })),
    })),
    legal: {
      terms: terms[lang] || terms.en,
      privacy: privacy[lang] || privacy.en,
    },
  }
}