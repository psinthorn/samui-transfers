import { NextResponse } from "next/server"
import OpenAI from "openai"
import * as cheerio from "cheerio"
import { db } from "@/lib/db"

export const runtime = "nodejs"

// Helper: Scrape headings and paragraphs from target website
async function scrapeWebsite(url: string) {
  try {
    const res = await fetch(url)
    const html = await res.text()
    const $ = cheerio.load(html)

    const headings: string[] = []
    $("h1, h2, h3").each((_, el) => {
      headings.push($(el).text().trim())
    })
    const paragraphs: string[] = []
    $("p").each((i, el) => {
      if (i < 5) paragraphs.push($(el).text().trim())
    })

    return { headings, paragraphs }
  } catch (err) {
    return { headings: [], paragraphs: [] }
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const { message, agent, locale } = body || {}
    if (!message || typeof message !== "string") {
      return NextResponse.json({ message: "message is required" }, { status: 400 })
    }

    // Scrape data from your target website (best-effort)
    const scraped = await scrapeWebsite("http://localhost:3000")

    // Agent routing via prompt engineering
    let systemPrompt = "You are a helpful assistant."
    if (agent === "Assistant") {
      systemPrompt =
        "You are a support and booking agent for a transfer service. Your name is B. You are friendly, kind, helpful, and a sales professional. You are female."
    }

    // Load context from DB by agent key and locale, fallback to scraped or empty
    const key = agent ? `ai-agent-${String(agent).toLowerCase()}` : "ai-agent-default"
    const lang = typeof locale === "string" && locale ? locale : "en"

    let dbContext = await (db as any).chatbotContext.findFirst({
      where: { key, locale: lang, enabled: true },
      orderBy: { updatedAt: "desc" },
    })
    if (!dbContext) {
      dbContext = await (db as any).chatbotContext.findFirst({
        where: { key, enabled: true },
        orderBy: { updatedAt: "desc" },
      })
    }
    if (!dbContext) {
      dbContext = await (db as any).chatbotContext.findFirst({
        where: { key: "ai-agent-default", enabled: true },
        orderBy: { updatedAt: "desc" },
      })
    }

    const context = dbContext?.content || `Website Headings: ${scraped.headings.join(" | ")}\nKey Info: ${scraped.paragraphs.join(" | ")}`

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt + "\n" + context },
        { role: "user", content: message },
      ],
    })
    const reply = completion.choices[0]?.message?.content || ""

    return NextResponse.json({ reply }, { status: 200 })
  } catch (err: any) {
    console.error("/api/ai-agent error", err)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
