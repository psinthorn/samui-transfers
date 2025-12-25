const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function seedContent() {
  console.log('Seeding sample pages...');

  const pages = [
    {
      slug: 'about-us',
      title_en: 'About Us',
      title_th: 'เกี่ยวกับเรา',
      description_en: 'Learn more about Samui Transfers',
      description_th: 'เรียนรู้เพิ่มเติมเกี่ยวกับสมุยทรานสเฟอร์',
      content_en: 'We provide the best transfer services in Samui...',
      content_th: 'เรามีบริการขนส่งที่ดีที่สุดในสมุย...',
      contentType: 'about',
      status: 'published',
      category: 'info',
      displayOrder: 1,
    },
    {
      slug: 'privacy-policy',
      title_en: 'Privacy Policy',
      title_th: 'นโยบายความเป็นส่วนตัว',
      description_en: 'Our privacy policy',
      description_th: 'นโยบายความเป็นส่วนตัวของเรา',
      content_en: 'We take your privacy seriously...',
      content_th: 'เรามีความเคารพต่อความเป็นส่วนตัวของคุณ...',
      contentType: 'policy',
      status: 'published',
      category: 'policy',
      displayOrder: 2,
    },
    {
      slug: 'terms-conditions',
      title_en: 'Terms & Conditions',
      title_th: 'เงื่อนไขและข้อกำหนด',
      description_en: 'Terms and conditions of service',
      description_th: 'เงื่อนไขและข้อกำหนดของบริการ',
      content_en: 'By using our service, you agree to...',
      content_th: 'โดยการใช้บริการของเรา คุณยอมรับ...',
      contentType: 'policy',
      status: 'published',
      category: 'policy',
      displayOrder: 3,
    },
    {
      slug: 'faq',
      title_en: 'Frequently Asked Questions',
      title_th: 'คำถามที่พบบ่อย',
      description_en: 'Common questions and answers',
      description_th: 'คำถามและคำตอบทั่วไป',
      content_en: 'Q: How do I book? A: Use our booking system...',
      content_th: 'ถ: ฉันจะจองได้อย่างไร? ก: ใช้ระบบการจองของเรา...',
      contentType: 'faq',
      status: 'published',
      category: 'guides',
      displayOrder: 4,
    },
    {
      slug: 'how-to-book',
      title_en: 'How to Book',
      title_th: 'วิธีการจอง',
      description_en: 'Step-by-step booking guide',
      description_th: 'คำแนะนำการจองทีละขั้นตอน',
      content_en: '1. Select your destination\n2. Choose date and time\n3. Enter details\n4. Pay\n5. Done!',
      content_th: '1. เลือกปลายทางของคุณ\n2. เลือกวันที่และเวลา\n3. ใส่รายละเอียด\n4. ชำระเงิน\n5. เสร็จ!',
      contentType: 'page',
      status: 'published',
      category: 'guides',
      displayOrder: 5,
    },
    {
      slug: 'contact',
      title_en: 'Contact Us',
      title_th: 'ติดต่อเรา',
      description_en: 'Get in touch with us',
      description_th: 'ติดต่อกับเรา',
      content_en: 'Email: info@samuiransfers.com\nPhone: +66-7-7-424-000',
      content_th: 'อีเมล: info@samuiransfers.com\nโทรศัพท์: +66-7-7-424-000',
      contentType: 'page',
      status: 'published',
      category: 'general',
      displayOrder: 6,
    },
  ];

  for (const page of pages) {
    try {
      const existing = await db.pageContent.findUnique({
        where: { slug: page.slug },
      });

      if (existing) {
        console.log(`✓ Page "${page.slug}" already exists, skipping...`);
      } else {
        await db.pageContent.create({ data: page });
        console.log(`✓ Created page: ${page.slug}`);
      }
    } catch (error) {
      console.error(`✗ Error creating page ${page.slug}:`, error);
    }
  }

  console.log('✓ Content seeding completed!');
  await db.$disconnect();
}

seedContent().catch(console.error);
