import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json().catch(() => ({} as any))
    if (!name || !email || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }
    // TODO: Implement nodemailer or SES integration; previously commented out in pages/api/contact.js
    return NextResponse.json({ message: "Messages sent successfully!" }, { status: 200 })
  } catch (err: any) {
    console.error("/api/contact error", err)
    return NextResponse.json({ message: "Failed to send messages." }, { status: 500 })
  }
}
