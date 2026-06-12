"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "bot"; text: string };

// Persist the conversation in the browser tab (cleared when the tab closes).
const STORAGE_KEY = "cho-chat-history";
const MAX_HISTORY = 10; // keep the last 10 messages

const TOPICS = [
  "Tracebility",
  "Craftmanship",
  "Authenticity",
  "Naturally Sourced",
  "Monofloral",
  "Purity",
];

const QUESTIONS = [
  "How do I know the honey is pure?",
  "Best way to eat Litchi Honey?",
  "Tell me more about bees in Muzaffarpur?",
];

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" aria-hidden>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export default function ChatPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as Message[]) : [];
    } catch {
      return [];
    }
  });
  const [show, setShow] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Trigger the open animation on mount.
  useEffect(() => {
    const r = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  // Persist the most recent messages to sessionStorage.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-MAX_HISTORY))
      );
    } catch {
      // ignore storage errors (e.g. private mode / quota)
    }
  }, [messages]);

  // Replace the last (bot) message's text as tokens stream in.
  const updateLastBot = (text: string) =>
    setMessages((m) => {
      const copy = [...m];
      copy[copy.length - 1] = { role: "bot", text };
      return copy;
    });

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }, { role: "bot", text: "" }]);
    setStreaming(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok || !res.body) throw new Error("request failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        updateLastBot(acc);
      }
    } catch {
      updateLastBot("Sorry, something went wrong. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div
      className={`flex h-[85vh] max-h-none w-[92vw] max-w-[380px] origin-bottom-right flex-col overflow-hidden rounded-[28px] border border-white/40 bg-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 ease-out md:h-[80vh] md:max-h-160 ${
        show ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-90 opacity-0"
      }`}
    >
      {/* Header */}
      <div className="m-2 flex items-center gap-3 rounded-[22px] border border-white/50 bg-[#E5AF62] px-3 py-2.5 shadow-sm ">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-cream md:h-11 md:w-11">
          <Image src="/chat-bee.png" alt="" width={132} height={132} className="h-9 w-9 object-contain md:h-11 md:w-11" />
        </span>
        <div className="flex-1 leading-tight ">
          <p className="text-sm font-bold text-maroon md:text-base">Ask our Chief Honey Officer</p>
          <p className="flex items-center gap-1.5 text-[10px] text-maroon/70 md:text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
           <span className="text-maroon"> Online</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex h-[24.61px] w-[24.61px] shrink-0 items-center justify-center rounded-sm bg-black/10 p-1.5 backdrop-blur-[2px] transition hover:bg-black/20"
        >
          <Image src="/cross.svg" alt="" width={21} height={21} unoptimized className="h-full w-full object-contain" />
        </button>
      </div>

      {/* Topic chips — hidden once the conversation starts */}
      {messages.length === 0 && (
      <div className="flex flex-wrap justify-center gap-2.5 px-4 pb-2 pt-1">
        {TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            className="rounded-full bg-[#FFF9EE] px-3 py-1.5 text-xs font-medium text-black shadow-md transition hover:bg-[#FFF9EE]/90 md:px-4 md:py-2 md:text-sm"
          >
            {t}
          </button>
        ))}
      </div>
      )}

      {/* Messages area (grows to fill) */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-sm md:text-sm ${
                m.role === "user"
                  ? "bg-[#4D0000] text-white"
                  : "bg-white text-[#4D0000]"
              }`}
            >
              {m.role === "user" ? (
                m.text
              ) : m.text ? (
                <div className="space-y-1.5 break-words [&_a]:underline [&_h1]:text-sm [&_h1]:font-bold [&_h2]:font-bold [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:leading-snug [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-4">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
              ) : (
                <span className="inline-flex gap-1 py-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4D0000]/50" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4D0000]/50 [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4D0000]/50 [animation-delay:0.3s]" />
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Suggested questions — hidden once the conversation starts */}
      {messages.length === 0 && (
      <div className="flex flex-col gap-2.5 px-4 pb-2">
        {QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setInput(q)}
            className="flex items-center gap-2 rounded-full border border-white/25 bg-[#FFF9EE] px-3 py-2.5 text-left text-xs font-medium text-black shadow-md transition hover:bg-[#FFF9EE]/20 md:px-4 md:py-3 md:text-sm"
          >
            <span className="shrink-0 text-black/80">
              <PlusIcon />
            </span>
            {q}
          </button>
        ))}
      </div>
      )}

      {/* Input + send */}
      <div className="p-3">
        <div className="  bg-[#E5AF62] rounded-full">
        <div className="flex items-center gap-2 rounded-full bg-gold py-1.5 pl-5 pr-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your message"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#4D0000] outline-none placeholder:text-[#4D0000]/60 md:text-base"
          />
          <button
            type="button"
            onClick={send}
            aria-label="Send message"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4D0000] transition hover:opacity-90 md:h-11 md:w-11"
          >
            <Image
              src="/share.png"
              alt=""
              width={41}
              height={39}
              className="h-4 w-4 object-contain md:h-5 md:w-5"
            />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
