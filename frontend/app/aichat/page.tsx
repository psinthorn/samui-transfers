"use client"

import { useState } from "react"
import Link from "next/link"

type Msg = { id: string; role: "assistant" | "user"; content: string }

export default function AIChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "assistant", content: "Hi! How can I help with your transfer today?" },
  ])
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)

  const whatsapp = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, "")
  const whatsappHref = `https://wa.me/${whatsapp}`

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value || sending) return

    // 1) Append user message
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: value }
    setMessages((m) => [...m, userMsg])
    setText("")

    // 2) Add assistant placeholder
    const draftId = `a-${Date.now()}`
    const draft: Msg = { id: draftId, role: "assistant", content: "" }
    setMessages((m) => [...m, draft])
    setSending(true)

    try {
      // Build payload: role/content only
      const payload = {
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      }

      const reply = await callChatBackend(payload)

      setMessages((m) =>
        m.map((msg) => (msg.id === draftId ? { ...msg, content: reply || "Thanks! How else can I help?" } : msg)),
      )
    } catch (err: any) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === draftId
            ? { ...msg, content: "Sorry, I couldn’t reach the assistant. Please try again or use WhatsApp below." }
            : msg,
        ),
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Support</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-semibold text-slate-900">AI Chat</h1>
        <p className="mt-1 text-sm text-slate-600">Ask about routes, vehicles, or booking. Mobile‑friendly.</p>
      </header>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm min-h-[60vh] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "ml-auto bg-primary text-white" : "mr-auto bg-slate-100 text-slate-800"
              }`}
            >
              {m.content || (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                  </svg>
                  Typing…
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Composer */}
        <form onSubmit={send} className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <input
              aria-label="Message"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending}
              aria-busy={sending}
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
          <div className="mt-3 text-center">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Chat on WhatsApp
            </a>
            <span className="ml-2 text-xs text-slate-500 align-middle">Faster for urgent requests</span>
          </div>
        </form>
      </section>
      </div>
    </main>
  )
}

// Call your backend chatbot endpoint. Configure NEXT_PUBLIC_CHAT_API or default to /api/chat.
async function callChatBackend(payload: { messages: { role: string; content: string }[] }) {
  const endpoint = process.env.NEXT_PUBLIC_CHAT_API || "/api/ai-agent"
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errText = await safeReadText(res)
    throw new Error(errText || `Request failed: ${res.status}`)
  }

  // Try JSON first
  const ctype = res.headers.get("content-type") || ""
  if (ctype.includes("application/json")) {
    const data = await res.json()
    return extractReply(data)
  }

  // Fallback: plain text
  return (await res.text()) || ""
}

function extractReply(data: any): string {
  // Common shapes: { reply }, { message }, { messages: [{role,content}] }, OpenAI-like { choices[0].message.content }
  if (typeof data === "string") return data
  if (typeof data?.reply === "string") return data.reply
  if (typeof data?.message === "string") return data.message
  if (Array.isArray(data?.messages) && data.messages.length) {
    const last = data.messages[data.messages.length - 1]
    if (typeof last?.content === "string") return last.content
  }
  const choice = data?.choices?.[0]
  if (typeof choice?.message?.content === "string") return choice.message.content
  try {
    return JSON.stringify(data)
  } catch {
    return "OK"
  }
}

async function safeReadText(res: Response) {
  try {
    return await res.text()
  } catch {
    return ""
  }
}