import React, { useState, ChangeEvent } from "react";
import ReactMarkdown from "react-markdown";

type AgentType = "booking" | "support";

interface ChatMessage {
  user?: string;
  agent?: string;
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

  const sendMessage = async () => {
    setLoading(true);
    const res = await fetch("/api/ai-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, agent }),
    });
    const data = await res.json();
    setChat([...chat, { user: message }, { agent: data.reply }]);
    setMessage("");
    setLoading(false);
  };

  const handleAgentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setAgent(e.target.value as AgentType);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

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

      <div className="h-64 overflow-y-auto border rounded mb-2 p-2 bg-gray-50">
        {chat.map((msg, i) =>
        msg.user ? (
        <div
            key={i}
            className="text-right mb-4"
        >
            <div className="inline-block bg-gray-100 border-l-4 border-blue-400 rounded px-4 py-2 text-gray-800">
            {msg.user}
            </div>
        </div>
        ) : (
        <div
            key={i}
            className="text-left mb-4"
        >
            <div className="inline-block bg-blue-50 border-l-4 border-primary rounded px-4 py-2 text-primary">
            <ReactMarkdown>{msg.agent ?? ""}</ReactMarkdown>
            </div>
        </div>
        )
    )}
      </div>
     
      <div className="flex gap-2">
        <input
          value={message}
          onChange={handleInputChange}
          className="flex-1 border rounded p-2"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          disabled={loading || !message}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AIChat;