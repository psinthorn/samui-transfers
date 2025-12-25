import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedContent() {
  try {
    console.log('Starting CMS content seed...')

    // Clear existing content (optional - comment out to preserve existing)
    // await prisma.pageContent.deleteMany({})
    // console.log('Cleared existing content')

    // Seed pages
    const pages = [
      {
        slug: 'home',
        title_en: 'Home',
        title_th: 'หน้าแรก',
        description_en: 'Welcome to Samui Transfers - Your trusted airport and tour transfer service in Koh Samui',
        description_th: 'ยินดีต้อนรับสู่ Samui Transfers - บริการรับส่งสนามบินและทัวร์ที่เชื่อถือได้ในเกาะสมุย',
        content_en: `<h2>Welcome to Samui Transfers</h2>
<p>Your trusted airport and tour transfer service in Koh Samui, Thailand. We provide reliable, professional, and affordable transportation for tourists and locals.</p>
<h3>Why Choose Us?</h3>
<ul>
<li>Professional drivers with local knowledge</li>
<li>Competitive rates</li>
<li>24/7 customer support</li>
<li>Multiple payment options</li>
<li>Safe and comfortable vehicles</li>
</ul>`,
        content_th: `<h2>ยินดีต้อนรับสู่ Samui Transfers</h2>
<p>บริการรับส่งสนามบินและทัวร์ที่เชื่อถือได้ในเกาะสมุย ประเทศไทย เรามีคนขับมืออาชีพและให้บริการที่เชื่อถือได้</p>
<h3>ทำไมต้องเลือกเรา</h3>
<ul>
<li>คนขับมืออาชีพที่รู้ท้องถิ่น</li>
<li>อัตราคำขอที่แข่งขันได้</li>
<li>บริการลูกค้า 24/7</li>
<li>หลายช่องทางการชำระเงิน</li>
<li>รถนุ่มสบายและปลอดภัย</li>
</ul>`,
        contentType: 'page',
        status: 'published',
        featured: true,
        category: 'general',
        displayOrder: 1,
        publishedAt: new Date(),
      },
      {
        slug: 'privacy-policy',
        title_en: 'Privacy Policy',
        title_th: 'นโยบายความเป็นส่วนตัว',
        description_en: 'Your privacy and data protection',
        description_th: 'ความเป็นส่วนตัวและการคุ้มครองข้อมูลของคุณ',
        content_en: `<h2>Privacy Policy</h2>
<h3>Information we collect</h3>
<ul>
<li>Contact details: name, email, phone number</li>
<li>Trip details: pickup/drop-off, dates/times, passengers, notes</li>
<li>Technical: IP, device, and usage analytics (cookies)</li>
</ul>
<h3>How we use your data</h3>
<ul>
<li>Provide and manage bookings and customer support</li>
<li>Send confirmations, updates, and service messages</li>
<li>Improve services, security, and site performance</li>
</ul>
<h3>Your rights</h3>
<ul>
<li>Access, correct, delete, export</li>
<li>Object/restrict processing; withdraw consent</li>
<li>Contact us to exercise rights or make a complaint</li>
</ul>
<p>For privacy requests, contact: booking@samui-transfers.com</p>`,
        content_th: `<h2>นโยบายความเป็นส่วนตัว</h2>
<h3>ข้อมูลที่เราเก็บรวบรวม</h3>
<ul>
<li>ข้อมูลติดต่อ: ชื่อ อีเมล เบอร์โทร</li>
<li>รายละเอียดการเดินทาง: จุดรับ-ส่ง วันที่/เวลา ผู้โดยสาร หมายเหตุ</li>
<li>ข้อมูลทางเทคนิค: IP อุปกรณ์ และคุกกี้</li>
</ul>
<h3>วิธีที่เราใช้ข้อมูลของคุณ</h3>
<ul>
<li>ให้บริการและจัดการการจอง/สนับสนุน</li>
<li>ส่งการยืนยัน อัปเดต และข้อความบริการ</li>
<li>พัฒนาบริการ ความปลอดภัย และประสิทธิภาพเว็บไซต์</li>
</ul>
<h3>สิทธิของคุณ</h3>
<ul>
<li>ขอเข้าถึง แก้ไข ลบ ส่งออก</li>
<li>คัดค้าน/จำกัดการประมวลผล; ถอนความยินยอม</li>
<li>ติดต่อเราเพื่อใช้สิทธิหรือร้องเรียน</li>
</ul>
<p>สำหรับคำขอด้านความเป็นส่วนตัว ติดต่อ: booking@samui-transfers.com</p>`,
        contentType: 'policy',
        status: 'published',
        category: 'policy',
        displayOrder: 2,
        publishedAt: new Date(),
      },
      {
        slug: 'terms-conditions',
        title_en: 'Terms & Conditions',
        title_th: 'ข้อตกลงและเงื่อนไข',
        description_en: 'Please review before booking',
        description_th: 'โปรดอ่านก่อนทำการจอง',
        content_en: `<h2>Terms & Conditions</h2>
<h3>Booking & Payments</h3>
<ul>
<li>Payment: 100% deposit required to confirm your booking</li>
<li>Pricing: All prices in THB; taxes/fees included unless stated otherwise</li>
</ul>
<h3>Cancellations & Changes</h3>
<ul>
<li>Cancellation: ≥ 72 hours before pickup — full refund of deposit</li>
<li>Cancellation: 24–72 hours before pickup — 70% refund within 5–7 business days</li>
<li>Cancellation: < 24 hours or no-show — non-refundable</li>
<li>Changes: One free change up to 24 hours before pickup (subject to availability; fare differences may apply)</li>
</ul>
<h3>Pickup, Waiting & Delays</h3>
<ul>
<li>Waiting time: Airport pickups include 60 minutes free; other pickups include 15 minutes free</li>
<li>Delays: We monitor flight delays and adjust when possible</li>
<li>Force majeure: Not liable for events beyond our control</li>
</ul>
<h3>Passengers, Luggage & Safety</h3>
<ul>
<li>Passenger count must match the booking; oversized luggage may require a larger vehicle</li>
<li>Child seats: on request; confirm availability</li>
<li>No smoking/open alcohol; seat belts required</li>
</ul>
<p>By booking, you acknowledge and accept these terms. For questions, please contact support.</p>`,
        content_th: `<h2>ข้อตกลงและเงื่อนไข</h2>
<h3>การจองและการชำระเงิน</h3>
<ul>
<li>ต้องชำระเงินมัดจำ 100% เพื่อยืนยันการจอง</li>
<li>ราคาแสดงเป็น THB รวมภาษี/ค่าธรรมเนียม เว้นแต่ระบุ</li>
</ul>
<h3>การยกเลิกและการเปลี่ยนแปลง</h3>
<ul>
<li>ยกเลิก ≥ 72 ชม. คืนมัดจำเต็มจำนวน</li>
<li>ยกเลิก 24–72 ชม. คืน 70% ภายใน 5–7 วันทำการ</li>
<li>น้อยกว่า 24 ชม./ไม่มาใช้บริการ: ไม่คืนเงิน</li>
<li>เปลี่ยนแปลงฟรี 1 ครั้งภายใน 24 ชม.ก่อนรับ (ขึ้นกับความพร้อม)</li>
</ul>
<h3>การรับ-ส่ง เวลารอ และความล่าช้า</h3>
<ul>
<li>เวลารอ: สนามบินฟรี 60 นาที; จุดรับอื่น ๆ ฟรี 15 นาที</li>
<li>ความล่าช้า: ติดตามเที่ยวบินและปรับเวลารับ</li>
<li>เหตุสุดวิสัย: ไม่รับผิดชอบเหตุการณ์นอกเหนือการควบคุม</li>
</ul>
<h3>ผู้โดยสาร สัมภาระ และความปลอดภัย</h3>
<ul>
<li>จำนวนผู้โดยสารต้องตรงการจอง; สัมภาระใหญ่อาจต้องใช้รถใหญ่ขึ้น</li>
<li>ที่นั่งเด็ก: มีตามคำขอ โปรดยืนยันความพร้อม</li>
<li>ห้ามสูบบุหรี่/ดื่มแอลกอฮอล์ ต้องคาดเข็มขัดนิรภัย</li>
</ul>
<p>เมื่อทำการจอง ถือว่ายอมรับข้อตกลงนี้ หากมีคำถามโปรดติดต่อฝ่ายสนับสนุน</p>`,
        contentType: 'policy',
        status: 'published',
        category: 'policy',
        displayOrder: 3,
        publishedAt: new Date(),
      },
      {
        slug: 'faq',
        title_en: 'Frequently Asked Questions',
        title_th: 'คำถามที่พบบ่อย',
        description_en: 'Find answers to common questions about our services',
        description_th: 'หาคำตอบสำหรับคำถามทั่วไปเกี่ยวกับบริการของเรา',
        content_en: `<h2>Frequently Asked Questions</h2>
<h3>Booking & Payment</h3>
<p><strong>Q: How do I book an airport transfer?</strong><br/>A: Book on our website, call us, or WhatsApp.</p>
<p><strong>Q: What payment methods do you accept?</strong><br/>A: Cash, QR (PromptPay), PayPal, bank transfer.</p>
<p><strong>Q: Can I modify or cancel my booking?</strong><br/>A: Modify up to 24h before transfer; fees may apply.</p>
<p><strong>Q: Do I need to book in advance?</strong><br/>A: We recommend at least 24 hours in advance.</p>
<h3>Airport Pick-up & Drop-off</h3>
<p><strong>Q: Where will I meet my driver?</strong><br/>A: Arrivals area with your name sign.</p>
<p><strong>Q: What if my flight is delayed?</strong><br/>A: We track flights and adjust pickup.</p>
<p><strong>Q: Hotel to airport transfers?</strong><br/>A: Yes, one-way and round-trip.</p>
<h3>Vehicles & Services</h3>
<p><strong>Q: What vehicles do you offer?</strong><br/>A: Private car, minivan, SUV.</p>
<p><strong>Q: Child seat available?</strong><br/>A: Currently unavailable.</p>
<p><strong>Q: Shared transfers?</strong><br/>A: Private only.</p>`,
        content_th: `<h2>คำถามที่พบบ่อย</h2>
<h3>การจองและการชำระเงิน</h3>
<p><strong>Q: จองบริการรับส่งสนามบินได้อย่างไร?</strong><br/>A: จองผ่านเว็บไซต์ โทร หรือ WhatsApp</p>
<p><strong>Q: รับชำระเงินช่องทางใดบ้าง?</strong><br/>A: เงินสด พร้อมเพย์ เพย์พาล โอนธนาคาร</p>
<p><strong>Q: สามารถแก้ไข/ยกเลิกการจองได้ไหม?</strong><br/>A: แก้ไขได้ถึง 24 ชม.ก่อนรับส่ง อาจมีค่าธรรมเนียม</p>
<p><strong>Q: ต้องจองล่วงหน้าหรือไม่?</strong><br/>A: แนะนำให้จองล่วงหน้าอย่างน้อย 24 ชั่วโมง</p>
<h3>การรับ-ส่งสนามบิน</h3>
<p><strong>Q: นัดเจอคนขับตรงไหน?</strong><br/>A: บริเวณผู้โดยสารขาเข้าพร้อมป้ายชื่อของคุณ</p>
<p><strong>Q: ถ้าเที่ยวบินล่าช้าจะทำอย่างไร?</strong><br/>A: เราติดตามเที่ยวบินและปรับเวลารับ</p>
<p><strong>Q: มีบริการจากโรงแรมไปสนามบินไหม?</strong><br/>A: มี ทั้งเที่ยวเดียวและไป-กลับ</p>
<h3>รถและการให้บริการ</h3>
<p><strong>Q: มีรถประเภทใดให้บริการ?</strong><br/>A: รถเก๋ง มินิแวน เอสยูวี</p>
<p><strong>Q: มีที่นั่งเด็กหรือไม่?</strong><br/>A: ขณะนี้ยังไม่มีให้บริการ</p>
<p><strong>Q: มีบริการแบบแชร์หรือไม่?</strong><br/>A: บริการเฉพาะส่วนตัว</p>`,
        contentType: 'faq',
        status: 'published',
        category: 'guides',
        displayOrder: 4,
        publishedAt: new Date(),
      },
      {
        slug: 'about-us',
        title_en: 'About Us',
        title_th: 'เกี่ยวกับเรา',
        description_en: 'Learn about Samui Transfers',
        description_th: 'เรียนรู้เกี่ยวกับ Samui Transfers',
        content_en: `<h2>About Samui Transfers</h2>
<p>Samui Transfers is your trusted transportation partner in Koh Samui, Thailand. With years of experience in the tourism and transfer industry, we pride ourselves on providing professional, reliable, and affordable services.</p>
<h3>Our Mission</h3>
<p>To provide safe, comfortable, and reliable transportation services to all our customers, ensuring every journey is memorable and stress-free.</p>
<h3>Our Services</h3>
<ul>
<li>Airport transfers (one-way and round-trip)</li>
<li>Hotel to attractions transfers</li>
<li>Private tours and sightseeing</li>
<li>Group transfers for large parties</li>
<li>24/7 customer support</li>
</ul>
<h3>Why Choose Us?</h3>
<ul>
<li>Professional, friendly drivers with local knowledge</li>
<li>Fleet of well-maintained vehicles</li>
<li>Competitive rates</li>
<li>Multiple payment options</li>
<li>Real-time tracking and updates</li>
<li>Bilingual support (English & Thai)</li>
</ul>`,
        content_th: `<h2>เกี่ยวกับ Samui Transfers</h2>
<p>Samui Transfers เป็นพาร์ทเนอร์การขนส่งที่เชื่อถือได้ของคุณในเกาะสมุย ประเทศไทย ด้วยประสบการณ์หลายปีในอุตสาหกรรมท่องเที่ยวและการรับส่ง เรามีความภูมิใจในการให้บริการอาชีพ เชื่อถือได้ และราคาประหยัด</p>
<h3>วิสัยทัศน์ของเรา</h3>
<p>เพื่อให้บริการขนส่งที่ปลอดภัย สบาย และเชื่อถือได้แก่ลูกค้าทั้งหมด เพื่อให้ทุกการเดินทางเป็นที่ประทับใจและไม่เครียด</p>
<h3>บริการของเรา</h3>
<ul>
<li>บริการรับส่งสนามบิน (เที่ยวเดียวและไป-กลับ)</li>
<li>บริการส่งจากโรงแรมไปสถานที่ท่องเที่ยว</li>
<li>ทัวร์ส่วนตัวและชมวิวท่องเที่ยว</li>
<li>บริการรับส่งกลุ่มสำหรับคณะใหญ่</li>
<li>บริการลูกค้า 24/7</li>
</ul>
<h3>ทำไมต้องเลือกเรา?</h3>
<ul>
<li>คนขับมืออาชีพ เป็นมิตร และรู้ท้องถิ่น</li>
<li>ยนตรถดำเนินงานที่สภาพดี</li>
<li>อัตราคำขอที่แข่งขันได้</li>
<li>หลายช่องทางการชำระเงิน</li>
<li>การติดตามแบบเรียลไทม์และการอัพเดต</li>
<li>บริการสองภาษา (อังกฤษและไทย)</li>
</ul>`,
        contentType: 'page',
        status: 'published',
        featured: true,
        category: 'info',
        displayOrder: 5,
        publishedAt: new Date(),
      },
      {
        slug: 'services',
        title_en: 'Our Services',
        title_th: 'บริการของเรา',
        description_en: 'Explore our complete range of transfer and tour services',
        description_th: 'สำรวจบริการรับส่งและทัวร์ที่สมบูรณ์ของเรา',
        content_en: `<h2>Our Services</h2>
<h3>Airport Transfers</h3>
<p>Professional airport transfers to and from Samui International Airport. We monitor flights and ensure timely pickups, even with delays.</p>
<ul>
<li>One-way transfers</li>
<li>Round-trip transfers</li>
<li>Early morning pickups</li>
<li>Late night arrivals</li>
<li>Flight tracking included</li>
</ul>
<h3>Hotel Transfers</h3>
<p>Comfortable transfers from your hotel to attractions, restaurants, and entertainment venues.</p>
<h3>Private Tours</h3>
<p>Customized sightseeing tours with professional guides. Visit popular attractions at your own pace.</p>
<h3>Group Transfers</h3>
<p>Large party transfers for families, tour groups, and corporate events. Multiple vehicle options available.</p>
<h3>Special Events</h3>
<p>Transportation for weddings, conferences, and special occasions. Custom packages available.</p>`,
        content_th: `<h2>บริการของเรา</h2>
<h3>บริการรับส่งสนามบิน</h3>
<p>บริการรับส่งสนามบินระดับมืออาชีพไปยังและจากสนามบินนานาชาติสมุย เราติดตามเที่ยวบินเพื่อให้เรียบร้อยแม้มีการล่าช้า</p>
<ul>
<li>บริการเที่ยวเดียว</li>
<li>บริการไป-กลับ</li>
<li>การรับตอนเช้า</li>
<li>การมาถึงตอนเย็น</li>
<li>รวมการติดตามเที่ยวบิน</li>
</ul>
<h3>บริการส่งจากโรงแรม</h3>
<p>บริการส่งที่สบายสะใจจากโรงแรมไปยังสถานที่ท่องเที่ยว ร้านอาหาร และสถานบันเทิง</p>
<h3>ทัวร์ส่วนตัว</h3>
<p>ทัวร์ชมวิวที่ปรับแต่งได้พร้อมไกด์มืออาชีพ เยี่ยมชมสถานที่ท่องเที่ยวยอดนิยมตามความเร็วของคุณเอง</p>
<h3>บริการรับส่งกลุ่ม</h3>
<p>บริการส่งคณะขนาดใหญ่สำหรับครอบครัว ทัวร์ และกิจกรรมองค์กร มีตัวเลือกรถหลายประเภท</p>
<h3>งานพิเศษ</h3>
<p>บริการขนส่งสำหรับงานแต่ง ประชุม และงานพิเศษ แพ็คเกจแบบเบิดเบอร์พร้อมใช้งาน</p>`,
        contentType: 'page',
        status: 'published',
        category: 'info',
        displayOrder: 6,
        publishedAt: new Date(),
      },
      {
        slug: 'contact-us',
        title_en: 'Contact Us',
        title_th: 'ติดต่อเรา',
        description_en: 'Get in touch with us for bookings and inquiries',
        description_th: 'ติดต่อเราเพื่อจองและสอบถามข้อมูล',
        content_en: `<h2>Contact Samui Transfers</h2>
<h3>Get in Touch</h3>
<p>Have questions or want to book? We're here to help!</p>
<h3>Contact Information</h3>
<ul>
<li><strong>Email:</strong> booking@samui-transfers.com</li>
<li><strong>Phone:</strong> +66 (example) XXX-XXXX</li>
<li><strong>WhatsApp:</strong> Available for quick inquiries</li>
<li><strong>Hours:</strong> 24/7 for bookings and emergencies</li>
</ul>
<h3>Booking Methods</h3>
<ul>
<li>Online booking form on our website</li>
<li>Phone call to our reservation team</li>
<li>WhatsApp message</li>
<li>Email inquiry</li>
</ul>
<h3>Office Location</h3>
<p>Koh Samui, Thailand</p>
<p>We respond to all inquiries within 1 hour during business hours and 24 hours outside business hours.</p>`,
        content_th: `<h2>ติดต่อ Samui Transfers</h2>
<h3>ติดต่อเรา</h3>
<p>มีคำถามหรือต้องการจอง? เรามีความพร้อมที่จะช่วยเหลือ!</p>
<h3>ข้อมูลการติดต่อ</h3>
<ul>
<li><strong>อีเมล:</strong> booking@samui-transfers.com</li>
<li><strong>โทรศัพท์:</strong> +66 (ตัวอย่าง) XXX-XXXX</li>
<li><strong>WhatsApp:</strong> พร้อมใช้สำหรับการสอบถามอย่างรวดเร็ว</li>
<li><strong>เวลาทำการ:</strong> 24/7 สำหรับการจองและจำเป็นเร่งด่วน</li>
</ul>
<h3>วิธีการจอง</h3>
<ul>
<li>แบบฟอร์มจองออนไลน์บนเว็บไซต์ของเรา</li>
<li>โทรศัพท์ไปยังทีมการจองของเรา</li>
<li>ข้อความ WhatsApp</li>
<li>คำถามอีเมล</li>
</ul>
<h3>ที่อยู่สำนักงาน</h3>
<p>เกาะสมุย ประเทศไทย</p>
<p>เราตอบสนองต่อข้อมูลทั้งหมดภายในเวลา 1 ชั่วโมงในเวลาราชการและ 24 ชั่วโมงนอกเวลาราชการ</p>`,
        contentType: 'page',
        status: 'published',
        category: 'info',
        displayOrder: 7,
        publishedAt: new Date(),
      },
    ]

    // Upsert each page
    for (const page of pages) {
      const existing = await prisma.pageContent.findUnique({
        where: { slug: page.slug },
      })

      if (existing) {
        console.log(`Updating: ${page.slug}`)
        await prisma.pageContent.update({
          where: { slug: page.slug },
          data: page,
        })
      } else {
        console.log(`Creating: ${page.slug}`)
        await prisma.pageContent.create({
          data: page,
        })
      }
    }

    console.log('✅ CMS content seed completed successfully!')
  } catch (error) {
    console.error('❌ Error seeding content:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedContent()
