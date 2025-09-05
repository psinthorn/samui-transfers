const company = require('./CompanyInfo').company;

export const links = {
  whatsappHref: `https://wa.me/${company.whatsapp}`,
  emailHref: `mailto:${company.email}`,
  phoneHref: `tel:${company.phone.replace(/[^\d]/g, "")}`,
  facebook: company.facebook,
};