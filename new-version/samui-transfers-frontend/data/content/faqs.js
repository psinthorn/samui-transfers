const faqs = [
  {
    category: { en: "Booking & Payment", th: "การจองและการชำระเงิน" },
    items: [
      {
        q: {
          en: "How do I book an airport transfer?",
          th: "จองบริการรับส่งสนามบินได้อย่างไร?",
        },
        a: {
          en: "Book on our website, call us, or message via WhatsApp.",
          th: "จองผ่านเว็บไซต์ โทรหาเรา หรือส่งข้อความผ่าน WhatsApp",
        },
      },
      {
        q: { en: "What payment methods do you accept?", th: "รับชำระเงินช่องทางใดบ้าง?" },
        a: {
          en: "Cash, QR (PromptPay), PayPal, and bank transfer.",
          th: "เงินสด คิวอาร์พร้อมเพย์ เพย์พาล และโอนผ่านธนาคาร",
        },
      },
      {
        q: { en: "Can I modify or cancel my booking?", th: "สามารถแก้ไข/ยกเลิกการจองได้ไหม?" },
        a: {
          en: "Yes. Modify up to 24 hours before your transfer. Cancellations may be subject to a fee.",
          th: "ได้ สามารถแก้ไขได้ภายใน 24 ชั่วโมงก่อนวันรับส่ง การยกเลิกอาจมีค่าธรรมเนียม",
        },
      },
      {
        q: { en: "Do I need to book in advance?", th: "ต้องจองล่วงหน้าหรือไม่?" },
        a: {
          en: "We recommend at least 24 hours in advance.",
          th: "แนะนำให้จองล่วงหน้าอย่างน้อย 24 ชั่วโมง",
        },
      },
    ],
  },
  {
    category: { en: "Airport Pick‑up & Drop‑off", th: "การรับ‑ส่งสนามบิน" },
    items: [
      {
        q: { en: "Where will I meet my driver?", th: "นัดเจอคนขับตรงไหน?" },
        a: {
          en: "At the arrivals area with a sign displaying your name.",
          th: "บริเวณผู้โดยสารขาเข้า จะมีป้ายชื่อของคุณ",
        },
      },
      {
        q: { en: "What if my flight is delayed?", th: "ถ้าเที่ยวบินล่าช้าจะทำอย่างไร?" },
        a: {
          en: "We track flights and adjust pickup time.",
          th: "เราติดตามเที่ยวบินและปรับเวลารับตามความเหมาะสม",
        },
      },
      {
        q: {
          en: "Do you offer hotel to airport transfers?",
          th: "มีบริการจากโรงแรมไปสนามบินหรือไม่?",
        },
        a: { en: "Yes, one‑way and round‑trip.", th: "มี บริการทั้งเที่ยวเดียวและไป‑กลับ" },
      },
    ],
  },
  {
    category: { en: "Vehicles & Services", th: "รถและการให้บริการ" },
    items: [
      {
        q: { en: "What types of vehicles do you offer?", th: "มีรถประเภทใดให้บริการ?" },
        a: { en: "Private car, minivan, and SUV.", th: "รถเก๋ง มินิแวน และเอสยูวี" },
      },
      {
        q: { en: "Is there a child seat available?", th: "มีที่นั่งเด็กหรือไม่?" },
        a: { en: "Currently unavailable.", th: "ขออภัย ขณะนี้ยังไม่มีให้บริการ" },
      },
      {
        q: { en: "Do you offer shared transfers?", th: "มีบริการแบบแชร์หรือไม่?" },
        a: { en: "No, private transfers only.", th: "ไม่มี ให้บริการเฉพาะส่วนตัวเท่านั้น" },
      },
    ],
  },
  {
    category: { en: "Pricing & Additional Costs", th: "ราคาและค่าใช้จ่ายเพิ่มเติม" },
    items: [
      {
        q: { en: "Any hidden fees?", th: "มีค่าธรรมเนียมแอบแฝงไหม?" },
        a: { en: "No hidden charges.", th: "ไม่มีค่าใช้จ่ายแอบแฝง" },
      },
      {
        q: { en: "Extra for night‑time transfers?", th: "มีค่าบริการช่วงกลางคืนหรือไม่?" },
        a: { en: "No, same price 24/7.", th: "ไม่มี ราคาเท่ากันตลอด 24 ชั่วโมง" },
      },
    ],
  },
]

export default faqs;