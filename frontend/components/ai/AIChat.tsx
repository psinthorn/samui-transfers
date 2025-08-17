import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

type AgentType = "booking" | "support";

interface ChatMessage {
  user?: string;
  agent?: string;
  ts: number; // Unix ms timestamp
}

function formatTimestamp(ts: number) {
  // Force display in Thailand time (UTC+07:00) irrespective of client locale
  const d = new Date(ts);
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000; // to UTC
  const bangkok = new Date(utcMs + 7 * 60 * 60 * 1000); // add 7h
  const dd = String(bangkok.getDate()).padStart(2, '0');
  const mm = String(bangkok.getMonth() + 1).padStart(2, '0');
  const yyyy = bangkok.getFullYear();
  const hh = String(bangkok.getHours()).padStart(2, '0');
  const min = String(bangkok.getMinutes()).padStart(2, '0');
  // Chosen standard: append explicit UTC offset for global clarity
  return `${dd}/${mm}/${yyyy} ${hh}:${min} (UTC+07:00)`;
}

const agents: { label: string; value: AgentType }[] = [
  { label: "Booking", value: "booking" },
  { label: "Support", value: "support" },
];

const AIChat: React.FC = () => {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [agent, setAgent] = useState<AgentType>("booking");
  const [loading, setLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch("/api/ai-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, agent }),
    });
    const data = await res.json();
    // Prepend new user + agent reply so newest pair is at the top
    const now = Date.now();
    setChat(prev => [
      { user: message, ts: now },
      { agent: data.reply, ts: Date.now() },
      ...prev
    ]);
    setMessage("");
    setLoading(false);
  };

  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAgent(e.target.value as AgentType);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  // Auto-scroll to bottom when chat updates
  useEffect(() => {
    if (containerRef.current) {
      // Always show newest messages (which are prepended) at the top
      containerRef.current.scrollTop = 0;
    }
  }, [chat, loading]);

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <div className="mb-2">
        <select value={agent} onChange={handleAgentChange} className="border rounded p-2">
          {agents.map(a => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div ref={containerRef} className="h-80 overflow-y-auto border rounded mb-4 p-4 bg-gray-50 space-y-8">
        {chat.map((msg, i) =>
        msg.user ? (
        <div
            key={i}
            className="text-right"
        >
            <div className="inline-block bg-white shadow-sm border border-blue-100 rounded-2xl px-5 py-3 text-gray-800 max-w-[75%] text-sm leading-relaxed whitespace-pre-wrap">
              {msg.user}
              <span className="block mt-1 text-[10px] text-gray-400" title="Asia/Bangkok (ICT)">{formatTimestamp(msg.ts)}</span>
            </div>
        </div>
        ) : (
        <div
            key={i}
            className="text-left"
        >
            <div className="inline-block bg-primary/5 shadow-sm border border-primary/20 rounded-2xl px-5 py-3 text-primary max-w-[75%] text-sm leading-relaxed prose prose-sm prose-primary whitespace-pre-wrap">
              <ReactMarkdown>{msg.agent ?? ""}</ReactMarkdown>
              <span className="block mt-1 text-[10px] text-primary/60" title="Asia/Bangkok (ICT)">{formatTimestamp(msg.ts)}</span>
            </div>
        </div>
        )
    )}
      </div>
     
    <div className="flex gap-2 items-end">
        <input
          value={message}
          onChange={handleInputChange}
      className="flex-1 border rounded p-3 text-sm"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          disabled={loading || !message}
          className="relative bg-primary text-white px-5 py-3 rounded disabled:opacity-50 flex items-center justify-center min-w-[90px]"
        >
          <span className={loading ? "opacity-0" : "opacity-100 transition-opacity"}>Send</span>
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-label="Sending" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIChat;