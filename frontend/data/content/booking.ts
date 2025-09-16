import { Localized } from "@/data/i18n/core"

export const bookingText = {
  steps: {
    labels: [
      { en: "Booking", th: "การจอง" },
      { en: "Confirmation", th: "ยืนยัน" },
      { en: "Payment", th: "ชำระเงิน" },
    ] as Localized<string>[],
  },
  form: {
    kicker: { en: "Transfer Booking", th: "จองรถรับส่ง" } as Localized<string>,
    title: { en: "Book Your Transfer", th: "จองการเดินทางของคุณ" } as Localized<string>,

    passengerDetails: {
      title: { en: "Passenger details", th: "ข้อมูลผู้โดยสาร" } as Localized<string>,
      subtitle: {
        en: "We’ll use this to confirm your booking.",
        th: "ข้อมูลนี้ใช้สำหรับยืนยันการจองของคุณ",
      } as Localized<string>,
      firstName: { en: "First name", th: "ชื่อ" } as Localized<string>,
      lastName: { en: "Last name", th: "นามสกุล" } as Localized<string>,
      email: { en: "Email", th: "อีเมล" } as Localized<string>,
      mobile: { en: "Mobile", th: "มือถือ" } as Localized<string>,
      mobilePlaceholder: { en: "(+66) 99 108 7999", th: "(+66) 99 108 7999" } as Localized<string>,
      pickupDateTime: { en: "Pickup date/time", th: "วันและเวลาไปรับ" } as Localized<string>,
      passengers: { en: "Passengers", th: "ผู้โดยสาร" } as Localized<string>,
      passengersHint: {
        en: "Max 12 per vehicle. Let us know if you need child seats.",
        th: "สูงสุด 12 คนต่อคัน แจ้งหากต้องการที่นั่งเด็ก",
      } as Localized<string>,
      flightNo: { en: "Flight no. (optional)", th: "เลขเที่ยวบิน (ไม่บังคับ)" } as Localized<string>,
      notes: { en: "Notes (optional)", th: "หมายเหตุ (ไม่บังคับ)" } as Localized<string>,
      notesPlaceholder: {
        en: "Child seat, special requests, etc.",
        th: "ที่นั่งเด็ก คำขอพิเศษ เป็นต้น",
      } as Localized<string>,
      vehicle: { en: "Vehicle", th: "รถ" } as Localized<string>,
      rate: { en: "Rate", th: "ราคา" } as Localized<string>,
      pickup: { en: "Pickup", th: "จุดรับ" } as Localized<string>,
      dropoff: { en: "Drop-off", th: "จุดส่ง" } as Localized<string>,
      reviewCta: { en: "Review booking", th: "ตรวจสอบการจอง" } as Localized<string>,
    },
  },
  review: {
    kicker: { en: "Review", th: "ตรวจสอบ" } as Localized<string>,
    title: { en: "Confirm your booking", th: "ยืนยันการจอง" } as Localized<string>,
    subtitle: {
      en: "Make sure everything looks right before sending.",
      th: "ตรวจสอบความถูกต้องก่อนส่งคำขอ",
    } as Localized<string>,
    notConfirmedBanner: {
      en: "This is not a confirmation. We’ll contact you shortly to confirm availability and driver details.",
      th: "ยังไม่ยืนยันการจอง เราจะติดต่อกลับเพื่อยืนยันความพร้อมและรายละเอียดคนขับ",
    } as Localized<string>,
    route: { en: "Route", th: "เส้นทาง" } as Localized<string>,
    pickup: { en: "Pickup", th: "จุดรับ" } as Localized<string>,
    dropoff: { en: "Drop-off", th: "จุดส่ง" } as Localized<string>,
    passenger: { en: "Passenger", th: "ผู้โดยสาร" } as Localized<string>,
    name: { en: "Name", th: "ชื่อ" } as Localized<string>,
    passengers: { en: "Passengers", th: "ผู้โดยสาร" } as Localized<string>,
    contact: { en: "Contact", th: "ติดต่อ" } as Localized<string>,
    email: { en: "Email", th: "อีเมล" } as Localized<string>,
    mobile: { en: "Mobile", th: "มือถือ" } as Localized<string>,
    trip: { en: "Trip", th: "การเดินทาง" } as Localized<string>,
    pickupDateTime: { en: "Pickup date/time", th: "วันและเวลาไปรับ" } as Localized<string>,
    flightNo: { en: "Flight no.", th: "เลขเที่ยวบิน" } as Localized<string>,
    vehicle: { en: "Vehicle", th: "รถ" } as Localized<string>,
    notes: { en: "Notes", th: "หมายเหตุ" } as Localized<string>,
    total: { en: "Total", th: "รวม" } as Localized<string>,
    thb: { en: "THB", th: "บาท" } as Localized<string>,
    termsTitle: { en: "Terms and conditions", th: "เงื่อนไขและข้อตกลง" } as Localized<string>,
    termsAccept: { en: "I agree to the Terms and Conditions", th: "ยอมรับเงื่อนไขและข้อตกลง" } as Localized<string>,
    continueAccept: { en: "By continuing, you accept these terms.", th: "เมื่อดำเนินการต่อถือว่ายอมรับเงื่อนไข" } as Localized<string>,
    back: { en: "Back", th: "ย้อนกลับ" } as Localized<string>,
    confirmCta: { en: "Confirm booking", th: "ยืนยันการจอง" } as Localized<string>,
    sending: { en: "Sending…", th: "กำลังส่ง…" } as Localized<string>,
  },
  payment: {
    kicker: { en: "Payment", th: "ชำระเงิน" } as Localized<string>,
    title: { en: "Payment details", th: "รายละเอียดการชำระเงิน" } as Localized<string>,
    subtitle: {
      en: "Pay 100% to confirm your booking. Send your slip after payment.",
      th: "ชำระเงินเต็มจำนวนเพื่อยืนยันการจอง ส่งสลิปหลังชำระเงิน",
    } as Localized<string>,
    accountName: { en: "Account name", th: "ชื่อบัญชี" } as Localized<string>,
    accountNumber: { en: "Account number", th: "เลขที่บัญชี" } as Localized<string>,
    swift: { en: "SWIFT", th: "SWIFT" } as Localized<string>,
    copy: { en: "Copy", th: "คัดลอก" } as Localized<string>,
    copied: { en: "Copied", th: "คัดลอกแล้ว" } as Localized<string>,
    accountType: { en: "account", th: "บัญชี" } as Localized<string>,
  },
  thankyou: {
    title: { en: "Thank you for your booking", th: "ขอบคุณสำหรับการจอง" } as Localized<string>,
    subtitle: {
      en: "We received your request and will confirm availability shortly.",
      th: "เราได้รับคำขอแล้วและจะยืนยันความพร้อมในไม่ช้า",
    } as Localized<string>,
    fareTotal: { en: "Fare total", th: "ราคารวม" } as Localized<string>,
    makeDeposit: { en: "Make a 100% deposit to confirm your booking.", th: "ชำระเงินเต็มจำนวนเพื่อยืนยันการจอง" } as Localized<string>,
    sendSlip: { en: "Send your payment slip", th: "ส่งสลิปการชำระเงิน" } as Localized<string>,
    email: { en: "Email", th: "อีเมล" } as Localized<string>,
    whatsapp: { en: "WhatsApp", th: "วอทส์แอป" } as Localized<string>,
    willConfirm: { en: "We will confirm your booking within 24 hours.", th: "เราจะยืนยันการจองภายใน 24 ชั่วโมง" } as Localized<string>,
    backHome: { en: "Back to home", th: "กลับหน้าหลัก" } as Localized<string>,
    newBooking: { en: "New booking", th: "จองใหม่" } as Localized<string>,
    chatWhatsApp: { en: "Chat on WhatsApp", th: "แชททาง WhatsApp" } as Localized<string>,
  },
  confirmPage: {
    title: { en: "Confirmation", th: "ยืนยัน" } as Localized<string>,
    subtitle: {
      en: "Please return to the booking flow to review and confirm your request.",
      th: "กรุณากลับไปที่ขั้นตอนการจองเพื่อทบทวนและยืนยันคำขอ",
    } as Localized<string>,
    backToBooking: { en: "Go to booking", th: "ไปที่การจอง" } as Localized<string>,
  },
} as const

export type BookingText = typeof bookingText
