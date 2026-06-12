"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ChatPanel from "./ChatPanel";

// Shared glassmorphism background (green tint + white sheen).
const glassBg =
  "linear-gradient(0deg, rgba(75, 83, 32, 0.15), rgba(75, 83, 32, 0.15)), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))";

const GREETING = "Hi, I’m your Chief Honey Officer (CHO)";
const SECOND = "Ask the CHO";

const DELETE_MS = 35; // per-char delete speed
const TYPE_MS = 55; // per-char type speed
const SWITCH_PAUSE = 250; // gap between deleting and typing

export default function ChatWidget() {
  const [open, setOpen] = useState(false); // chat panel open/closed
  const [shown, setShown] = useState(false); // slide-in from the right
  const [text, setText] = useState(GREETING); // animated text
  const [showBee, setShowBee] = useState(true); // bee collapses on switch

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const raf = requestAnimationFrame(() => setShown(true));

    const typeChar = (s: string) => {
      if (s.length >= SECOND.length) return;
      const next = SECOND.slice(0, s.length + 1);
      setText(next);
      timers.push(setTimeout(() => typeChar(next), TYPE_MS));
    };

    const deleteChar = (s: string) => {
      if (s.length === 0) {
        timers.push(setTimeout(() => typeChar(""), SWITCH_PAUSE));
        return;
      }
      const next = s.slice(0, -1);
      setText(next);
      timers.push(setTimeout(() => deleteChar(next), DELETE_MS));
    };

    // After 2s: fade the bee out and start deleting the greeting.
    timers.push(
      setTimeout(() => {
        setShowBee(false);
        deleteChar(GREETING);
      }, 2000)
    );

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <ChatPanel onClose={() => setOpen(false)} />
      ) : (
        <>
      {/* Glass card: slides in from the right, then swaps text with a typewriter effect */}
      <div
        className={`md:flex hidden  items-center rounded-full border border-white/30 px-3 md:py-1 shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition-[transform,opacity] duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          shown ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
        }`}
        style={{ background: glassBg }}
      >
        {/* Bee collapses + fades when switching to the short text */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            showBee ? "mr-3 max-w-11 opacity-100" : "mr-0 max-w-0 opacity-0"
          }`}
        >
          <Image
            src="/chat-bee.png"
            alt=""
            width={132}
            height={132}
            className="h-11 w-11 shrink-0 object-contain"
          />
        </div>

        <span className="max-w-50 text-xl md:text-sm font-semibold leading-tight text-white">
          {text}
        </span>
      </div>

      {/* Circular glass chat button */}
      <button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.15)] backdrop-blur-[2px] transition hover:backdrop-blur-[5px]"
        style={{ background: glassBg }}
      >
        <Image
          src="/chat.png"
          alt="Chat"
          width={104}
          height={104}
          className="h-7 w-7 object-contain"
        />
      </button>
        </>
      )}
    </div>
  );
}
