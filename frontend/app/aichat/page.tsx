"use client"

import { useState } from "react"
import Link from "next/link"

type Msg = { id: string; role: "assistant" | "user"; content: string }

export default function AIChatPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { id: "m0", role: "assistant", content: "Hi! How can I help with your transfer today?" },
  ])
  const [text, setText] = useState("")

  const whatsapp = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, "")
  const whatsappHref = `https://wa.me/${whatsapp}`

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    const userMsg: Msg = { id: `u-${Date.now()}`, role: "user", content: value }
    setMessages((m) => [...m, userMsg])
    setText("")

    // TODO: Call your chat API here and push assistant reply.
    // For now, show an acknowledgment.
    const ack: Msg = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content:
        "Thanks for your message! We’ll review and get back shortly. For urgent requests, tap WhatsApp below.",
    }
    setMessages((m) => [...m, ack])
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6">
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
                m.role === "user"
                  ? "ml-auto bg-primary text-white"
                  : "mr-auto bg-slate-100 text-slate-800"
              }`}
            >
              {m.content}
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
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            >
              Send
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
    </main>
  )
}